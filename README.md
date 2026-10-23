# 五年三班大隊接力

反霸凌體驗遊戲（國小高年級）。開場選一個角色（阿哲、小雨、阿明），以第一人稱扮演被同學欺負的孩子，度過運動會前的一個禮拜，親身體會被欺負的人的感受。直向版面，手機直拿最好玩。

## 玩法與設計

- **心靈能量**：每次被嘲笑、被排擠就會下降；每天早上睡一覺、被善待時會回來一點。
- **說不出口**：能量太低時，有些選項會被劃掉，標示「你現在說不出口」，並顯示心裡具體在怕什麼。讓玩家體會：說不出口是因為處境太難，不是不夠勇敢。
- **心裡想的**：對話會同時顯示說出口的話和心裡真正的想法。
- **旁觀者是固定劇情**：欺負你的人和旁觀者怎麼做，玩家控制不了；週五老師一定會察覺並私下找你談。玩家的選擇只改變自己的感受和找誰說，不決定該不該被欺負。
- **一週回顧**：結尾顯示每天的心靈能量變化，以及「有人看到了卻沒說話」和「有人伸出手」的次數。
- **安全設計**：開場提醒（只描述內容會有嘲笑和排擠，不直接說破玩家的處境）、右上角隨時可以暫停（繼續、重新開始、回主畫面、離開遊戲），結尾一定有「這不是你的錯」和求助資源。

## 執行

純前端網站，不需要伺服器程式。因為使用 JavaScript 模組，要用本機網頁伺服器開啟，不能直接點兩下 `index.html`：

```bash
python -m http.server 8000 --directory frontend
```

然後開啟 `http://localhost:8000`。

## 部署

整個 `frontend` 資料夾就是網站，可以部署到任何靜態網站服務，免費而且不會休眠：

- **Render**：新增 Static Site，Publish directory 填 `frontend`，Build command 留空。
- **GitHub Pages**：把 `frontend` 的內容放到 Pages 指定的資料夾。
- **單一檔案（Claude Artifacts 等）**：執行 `python tools/build_artifact.py`，會把整個遊戲打包成 `dist/artifact.html`。

## 研究資料

遊戲不收集任何資料。研究需要的前後測，請另外用表單（例如 Google 表單）在遊戲前後施測。進行任何研究或試玩前，請先讀 `docs/研究施測安全流程.md`。

## 檔案

```
frontend/index.html      遊戲頁面
frontend/css/style.css   樣式
frontend/js/story.js     共用設定（角色名字、心靈能量、求助專線、志豪的內心話）
frontend/js/stories/     三個角色的劇本（五天的情境、選項、結局）
frontend/js/sprites.js   像素美術（全部用程式繪製）
frontend/js/game.js      遊戲流程
tools/build_artifact.py  打包成單一 HTML 檔
tools/simulate.mjs       模擬所有選擇路徑，檢查數值平衡
tools/export_script.mjs  產生 docs/劇本.md
docs/由來.md             遊戲由來與設計演變（手寫）
docs/研究施測安全流程.md  研究或試玩時必須遵守的安全程序
```
