// 單檔版（dist/artifact.html）直接打開，中英文各玩完一個角色
// 單檔版沒有網址可以帶 ?lang=，所以用標題畫面的語言按鈕切換
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const SP = fileURLToPath(new URL('./out', import.meta.url));

const STEP = `
  const $ = (s) => document.querySelector(s);
  const vis = (el) => el && el.offsetParent !== null;
  const pick = (l) => l[Math.floor(Math.random() * l.length)];
  if ($('.closing-card')) return 'closing';
  if ($('.diary-card .quad')) { if (!$('#wordArea .word')) pick([...document.querySelectorAll('.quad')]).click(); else { pick([...document.querySelectorAll('.word')]).click(); $('#next').click(); } return 'diary'; }
  if ($('.diary-card textarea')) { $('#go').click(); return 'write'; }
  const c = [...document.querySelectorAll('#panel .choice:not(.locked)')]; if (c.length) { pick(c).click(); return 'choice'; }
  const p = [...document.querySelectorAll('#panel .pick')]; if (p.length) { pick(p).click(); return 'pick'; }
  if (vis($('#panel #go'))) { $('#panel #go').click(); return 'go'; }
  $('#stage').click(); return 'stage';`;

export default async ({ ev, sleep, shot }) => {
  const out = [];
  for (const [lang, role] of [['zh', 'pinyu'], ['en', 'qing']]) {
    await ev(`location.reload()`); await sleep(1500);
    const cur = await ev(`return document.documentElement.lang || ''`);
    if (lang === 'en') { await ev(`document.getElementById('lang').click()`); await sleep(300); }
    const title = await ev(`return document.querySelector('h1')?.innerText || ''`);
    out.push(`${lang}：標題「${title.replace(/\n/g, ' ')}」（html lang=${cur}）`);
    await ev(`document.getElementById('go').click()`); await sleep(200);
    await ev(`document.querySelector('.role[data-id="${role}"]').click()`); await sleep(200);
    let n = 0, done = false;
    for (; n < 900; n++) {
      const a = await ev(STEP);
      if (a === 'closing') { done = true; break; }
      await sleep(a === 'stage' ? 15 : 50);
    }
    // 英文版裡不能有中文（越南話、標點以外）
    const cjk = await ev(`return (document.body.innerText.match(/[\\u4e00-\\u9fff]+/g) || []).filter((w) => w !== '中文').slice(0, 5)`);
    await shot(`artifact_${lang}_closing`);
    // 單檔版不能下載：下載鈕要藏起來，改用長按存圖或複製連結
    await ev(`document.getElementById('share').click()`); await sleep(1200);
    const dl = await ev(`const d = document.getElementById('download'); return d ? getComputedStyle(d).display : 'none'`);
    await shot(`artifact_${lang}_share`);
    out.push(`${lang} ${role}：${done ? '玩完' : '沒玩完'}（${n} 步）；下載鈕 display=${dl}${lang === 'en' && cjk.length ? '；英文版出現中文：' + cjk.join(' ') : ''}`);
  }
  writeFileSync(`${SP}\\artifact.txt`, out.join('\n'), 'utf8');
  console.log(out.join('\n'));
};
