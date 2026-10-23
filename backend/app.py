"""《五年三班大隊接力》後端

- 房間與投票：老師端建立房間，學生用平板輸入房間碼投票
- /api/log、/api/export：記錄每局選擇（含討論前後兩輪投票），供研究評估使用

劇情全部固定在前端的 story.js，沒有使用 AI，老師可以事先審閱所有內容。
"""

import json
import os
import random
import secrets
import socket
import sqlite3
import string
import time
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import FileResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent.parent
FRONTEND = ROOT / "frontend"
DB_PATH = Path(os.environ.get("DATA_DIR", ROOT / "data")) / "game_logs.sqlite3"

# 公開部署時的保護
# TEACHER_CODE：有設定時，老師要輸入通行碼才能開房間（學生投票不需要），避免陌生人亂開房間、灌紀錄
# ADMIN_KEY：匯出研究資料用的密碼；沒設定時只有這台電腦本機可以匯出
TEACHER_CODE = os.environ.get("TEACHER_CODE", "")
ADMIN_KEY = os.environ.get("ADMIN_KEY", "")
MAX_ROOMS = 300
LOGS_PER_ROOM = 80

app = FastAPI(title="五年三班大隊接力")


@app.middleware("http")
async def no_cache(request: Request, call_next):
    # 遊戲更新後，教室的電腦和平板不會拿到舊版
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache"
    return response


# ---------- 資料紀錄 ----------

def db() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS events ("
        "id INTEGER PRIMARY KEY, ts REAL, session TEXT, kind TEXT, payload TEXT)"
    )
    return conn


class LogEvent(BaseModel):
    session: str = Field(max_length=64)
    kind: str = Field(max_length=32)
    payload: dict


@app.post("/api/log")
def log_event(
    ev: LogEvent,
    x_room: str | None = Header(None),
    x_teacher_token: str | None = Header(None),
):
    room = _teacher_room(x_room, x_teacher_token)
    room["logs"] += 1
    if room["logs"] > LOGS_PER_ROOM:
        raise HTTPException(429, "這個房間的紀錄已達上限。")
    with db() as conn:
        conn.execute(
            "INSERT INTO events (ts, session, kind, payload) VALUES (?, ?, ?, ?)",
            (time.time(), ev.session, ev.kind, json.dumps(ev.payload, ensure_ascii=False)),
        )
    return {"ok": True}


@app.get("/api/export", response_class=PlainTextResponse)
def export_csv(request: Request, x_admin_key: str | None = Header(None)):
    """匯出所有紀錄為 CSV（Excel 可直接開啟）。"""
    if ADMIN_KEY:
        if not x_admin_key or not secrets.compare_digest(x_admin_key, ADMIN_KEY):
            raise HTTPException(403, "管理密碼錯誤。")
    elif request.client is None or request.client.host not in ("127.0.0.1", "::1"):
        raise HTTPException(403, "只有在伺服器這台電腦上才能匯出。")
    with db() as conn:
        rows = conn.execute("SELECT ts, session, kind, payload FROM events ORDER BY id").fetchall()
    lines = ["time,session,kind,payload"]
    for ts, session, kind, payload in rows:
        stamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(ts))
        lines.append(f'{stamp},{session},{kind},"{payload.replace(chr(34), chr(34) * 2)}"')
    return PlainTextResponse("﻿" + "\n".join(lines), media_type="text/csv; charset=utf-8")


# ---------- 房間與投票 ----------
# 一堂課一個房間，存在記憶體即可；伺服器重開房間就會消失

ROOMS: dict[str, dict] = {}
ROOM_TTL = 6 * 3600


class VoteOption(BaseModel):
    id: str = Field(max_length=4)
    text: str = Field(max_length=120)


class OpenVote(BaseModel):
    qid: str = Field(max_length=32)
    question: str = Field(max_length=200)
    options: list[VoteOption] = Field(min_length=2, max_length=6)


class CastVote(BaseModel):
    voter: str = Field(min_length=4, max_length=64)
    qid: str = Field(max_length=32)
    option: str = Field(max_length=4)


