"""後端的檢查：pytest backend/test_app.py（不會真的呼叫 Gemini）"""

import pytest
from fastapi.testclient import TestClient

import app as server

FACTS = {
    "lang": "zh",
    "role": "阿明",
    "days": [
        {"day": "週一", "weather": "下雨", "feel": "害怕",
         "chose": [{"text": "低下頭，看著自己的課本。", "brave": False, "cant": ["站起來說：「不要這樣叫我。」"]}],
         "noticed": []},
        {"day": "週二", "weather": "陰天", "feel": None, "chose": [],
         "noticed": [{"who": "小晴", "text": "走過去，把她掉的筆撿起來。", "did": True}]},
    ],
}
GOOD = server.Summary(summary="這週你心裡的天氣從下雨慢慢變好。週二你把小晴的筆撿起來，這是很溫暖的一件小事。", share="我這週幫小晴撿了筆。")


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(server, "API_KEY", "test")
    server.recent.clear()
    server.today.update(date="", count=0)

    async def fake(facts):
        return GOOD

    monkeypatch.setattr(server, "generate", fake)
    return TestClient(server.app)


def test_summary_ok(client):
    r = client.post("/summary", json=FACTS)
    assert r.status_code == 200
    assert r.json()["share"] == GOOD.share


def test_no_key_means_local_summary(client, monkeypatch):
    monkeypatch.setattr(server, "API_KEY", "")
    assert client.post("/summary", json=FACTS).status_code == 503


def test_rejects_long_or_extra_input(client):
    long = {**FACTS, "role": "字" * 100}
    assert client.post("/summary", json=long).status_code == 422
    many = {**FACTS, "days": FACTS["days"] * 5}
    assert client.post("/summary", json=many).status_code == 422


def test_rate_limit_per_ip(client):
    codes = [client.post("/summary", json=FACTS, headers={"X-Forwarded-For": "1.2.3.4"}).status_code for _ in range(7)]
    assert codes[: server.PER_IP] == [200] * server.PER_IP
    assert codes[-1] == 503
    # 別的來源不受影響
    assert client.post("/summary", json=FACTS, headers={"X-Forwarded-For": "5.6.7.8"}).status_code == 200


def test_daily_limit(client, monkeypatch):
    monkeypatch.setattr(server, "DAILY_LIMIT", 2)
    codes = [client.post("/summary", json=FACTS, headers={"X-Forwarded-For": f"9.9.9.{i}"}).status_code for i in range(3)]
    assert codes == [200, 200, 503]


def test_bad_ai_output_is_dropped(client, monkeypatch):
    async def labels(facts):
        return server.Summary(summary="你這週有點冷漠，沒有幫助別人，下次要更勇敢一點喔。", share="我很冷漠。")

    monkeypatch.setattr(server, "generate", labels)
    assert client.post("/summary", json=FACTS).status_code == 503


def test_ai_error_or_timeout(client, monkeypatch):
    async def boom(facts):
        raise RuntimeError("quota exceeded")

    monkeypatch.setattr(server, "generate", boom)
    assert client.post("/summary", json=FACTS).status_code == 503


def test_cors_only_for_the_game(client):
    ok = client.options("/summary", headers={"Origin": "https://isaacyoung2100.github.io", "Access-Control-Request-Method": "POST"})
    assert ok.headers.get("access-control-allow-origin") == "https://isaacyoung2100.github.io"
    bad = client.options("/summary", headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"})
    assert "access-control-allow-origin" not in bad.headers
