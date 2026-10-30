"""「這週的你」AI 總結的後端（FastAPI，放在 Hugging Face Spaces）

遊戲在學生的瀏覽器裡跑；只有到反思頁時，瀏覽器會把「這週的事實」送到這裡，
這裡加上寫作規則、用藏起來的金鑰請 Gemini 寫幾句話，檢查過再送回去。

送來的事實只有劇本裡寫好的句子（選了哪個選項、說不出口的選項、注意到誰）、
心裡的天氣、日記從詞表裡選的情緒詞；沒有學生自己打的字，也沒有名字和座號。
這裡不保存任何內容，也不寫進紀錄檔。

任何問題（沒有金鑰、太多人在用、今天的免費額度用完、AI 太慢、內容沒通過檢查）
都回傳 503，遊戲就改用程式組的總結，學生不會看到錯誤訊息。
"""

import asyncio
import json
import os
import time
from collections import defaultdict, deque
from typing import Annotated, Literal

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ---------- 設定（都可以用 Hugging Face 的 Variables / Secrets 改） ----------

API_KEY = os.environ.get("GEMINI_API_KEY", "")
# 預設用 Google 會自動指向最新版的別名；免費方案能用哪些模型會變，必要時在 Variables 改 MODEL
MODEL = os.environ.get("MODEL", "gemini-flash-lite-latest")
ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "https://isaacyoung2100.github.io,http://localhost:8000,http://127.0.0.1:8000",
).split(",")
PER_IP = int(os.environ.get("PER_IP", "5"))            # 同一個來源，每 10 分鐘最多幾次
DAILY_LIMIT = int(os.environ.get("DAILY_LIMIT", "500"))  # 全站每天最多幾次（低於免費額度）
TIMEOUT = float(os.environ.get("TIMEOUT", "12"))

# ---------- 送進來的事實：每個欄位都有長度上限（和 tools/tests/summary.test.mjs 一致） ----------

Short = Annotated[str, Field(max_length=24)]
Line = Annotated[str, Field(max_length=200)]


class Chose(BaseModel):
    text: Line
    brave: bool = False  # 需要勇氣才選得到的選項
    cant: list[Line] = Field(default=[], max_length=4)  # 當時說不出口的選項


class Noticed(BaseModel):
    who: Short
    text: Line
    did: bool  # 有沒有做一點什麼


class Day(BaseModel):
    day: Annotated[str, Field(max_length=16)]
    weather: Annotated[str, Field(max_length=16)]
    feel: Short | None = None
    chose: list[Chose] = Field(default=[], max_length=6)
    noticed: list[Noticed] = Field(default=[], max_length=3)


class Facts(BaseModel):
    lang: Literal["zh", "en"]
    role: Short
    days: list[Day] = Field(max_length=7)


class Summary(BaseModel):
    summary: str
    share: str


# ---------- 寫作規則 ----------

RULES = {
    "zh": """你在一個反霸凌教育遊戲裡，替國小五、六年級的學生寫「這週的你」。
學生剛扮演 JSON 裡的 role（一個被欺負的孩子），過了運動會前的一個禮拜。
JSON 是程式整理好的事實：每天心裡的天氣（weather）、學生做的選擇（chose，brave 表示需要勇氣才選得到）、
當時想選卻說不出口的選項（cant）、注意到別的同學被欺負時做了什麼（noticed，did 表示有做一點什麼）、
日記裡選的情緒詞（feel）。

規則：
1. 只寫 JSON 裡有的事。不要編造情節、人名、對話或結果。
2. 用「你」稱呼學生。語氣溫暖、具體，用五年級看得懂的字，繁體中文。
3. 不打分數、不比較、不貼標籤、不說教；不要說學生不夠勇敢、冷漠，或「你應該」怎樣。
4. 如果有說不出口的時候，要讓學生知道：說不出口不是他的錯。
5. 不做診斷，也不評論學生的心理狀態。
6. summary：3 到 4 句，最多 150 個字。挑一兩個具體的選擇來說，不要逐日流水帳。
7. share：要給朋友看的一句話，用「我」開頭，最多 30 個字，只說做了什麼，不提難過的細節。""",
    "en": """You write "You this week" for 5th and 6th graders in an anti-bullying education game.
The student just played the role in the JSON (a child being bullied) through the week before Sports Day.
The JSON holds facts prepared by the game: each day's weather in their heart (weather), the choices they made
(chose; brave means it took courage to pick), options they wanted but could not bring themselves to pick (cant),
what they did when they noticed other classmates being bullied (noticed; did means they did a little something),
and the feeling word picked in their diary (feel).

Rules:
1. Only write about things in the JSON. Do not invent events, names, dialogue, or outcomes.
2. Speak to the student as "you". Be warm and specific, with words a 5th grader knows.
3. No scores, comparisons, labels, or lectures; never say they were not brave enough, uncaring, or that they "should" do something.
4. If there were things they could not say, let them know that is not their fault.
5. No diagnosis and no comments on their mental state.
6. summary: 3 to 4 sentences, at most 90 words. Pick one or two concrete choices; do not list every day.
7. share: one sentence for friends, starting with "I", at most 25 words, about what they did, without sad details.""",
}

