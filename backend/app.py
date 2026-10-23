"""《五年三班大隊接力》後端

- 房間與投票：老師端建立房間，學生用平板輸入房間碼投票
- /api/react：LLM 依全班選擇產生角色反應（無金鑰或失敗時回 503，前端改用預設劇情）
- /api/debrief：LLM 產生給老師的課後討論問題
- /api/log、/api/export：記錄每局選擇，供研究評估使用
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
from typing import Literal

import anthropic
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import FileResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent.parent
FRONTEND = ROOT / "frontend"
DB_PATH = Path(os.environ.get("DATA_DIR", ROOT / "data")) / "game_logs.sqlite3"

MODEL = os.environ.get("GAME_MODEL", "claude-opus-5-5")
AI_ENABLED = os.environ.get("GAME_AI", "on") != "off"

# 公開部署時的保護
# TEACHER_CODE：有設定時，老師要輸入通行碼才能開始遊戲（學生投票不需要）
# ADMIN_KEY：匯出研究資料用的密碼；沒設定時只有這台電腦本機可以匯出
TEACHER_CODE = os.environ.get("TEACHER_CODE", "")
ADMIN_KEY = os.environ.get("ADMIN_KEY", "")
MAX_ROOMS = 300
AI_CALLS_PER_ROOM = 12  # 一局正常只會用到 4 次（3 章反應 + 1 次討論）
LOGS_PER_ROOM = 60

SPEAKERS = ["azhe", "xiaoyu", "aming", "zhihao", "jiajia", "teacher", "class", "narrator"]
EMOTIONS = ["neutral", "happy", "sad", "cry", "surprised", "angry"]

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
    """AI 與紀錄只開放給有開房間的老師端，避免公開網址被拿來亂呼叫。"""
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
        "ai_calls": 0, "logs": 0,
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


# ---------- LLM ----------

_client: anthropic.Anthropic | None = None


def client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        # 課堂上不能讓全班等太久：逾時短、只重試一次，失敗就交給前端的預設劇情
        _client = anthropic.Anthropic(timeout=25.0, max_retries=1)
    return _client


def _use_ai(code: str | None, token: str | None):
    room = _teacher_room(code, token)
    room["ai_calls"] += 1
    if room["ai_calls"] > AI_CALLS_PER_ROOM:
        raise HTTPException(503, "這一局的 AI 使用次數已達上限")


def ask_json(system: str, user: str, schema: dict) -> dict:
    if not AI_ENABLED:
        raise HTTPException(503, "AI 已關閉")
    try:
        response = client().beta.messages.create(
            model=MODEL,
            max_tokens=2000,
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            output_config={"effort": "low", "format": {"type": "json_schema", "schema": schema}},
            system=system,
            messages=[{"role": "user", "content": user}],
        )
    except anthropic.AuthenticationError:
        raise HTTPException(503, "沒有可用的 API 金鑰")
    except anthropic.APIConnectionError:
        raise HTTPException(503, "無法連線到 AI 服務")
    except anthropic.RateLimitError:
        raise HTTPException(503, "AI 服務忙碌中")
    except anthropic.APIStatusError as e:
        raise HTTPException(503, f"AI 服務錯誤（{e.status_code}）")
    except anthropic.AnthropicError:
        raise HTTPException(503, "AI 無法使用")
    except TypeError:
        # SDK 找不到任何金鑰或登入憑證時會丟出 TypeError
        raise HTTPException(503, "沒有可用的 API 金鑰")
    if response.stop_reason != "end_turn":
        raise HTTPException(503, f"AI 未完成回應（{response.stop_reason}）")
    text = next((b.text for b in response.content if b.type == "text"), "")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        raise HTTPException(503, "AI 回應格式錯誤")


REACT_SYSTEM = """你是兒童反霸凌教育遊戲《五年三班大隊接力》的編劇。
這個遊戲在台灣國小五、六年級的教室裡投影進行，由老師帶領，全班一起投票決定「旁觀者」要怎麼做。
你的工作：根據全班剛剛投票選出的行動，寫出接下來 2 到 3 句角色的反應，讓學生看到這個選擇真實的後果。

