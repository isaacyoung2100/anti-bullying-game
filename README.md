# 五年三班大隊接力

國小高年級反霸凌課堂遊戲。老師把遊戲投影在教室前面，全班用平板（或舉手）投票，決定看到同學被欺負時要怎麼做。每次投票後有「老師時間」讓老師帶討論，討論完可以再投一次，比較討論前後的變化。

劇情全部固定，沒有使用 AI，老師可以事先審閱所有內容。使用前請先看教師手冊（`/guide`）。

## 執行

```bash
python -m venv .venv
.venv/Scripts/python -m pip install -r backend/requirements.txt
.venv/Scripts/python -m uvicorn app:app --app-dir backend --host 0.0.0.0 --port 8000
```

- 老師端（投影）：`http://localhost:8000`
- 教師手冊：`http://localhost:8000/guide`
- 學生端（平板）：掃投票畫面上的 QR code，或開 `http://<老師電腦的區網 IP>:8000/vote` 輸入房間碼
- 在本機執行時，學生的平板要和老師電腦在同一個網路

## 研究資料

每章的投票人數（含討論前後兩輪）、選出的行動與結局都記錄在 `data/game_logs.sqlite3`，不記錄學生姓名。遊戲結束畫面的「匯出研究紀錄」可以下載 CSV。

## 公開部署

專案附有 `Dockerfile`，可以部署到 Render、Google Cloud Run 等平台。部署時請設定：

| 環境變數 | 用途 |
|---|---|
| `TEACHER_CODE` | 老師通行碼。設定後要輸入才能開房間，避免陌生人亂開房間、灌紀錄（學生投票不需要） |
| `ADMIN_KEY` | 匯出研究紀錄的管理密碼。沒設定時只有伺服器本機能匯出 |
| `DATA_DIR` | 選用，紀錄檔存放的資料夾 |

注意事項：

- 房間存在伺服器記憶體裡，只能跑**一個執行個體**（Cloud Run 請設定最多 1 個 instance）。
- 多數雲端平台的免費方案在重新部署或休眠後會清空硬碟，`game_logs.sqlite3` 也會一起消失。正式收研究資料前，請先匯出 CSV，或改接雲端資料庫。
- 伺服器同時最多 300 個房間，每個房間最多 80 筆紀錄。

## 檔案

```
backend/app.py          房間投票、紀錄、匯出
frontend/index.html     投影端
frontend/vote.html      學生投票頁
frontend/guide.html     教師手冊
frontend/js/story.js    劇本（三章、選項、老師提問、後果、結局）
frontend/js/sprites.js  像素美術（全部用程式繪製）
frontend/js/game.js     遊戲流程
```
