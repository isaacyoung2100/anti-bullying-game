// 亂玩壓力測試：像小孩一樣亂按，每一步都檢查
// 亂選、亂按「上一句」、暫停又繼續、重新開始、日記亂打（HTML、表情符號、超長文字）、分享、週記單、再玩一次
// 每一步檢查：怪字（undefined、NaN）、日記裡的 HTML 被執行、英文版出現中文、整頁可以橫向捲動、卡住
import { writeFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const SP = fileURLToPath(new URL('./out', import.meta.url));
const TAG = process.env.TAG || 'fuzz';
const RUNS = +(process.env.RUNS || 2);
const ROLES = (process.env.ROLES || 'azhe,xiaoyu,aming,kai,qing,pinyu').split(',');
const LANGS = (process.env.LANGS || 'zh,en').split(',');

const STEP = `
  const $ = (s) => document.querySelector(s);
  const vis = (el) => el && el.offsetParent !== null && !el.closest('[hidden]');
  const R = Math.random();
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const JUNK = ['<img src=x onerror="window.__xss=1">', '😀🌧️☀️', 'a'.repeat(120), '   ', '\\'"<>&', '<b>bold</b>', '${'{'}1+1}', 'ok'];
  const setVal = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
  const pause = $('#pause');
  if (pause && !pause.hidden) {
    // 暫停選單：大多繼續玩，偶爾重新開始這個故事
    if (R < 0.12 && !window.__restarted) { window.__restarted = 1; $('#restartStory').click(); return 'restart'; }
    $('#resume').click(); return 'resume';
  }
  if ($('.closing-card')) return 'closing';
  // 分享卡：按一次「複製連結」，再回最後一頁
  if ($('#copy') && !window.__copied) { window.__copied = 1; $('#copy').click(); return 'copy'; }
  if (R < 0.025 && vis($('#btnPause'))) { $('#btnPause').click(); return 'pause'; }
  if ($('.diary-card .quad')) {
    if (!$('#wordArea .word')) { pick([...document.querySelectorAll('.quad')]).click(); return 'quad'; }
    if (Math.random() < 0.35) { setVal($('#ownWord'), pick(JUNK)); }
    else pick([...document.querySelectorAll('.word')]).click();
    $('#next').click(); return 'word';
  }
  if ($('.diary-card textarea')) {
    document.querySelectorAll('.diary-card textarea').forEach((t) => setVal(t, Math.random() < 0.5 ? pick(JUNK) + ' ' + 'x'.repeat(Math.floor(Math.random() * 400)) : ''));
    $('#go').click(); return 'write';
  }
  const choices = [...document.querySelectorAll('#panel .choice:not(.locked)')];
  if (choices.length) {
    if (R < 0.1 && $('#review')) { $('#review').click(); return 'review'; }
    pick(choices).click(); return 'choice';
  }
  const locked = document.querySelector('#panel .choice.locked');
  if (locked && R < 0.2) { locked.click(); return 'locked-click'; }
  if (vis($('#panel #go'))) { $('#panel #go').click(); return 'go'; }
  const picks = [...document.querySelectorAll('#panel .pick')];
  if (picks.length) { pick(picks).click(); return 'pick'; }
  if (R < 0.12 && vis($('#btnBack'))) { $('#btnBack').click(); return 'back'; }
  $('#stage').click(); return 'stage';`;

const CHECK = `
  const $ = (s) => document.querySelector(s);
  const out = [];
  const panel = $('#panel');
  const text = [panel.hidden ? '' : panel.innerText, $('#dialog').innerText, $('#hud').innerText].join(' ');
  // 玩家自己打的日記內容不算（裡面本來就有怪字）
  const own = [...document.querySelectorAll('.diary-entry p:not(.q), .picked-feel, #ownWord, textarea')].map((e) => e.innerText || e.value || '').join(' ');
  const clean = own ? text.split(own).join(' ') : text;
  for (const w of ['undefined', 'NaN', '[object', 'null,', '{{']) if (clean.includes(w)) out.push('怪字 ' + w + '：' + clean.slice(Math.max(0, clean.indexOf(w) - 30), clean.indexOf(w) + 30));
  if (window.__xss) out.push('日記裡的 HTML 被執行了');
  if (document.querySelector('#panel img[src="x"]') || [...document.querySelectorAll('#panel b')].some((b) => b.textContent === 'bold')) out.push('日記裡的 HTML 變成真的標籤');
  if (document.documentElement.scrollWidth > innerWidth + 1) out.push('整頁可以橫向捲動');
  if (LANG === 'en') {
    const cjk = clean.replace(/[\\u3000-\\u303f]/g, '').match(/[\\u4e00-\\u9fff]+/g);
    if (cjk && !own) out.push('英文版出現中文：' + cjk.slice(0, 3).join(' '));
  }
  // 對話框空白、面板也沒開：畫面上什麼都沒有
  // 打字效果剛開始時本來就是空的：空白超過 0.4 秒才算（玩家會注意到的長度）
  const empty = panel.hidden && !$('#dialog').classList.contains('idle') && !$('#line').textContent.trim();
  if (empty) window.__emptySince ||= performance.now(); else window.__emptySince = 0;
  if (empty && performance.now() - window.__emptySince > 400) out.push('對話框空白超過 0.4 秒：' + JSON.stringify({ day: $('#dayChip').textContent, speaker: $('#speaker').textContent, prev: window.__prevLine, acts: (window.__acts || []).join('>') }));
  if (!empty) window.__prevLine = $('#line').textContent.slice(0, 30);
  window.__wasEmpty = empty;
  return { out, sig: (panel.hidden ? '' : panel.innerText.slice(0, 200)) + '|' + $('#line').textContent + '|' + $('#speaker').textContent };`;

export default async ({ ev, sleep }) => {
  const report = [];
  const problems = new Map();
  let total = 0;
  for (const lang of LANGS) {
    for (const role of ROLES) {
      for (let run = 0; run < RUNS; run++) {
        await ev(`location.href = '/?lang=${lang}'`);
        await sleep(1300);
        await ev(`window.__xss = 0; window.__restarted = 0; window.__copied = 0; document.getElementById('go').click()`);
        await sleep(150);
        await ev(`document.querySelector('.role[data-id="${role}"]').click()`);
        await sleep(150);
        let last = ''; let same = 0; let n = 0; let done = false; let closings = 0; const acts = {};
        for (; n < 1500; n++) {
          const c = await ev(`const LANG = '${lang}';` + CHECK);
          if (!c) { problems.set(`${lang} ${role}：頁面沒有回應`, n); break; }
          for (const o of c.out) if (!problems.has(o)) problems.set(o, `${lang} ${role} 第${run + 1}次 第${n}步`);
          same = c.sig === last ? same + 1 : 0;
          last = c.sig;
          if (same > 60) { problems.set(`卡住：${c.sig.slice(0, 80)}`, `${lang} ${role} 第${run + 1}次 第${n}步`); break; }
          const a = await ev(STEP);
          acts[a] = (acts[a] || 0) + 1;
          await ev(`(window.__acts ||= []).push(${JSON.stringify(a)}); window.__acts = window.__acts.slice(-4)`);
          if (a === 'closing') {
            closings += 1;
            // 最後一頁：先看分享卡，再看週記單，再玩一次，最後回主畫面
            const next = closings === 1 ? 'share' : closings === 2 ? 'sheet' : closings === 3 ? 'again' : 'home';
            const ok = await ev(`const b = document.getElementById('${next}'); if (b) { b.click(); return true; } return false;`);
            if (next === 'again' && ok) { await sleep(200); await ev(`const r = document.querySelector('.role[data-id="${role}"]'); if (r) r.click();`); }
            if (next === 'home' || (!ok && closings > 3)) { done = true; break; }
            await sleep(300);
            continue;
          }
          await sleep(a === 'stage' || a === 'back' ? 15 : 45);
        }
        total += n;
        report.push(`${lang} ${role} 第${run + 1}次：${done ? '玩完' : '沒玩完'}（${n} 步）` + Object.entries(acts).map(([k, v]) => ` ${k}×${v}`).join(''));
      }
    }
  }
  const lines = [...problems].map(([k, v]) => `  ${k}　（${v}）`);
  const text = `${TAG}：${report.length} 次、共 ${total} 步，${problems.size} 個問題\n${lines.join('\n')}\n\n${report.join('\n')}\n`;
  writeFileSync(`${SP}\\fuzz_${TAG}.txt`, text, 'utf8');
  console.log(TAG, report.length, 'runs', total, 'steps', problems.size, 'problems');
};
