# 五年三班大隊接力

國小高年級反霸凌課堂遊戲。老師把遊戲投影在教室前面，全班用平板（或舉手）投票，決定看到同學被欺負時要怎麼做。

## 執行

```bash
python -m venv .venv
.venv/Scripts/python -m pip install -r backend/requirements.txt
.venv/Scripts/python -m uvicorn app:app --app-dir backend --host 0.0.0.0 --port 8000
```

- 老師端（投影）：`http://localhost:8000`
- 學生端（平板）：掃投票畫面上的 QR code，或開 `http://<老師電腦的區網 IP>:8000/vote` 輸入房間碼
- 學生的平板要和老師電腦在同一個網路

## AI 角色反應

設定 `ANTHROPIC_API_KEY` 後，角色反應和課後討論問題會由 Claude 依全班投票結果產生。沒有金鑰也能玩，會自動改用預設劇情。

| 環境變數 | 用途 |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API 金鑰 |
| `GAME_MODEL` | 使用的模型，預設 `claude-opus-5-5` |
| `GAME_AI=off` | 強制關閉 AI，只用預設劇情 |

## 研究資料

每局的投票、角色反應與結局都記錄在 `data/game_logs.sqlite3`。遊戲結束畫面的「匯出研究紀錄」可以下載 CSV。

## 公開部署

專案附有 `Dockerfile`，可以部署到 Render、Google Cloud Run 等平台。部署時請設定：

| 環境變數 | 用途 |
|---|---|
| `TEACHER_CODE` | 老師通行碼。設定後要輸入才能開始遊戲，避免陌生人用掉 AI 額度（學生投票不需要） |
| `ADMIN_KEY` | 匯出研究紀錄的管理密碼。沒設定時只有伺服器本機能匯出 |
| `ANTHROPIC_API_KEY` | 選用，要用 AI 角色反應才需要 |
| `DATA_DIR` | 選用，紀錄檔存放的資料夾 |

注意事項：

- 房間存在伺服器記憶體裡，只能跑**一個執行個體**（Cloud Run 請設定最多 1 個 instance）。
- 多數雲端平台的免費方案在重新部署或休眠後會清空硬碟，`game_logs.sqlite3` 也會一起消失。正式收研究資料前，請先匯出 CSV，或改接雲端資料庫。
- 每個房間最多呼叫 AI 12 次（一局正常用 4 次），伺服器同時最多 300 個房間。

## 檔案

```
backend/app.py        房間投票、LLM 呼叫、紀錄
frontend/index.html   投影端
frontend/vote.html    學生投票頁
frontend/js/story.js  劇本（三章、選項、預設反應、結局）
frontend/js/sprites.js 像素美術（全部用程式繪製）
frontend/js/game.js   遊戲流程
```