角色：
- azhe 阿哲：愛畫畫、衝動、坐不住（有注意力不足過動的特質，但劇中不直接貼標籤）
- xiaoyu 小雨：跑很快、話不多，單親家庭、家裡經濟辛苦
- aming 阿明：數學很好，媽媽來自越南，會說越南話
- zhihao 志豪：很會帶氣氛，常帶頭開玩笑（其實自己以前被笑過，這裡不要說破）
- jiajia 佳佳：班長
- teacher 林老師：導師
- class：全班同學一起說話或動作
- narrator：旁白，用括號描述動作或氣氛

寫作原則：
- 繁體中文、台灣國小生的口語，每句 40 字以內。
- 後果要真實：附和或沉默，就讓被針對的同學更受傷、更退縮；挺身而出或想辦法，就出現溫和、真實的改善，但不要一下子變得完美。
- 如果投票結果分歧（例如有一部分人選了附和），可以用一句話自然帶到班上不同的聲音。
- 不說教、不由老師講大道理，讓學生自己感受。
- 適合 10 到 12 歲：不出現暴力、自我傷害、髒話，也不要創造新的歧視性綽號或嘲笑字眼。
- 被針對的角色（target）一定要出現在反應裡。"""

REACT_SCHEMA = {
    "type": "object",
    "properties": {
        "lines": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "speaker": {"type": "string", "enum": SPEAKERS},
                    "emotion": {"type": "string", "enum": EMOTIONS},
                    "text": {"type": "string"},
                },
                "required": ["speaker", "emotion", "text"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["lines"],
    "additionalProperties": False,
}


class ReactRequest(BaseModel):
    chapter: str = Field(max_length=40)
    target: Literal["azhe", "xiaoyu", "aming"]
    situation: list[str] = Field(max_length=12)
    question: str = Field(max_length=200)
    chosen: str = Field(max_length=120)
    chosen_type: Literal["side", "silent", "defend", "help"]
    distribution: dict[str, float]
    mood: int


@app.post("/api/react")
def react(
    req: ReactRequest,
    x_room: str | None = Header(None),
    x_teacher_token: str | None = Header(None),
):
    _use_ai(x_room, x_teacher_token)
    user = json.dumps(req.model_dump(), ensure_ascii=False, indent=1)
    data = ask_json(REACT_SYSTEM, f"這一章的情境與全班投票結果如下：\n{user}", REACT_SCHEMA)
    lines = [
        {"speaker": l["speaker"], "emotion": l["emotion"], "text": l["text"].strip()[:80]}
        for l in data.get("lines", [])
        if l.get("text", "").strip()
    ][:4]
    if not lines:
        raise HTTPException(503, "AI 沒有產生內容")
    return {"lines": lines, "model": MODEL}


DEBRIEF_SYSTEM = """你是協助國小高年級導師帶領反霸凌討論的輔導老師。
老師剛剛帶全班玩完《五年三班大隊接力》，你會收到全班在三個霸凌情境中的投票結果。
請產生：
- summary：一句話（60 字內）描述這個班級這次的選擇傾向，語氣中性、不批判孩子。
- questions：3 個給老師在課堂上問全班的開放式討論問題，要扣住這個班實際的投票結果（例如某一題很多人選擇沉默），每題 50 字內，用老師對學生說話的口吻。
繁體中文。不要要求學生說出班上真實的人名或事件。"""

DEBRIEF_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "questions": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["summary", "questions"],
    "additionalProperties": False,
}


class DebriefRequest(BaseModel):
    choices: list[dict] = Field(max_length=10)
    mood: int
    ending: str = Field(max_length=20)


@app.post("/api/debrief")
def debrief(
    req: DebriefRequest,
    x_room: str | None = Header(None),
    x_teacher_token: str | None = Header(None),
):
    _use_ai(x_room, x_teacher_token)
    user = json.dumps(req.model_dump(), ensure_ascii=False, indent=1)
    data = ask_json(DEBRIEF_SYSTEM, f"全班的選擇紀錄：\n{user}", DEBRIEF_SCHEMA)
    questions = [q.strip()[:120] for q in data.get("questions", []) if q.strip()][:3]
    if not questions:
        raise HTTPException(503, "AI 沒有產生內容")
    return {"summary": data.get("summary", "").strip()[:120], "questions": questions}


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
        "ok": True, "ai": AI_ENABLED, "model": MODEL,
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


app.mount("/", StaticFiles(directory=FRONTEND), name="static")
