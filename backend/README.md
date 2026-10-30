---
title: anti-bullying-game AI summary
emoji: 📝
colorFrom: yellow
colorTo: red
sdk: docker
app_port: 7860
pinned: false
---

# 「這週的你」AI 總結後端

《五年三班大隊接力》的反思頁有一段「這週的你」。遊戲在學生的瀏覽器裡跑，只有到反思頁時，
瀏覽器會把這週的**事實**送到這裡，由 Gemini 寫成三、四句給孩子看的話。

```
遊戲（GitHub Pages，學生的瀏覽器）
  → 這個後端（FastAPI：藏金鑰、限制次數、檢查輸出）
  → Gemini（免費方案）
```

## 送什麼、不送什麼

| 會送出去 | 不會送出去 |
|---|---|
| 扮演的角色、每天心裡的天氣 | 日記裡寫的字 |
| 選了哪個選項（劇本裡寫好的句子） | 自己取的情緒詞 |
| 當時說不出口的選項 | 名字、座號 |
| 注意到誰、有沒有做一點什麼 | |
| 日記從詞表裡選的情緒詞 | |

後端不保存任何內容，也不寫進紀錄檔。

## 失敗時

沒有金鑰、同一個來源 10 分鐘內超過 5 次、全站今天超過 500 次、Gemini 的免費額度用完、
超過 12 秒、AI 寫的內容沒通過檢查（太長、貼標籤、不是中文……），都回傳 503。
遊戲收到 503 就改用程式依照選擇組出來的總結，學生不會看到錯誤訊息。

## 部署到 Hugging Face Spaces（免費，不用綁卡）

1. 到 [Google AI Studio](https://aistudio.google.com/) 用 Google 帳號建立一把 API 金鑰（免費方案，不用綁卡）。
2. 到 Hugging Face 建立一個新的 Space：SDK 選 **Docker**（Blank），Hardware 選免費的 CPU basic。
3. 把這個資料夾裡的 `README.md`、`Dockerfile`、`requirements.txt`、`app.py` 上傳到 Space（Files → Add file → Upload files）。
4. Space 的 Settings → **Secrets** 新增 `GEMINI_API_KEY`，貼上金鑰。金鑰不要放進 GitHub。
5. 等 Space 顯示 Running，打開 `https://<帳號>-<space 名稱>.hf.space/health`，看到 `{"ok":true,"ai":true}` 就好了。
6. 把這個網址填進遊戲的 `frontend/js/config.js` 的 `AI_URL`，推上 GitHub。

可以在 Settings → **Variables** 調整：

| 名稱 | 預設 | 用途 |
|---|---|---|
| `MODEL` | `gemini-flash-lite-latest` | Gemini 的模型；免費方案能用的模型會變，不能用時換一個 |
| `ALLOWED_ORIGINS` | 遊戲網址、localhost:8000 | 只回應這些網站來的請求 |
| `PER_IP` | 5 | 同一個來源每 10 分鐘最多幾次 |
| `DAILY_LIMIT` | 500 | 全站每天最多幾次 |
| `TIMEOUT` | 12 | 等 Gemini 最多幾秒 |

## 在自己的電腦上試

```bash
pip install -r requirements.txt pytest httpx
pytest test_app.py
GEMINI_API_KEY=你的金鑰 uvicorn app:app --port 7860
```

再把 `config.js` 的 `AI_URL` 暫時改成 `http://localhost:7860`，用 `python -m http.server 8000` 開遊戲。
