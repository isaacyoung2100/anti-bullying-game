import { fileURLToPath } from 'node:url';
// 一種螢幕大小，從標題玩到最後：每一種畫面第一次出現時截圖，每一步都檢查版面
// 檢查：面板沒有蓋住該蓋的範圍、東西跑出頁面、可以點的東西互相重疊、內容超出又不能捲、整頁橫向捲動、按鈕太小
import { writeFileSync } from 'node:fs';
// 截圖和報告放在 tools/sweep/out
const SP = fileURLToPath(new URL('./out', import.meta.url));
const TAG = process.env.TAG || 'x';
const ROLE = process.env.ROLE || 'xiaoyu';
const LANG = process.env.SHOT_LANG || 'zh';

const CHECK = `
  const $ = (s) => document.querySelector(s);
  const issues = [];
  const R = (e) => e.getBoundingClientRect();
  const shown = (e) => { if (!e || e.closest('[hidden]')) return false; const r = R(e); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
  const name = (e) => (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\\s+/).join('.') : '') || e.tagName;
  const vw = innerWidth, vh = innerHeight;
  if (document.documentElement.scrollWidth > vw + 1) issues.push('整頁可以橫向捲動 ' + document.documentElement.scrollWidth + '>' + vw);
  const layer = [$('#pause'), $('#panel')].find((p) => p && !p.hidden);
  let box;
  if (layer) {
    const cs = getComputedStyle(layer);
    if (cs.position !== 'absolute' || cs.display === 'contents') issues.push(name(layer) + ' 不是蓋在上面的一層（position ' + cs.position + ', display ' + cs.display + '）');
    const parent = layer.offsetParent;
    // 寬螢幕的暫停選單只蓋右頁，左頁用陰影變暗（設計如此）
    const wide = matchMedia('(min-width: 640px) and (min-aspect-ratio: 5/4)').matches;
    if (parent && !(wide && layer.id === 'pause')) {
      const a = R(layer), b = R(parent);
      if (Math.abs(a.left - b.left) > 2 || Math.abs(a.top - b.top) > 2 || Math.abs(a.right - b.right) > 2 || Math.abs(a.bottom - b.bottom) > 2) issues.push(name(layer) + ' 沒有蓋滿 ' + name(parent));
    }
    box = R(layer);
    // 內容比面板高，面板卻不能捲
    if (layer.scrollHeight > layer.clientHeight + 2 && !/auto|scroll/.test(cs.overflowY)) issues.push(name(layer) + ' 內容超出卻不能捲');
  } else {
    box = R($('#stage'));
  }
  const root = layer || $('#stage');
  const els = [...root.querySelectorAll('*')].filter(shown);
  for (const e of els) {
    const r = R(e);
    // 照片角落的紙膠帶故意凸出去
    const tapeOk = e.matches('.scene');
    if (['CANVAS'].includes(e.tagName) && !layer) continue;
    if (r.left < box.left - 2 || r.right > box.right + 2) { issues.push('跑出左右邊界：' + name(e) + ' [' + Math.round(r.left) + ',' + Math.round(r.right) + '] 範圍 [' + Math.round(box.left) + ',' + Math.round(box.right) + ']'); }
    if (r.right > vw + 1 || r.left < -1) issues.push('跑出螢幕：' + name(e));
    if (e.children.length === 0 && e.textContent.trim() && !['INPUT', 'TEXTAREA'].includes(e.tagName)) {
      const fs = parseFloat(getComputedStyle(e).fontSize);
      if (fs < 11) issues.push('字太小（' + fs.toFixed(1) + 'px）：' + name(e) + ' ' + e.textContent.trim().slice(0, 10));
    }
    if (!tapeOk && e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0 && !['hidden', 'clip'].includes(getComputedStyle(e).overflowX) && !['CANVAS', 'INPUT', 'TEXTAREA'].includes(e.tagName)) issues.push('文字橫向溢出：' + name(e));
  }
  // 可以點的東西：不能太小、不能互相重疊（被固定在底部的按鈕蓋住也算）
  const hits = els.filter((e) => e.matches('button, a.btn, .quad, .word, .choice, .pick, .role, textarea, input'));
  for (const e of hits) {
    const r = R(e);
    if (r.height < 32 && !e.matches('input, textarea')) issues.push('按鈕太小（高 ' + Math.round(r.height) + 'px）：' + name(e));
    // 被別的東西蓋住：看按鈕中間那一點最上面是誰
    const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
    if (cx > 0 && cx < vw && cy > 0 && cy < vh) {
      const top = document.elementFromPoint(cx, cy);
      if (top && !e.contains(top) && !top.contains(e)) issues.push('被蓋住：' + name(e) + ' 被 ' + name(top));
    }
    // 被外框切掉一部分，又不能捲動看到
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
      const ov = getComputedStyle(a).overflowY;
      if (ov === 'visible') continue;
      const c = R(a);
      const partial = (r.top < c.top - 1 || r.bottom > c.bottom + 1) && r.bottom > c.top && r.top < c.bottom;
      if (partial && a.scrollHeight <= a.clientHeight + 1) issues.push('被切掉一半：' + name(e) + ' 在 ' + name(a));
      break;
    }
  }
  const vis = (r) => r.bottom > Math.max(0, box.top) && r.top < Math.min(vh, box.bottom);
  for (let i = 0; i < hits.length; i++) for (let j = i + 1; j < hits.length; j++) {
    const a = hits[i], b = hits[j];
    if (a.contains(b) || b.contains(a)) continue;
    const p = R(a), q = R(b);
    if (!vis(p) || !vis(q)) continue;
    const w = Math.min(p.right, q.right) - Math.max(p.left, q.left), h = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top);
    if (w > 4 && h > 4) issues.push('重疊：' + name(a) + ' 和 ' + name(b));
  }
  // 畫面種類（第一次出現時截圖）
  let key;
  if ($('#pause') && !$('#pause').hidden) key = 'pause';
  else if (!$('#panel').hidden) {
    const c = $('#panel .card');
    key = 'panel-' + [...c.classList].filter((x) => !['card', 'paper-card'].includes(x)).join('.')
      + ($('#panel .quad') ? ($('#wordArea .word') ? '-words' : '-quad') : '')
      + ($('#panel textarea') ? '-write' : '') + ($('#panel .choice') ? '-choice' : '');
  } else {
    key = 'line' + (!$('#phone').hidden ? '-phone' : '') + (!$('#inner').hidden ? '-inner' : '') + ($('#portrait.empty') ? '' : '-portrait');
  }
  return { issues: [...new Set(issues)], key };
`;