# 和 frontend/js/summary.js 的 checkSummary 一樣
LIMITS = {"zh": (220, 40), "en": (900, 160)}
BANNED = {
    "zh": ["冷漠", "懦弱", "膽小", "沒用", "活該", "失敗", "不夠勇敢", "你應該", "分數", "及格", "自殺", "<", "http"],
    "en": ["coward", "weak", "useless", "deserve", "failure", "not brave enough", "you should", "score", "suicide", "<", "http"],
}


def check(out: Summary, lang: str) -> bool:
    text, share = out.summary.strip(), out.share.strip()
    max_text, max_share = LIMITS[lang]
    if not (20 <= len(text) <= max_text and 4 <= len(share) <= max_share):
        return False
    if lang == "zh" and not any("一" <= ch <= "鿿" for ch in text):
        return False
    words = f"{text} {share}".lower()
    return not any(w in words for w in BANNED[lang])


# ---------- 呼叫 Gemini（測試時換成假的） ----------

_client = None


async def generate(facts: Facts) -> Summary:
    global _client
    from google import genai
    from google.genai import types

    if _client is None:
        _client = genai.Client(api_key=API_KEY)
    res = await _client.aio.models.generate_content(
        model=MODEL,
        contents=json.dumps(facts.model_dump(), ensure_ascii=False),
        config=types.GenerateContentConfig(
            system_instruction=RULES[facts.lang],
            response_mime_type="application/json",
            response_schema=Summary,
            max_output_tokens=2048,
            temperature=0.6,
        ),
    )
    return Summary.model_validate_json(res.text)


# ---------- 防止被刷：同一個來源的次數、全站每天的次數 ----------

recent: dict[str, deque] = defaultdict(deque)
today = {"date": "", "count": 0}


def allow(ip: str) -> bool:
    now = time.time()
    date = time.strftime("%Y-%m-%d", time.gmtime(now))
    if today["date"] != date:
        today.update(date=date, count=0)
        recent.clear()
    q = recent[ip]
    while q and now - q[0] > 600:
        q.popleft()
    if len(q) >= PER_IP or today["count"] >= DAILY_LIMIT:
        return False
    q.append(now)
    today["count"] += 1
    return True


def client_ip(request: Request) -> str:
    # Hugging Face 前面有一層代理：真正的來源在 X-Forwarded-For 的第一個
    fwd = request.headers.get("x-forwarded-for", "")
    return fwd.split(",")[0].strip() or (request.client.host if request.client else "?")


# ---------- API ----------

app = FastAPI(title="anti-bullying-game AI summary", docs_url=None, redoc_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health():
    # 遊戲一開始會先呼叫這裡，把睡著的主機叫醒
    return {"ok": True, "ai": bool(API_KEY)}


@app.post("/summary")
async def summary(facts: Facts, request: Request) -> Summary:
    if not API_KEY or not allow(client_ip(request)):
        raise HTTPException(503, "use local summary")
    try:
        out = await asyncio.wait_for(generate(facts), TIMEOUT)
    except Exception:  # 額度用完、太慢、格式不對：都改用遊戲裡的總結
        raise HTTPException(503, "use local summary")
    if not check(out, facts.lang):
        raise HTTPException(503, "use local summary")
    return Summary(summary=out.summary.strip(), share=out.share.strip())
