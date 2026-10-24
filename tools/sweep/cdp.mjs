// 用 Edge 的 DevTools 協定操作頁面並截圖
// 用法：node cdp.mjs <url> <script.js>
// script.js 匯出 default async ({ eval: ev, shot, sleep }) => {...}
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

// 截圖和報告放在 tools/sweep/out
const SP = fileURLToPath(new URL('./out', import.meta.url));
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const [url, scriptPath] = process.argv.slice(2);
const port = 9333;
const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${SP}\\edgecdp`, '--window-size=500,900', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (targets.some((t) => t.type === 'page')) break; } catch {}
  await sleep(200);
}
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') console.log('PAGE ERROR', m.params.exceptionDetails.url, m.params.exceptionDetails.lineNumber, m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  // console 的錯誤和警告、載入失敗的檔案
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning', 'assert'].includes(m.params.type)) console.log('CONSOLE', m.params.type, m.params.args.map((x) => x.value ?? x.description).join(' ').slice(0, 300));
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) console.log('HTTP', m.params.response.status, m.params.response.url);
  if (m.method === 'Network.loadingFailed' && !m.params.canceled) console.log('LOAD FAILED', m.params.errorText, m.params.type);
});
const send = (method, params = {}) => new Promise((r) => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });

await send('Emulation.setDeviceMetricsOverride', { width: +(process.env.VW || 390), height: +(process.env.VH || 844), deviceScaleFactor: +(process.env.DPR || 2), mobile: process.env.MOBILE ? true : !process.env.VW });
await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
// 模擬學校網路擋掉 Google 字型：BLOCK=fonts
if (process.env.BLOCK === 'fonts') await send('Network.setBlockedURLs', { urls: ['*fonts.googleapis.com*', '*fonts.gstatic.com*'] });
// 系統設定「減少動態效果」：MOTION=reduce
// 模擬舊平板：CPU=4（慢 4 倍）
if (process.env.CPU) await send('Emulation.setCPUThrottlingRate', { rate: +process.env.CPU });
if (process.env.MOTION === 'reduce') await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await send('Page.navigate', { url });
await sleep(2500);

const ev = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) console.log('ERR', JSON.stringify(r.result.exceptionDetails).slice(0, 400));
  return r.result?.result?.value;
};
const shot = async (name) => {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${SP}\\shot_${name}.png`, Buffer.from(r.result.data, 'base64'));
  console.log('shot', name);
};

const mod = await import(pathToFileURL(scriptPath).href);
try { await mod.default({ ev, shot, sleep, send }); } finally { await Promise.race([send('Browser.close'), sleep(2000)]); ws.close(); proc.kill(); }