const STEP = `
  const $ = (s) => document.querySelector(s);
  const vis = (el) => el && el.offsetParent !== null;
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  let did = '';
  if ($('.closing-card')) did = 'closing';
  else if ($('.diary-card .quad')) {
    if (!$('#wordArea .word')) { pick([...document.querySelectorAll('.quad')]).click(); did = 'quad'; }
    else { pick([...document.querySelectorAll('.word')]).click(); $('#next').click(); did = 'word'; }
  } else if ($('.diary-card textarea')) { document.querySelectorAll('textarea').forEach((t) => { t.value = '今天有一點難過，可是我有跟媽媽說。'; }); $('#go').click(); did = 'write'; }
  else if (document.querySelector('#panel .choice:not(.locked)')) { pick([...document.querySelectorAll('#panel .choice:not(.locked)')]).click(); did = 'choice'; }
  else if (document.querySelector('#panel .pick')) { pick([...document.querySelectorAll('#panel .pick')]).click(); did = 'pick'; }
  else if (vis($('#panel #go'))) { $('#panel #go').click(); did = 'go'; }
  else { $('#stage').click(); did = 'stage'; }
  return did;`;

export default async ({ ev, shot, sleep }) => {
  const seen = new Set();
  const problems = new Map();
  const look = async (where) => {
    const r = await ev(CHECK);
    if (!r) return;
    for (const i of r.issues) if (!problems.has(i)) problems.set(i, where + ' / ' + r.key);
    if (!seen.has(r.key)) { seen.add(r.key); await sleep(450); await shot(`sw_${TAG}_${String(seen.size).padStart(2, '0')}_${r.key}`); }
  };
  await ev(`location.href = '/?lang=${LANG}'`);
  await sleep(1500);
  await look('標題');
  await ev(`document.getElementById('go').click()`);
  await sleep(300);
  await look('選角色');
  await ev(`document.querySelector('.role[data-id="${ROLE}"]').click()`);
  await sleep(300);
  let paused = false, shared = false;
  for (let i = 0; i < 700; i++) {
    await sleep(40);
    await look('第 ' + i + ' 步');
    if (!paused && i === 12) {
      paused = true;
      await ev(`document.getElementById('btnPause').click()`); await sleep(300);
      await look('暫停');
      await ev(`document.getElementById('resume').click()`); await sleep(200);
    }
    const did = await ev(STEP);
    if (did === 'closing') {
      await sleep(300); await look('最後一頁');
      if (!shared) {
        shared = true;
        await ev(`document.getElementById('share').click()`); await sleep(1200);
        await look('分享');
      }
      break;
    }
  }
  const lines = [...problems].map(([k, v]) => `  ${k}　（${v}）`);
  writeFileSync(`${SP}\\sweep_${TAG}.txt`, `${TAG}：${seen.size} 種畫面，${problems.size} 個問題\n${lines.join('\n')}`, 'utf8');
  console.log(TAG, seen.size, 'screens', problems.size, 'problems');
};