def _cleanup_rooms():
    now = time.time()
    for code in [c for c, r in ROOMS.items() if now - r["created"] > ROOM_TTL]:
        del ROOMS[code]


def _room(code: str) -> dict:
    room = ROOMS.get(code)
    if not room:
        raise HTTPException(404, "找不到這個房間，請確認房間碼。")
    return room


def _teacher(room: dict, token: str | None):
    if not token or not secrets.compare_digest(token, room["token"]):
        raise HTTPException(403, "只有老師端可以操作。")


def _teacher_room(code: str | None, token: str | None) -> dict:
    """紀錄只接受有開房間的老師端，避免公開網址被拿來灌資料。"""
    room = ROOMS.get(code or "")
    if not room:
        raise HTTPException(403, "需要先建立房間。")
    _teacher(room, token)
    return room


def _public_state(room: dict) -> dict:
    counts = {o["id"]: 0 for o in room["options"]}
    for opt in room["votes"].values():
        if opt in counts:
            counts[opt] += 1
    return {
        "open": room["open"],
        "qid": room["qid"],
        "question": room["question"],
        "options": room["options"],
        "counts": counts,
        "total": sum(counts.values()),
    }


class CreateRoom(BaseModel):
    teacher_code: str = Field("", max_length=64)


@app.post("/api/rooms")
def create_room(body: CreateRoom | None = None):
    if TEACHER_CODE:
        given = body.teacher_code if body else ""
        if not secrets.compare_digest(given, TEACHER_CODE):
            raise HTTPException(403, "老師通行碼錯誤。")
    _cleanup_rooms()
    if len(ROOMS) >= MAX_ROOMS:
        raise HTTPException(429, "目前使用的人太多，請稍後再試。")
    code = "".join(random.choices(string.digits, k=4))
    while code in ROOMS:
        code = "".join(random.choices(string.digits, k=4))
    token = secrets.token_urlsafe(16)
    ROOMS[code] = {
        "token": token, "created": time.time(), "open": False,
        "qid": None, "question": "", "options": [], "votes": {},
        "logs": 0,
    }
    return {"code": code, "token": token}


@app.get("/api/rooms/{code}")
def room_state(code: str):
    return _public_state(_room(code))


@app.post("/api/rooms/{code}/open")
def open_vote(code: str, body: OpenVote, x_teacher_token: str | None = Header(None)):
    room = _room(code)
    _teacher(room, x_teacher_token)
    room.update(open=True, qid=body.qid, question=body.question,
                options=[o.model_dump() for o in body.options], votes={})
    return _public_state(room)


@app.post("/api/rooms/{code}/close")
def close_vote(code: str, x_teacher_token: str | None = Header(None)):
    room = _room(code)
    _teacher(room, x_teacher_token)
    room["open"] = False
    return _public_state(room)


@app.post("/api/rooms/{code}/vote")
def cast_vote(code: str, body: CastVote):
    room = _room(code)
    if not room["open"] or body.qid != room["qid"]:
        raise HTTPException(409, "現在沒有開放投票。")
    if body.option not in {o["id"] for o in room["options"]}:
        raise HTTPException(400, "沒有這個選項。")
    room["votes"][body.voter] = body.option  # 同一台裝置重投會覆蓋
    return {"ok": True}


def lan_ip() -> str | None:
    """找出這台電腦在區網的 IP，讓學生的平板可以連進來。"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("10.255.255.255", 1))  # 不會真的送出封包
            return s.getsockname()[0]
    except OSError:
        return None


@app.get("/api/health")
def health(request: Request):
    ip = lan_ip()
    port = request.url.port or 80
    return {
        "ok": True,
        "lan_base": f"http://{ip}:{port}" if ip else None,
        "teacher_code_required": bool(TEACHER_CODE),
    }


# ---------- 前端 ----------

@app.get("/")
def index():
    return FileResponse(FRONTEND / "index.html")


@app.get("/vote")
def vote_page():
    return FileResponse(FRONTEND / "vote.html")


@app.get("/guide")
def guide_page():
    return FileResponse(FRONTEND / "guide.html")


app.mount("/", StaticFiles(directory=FRONTEND), name="static")
