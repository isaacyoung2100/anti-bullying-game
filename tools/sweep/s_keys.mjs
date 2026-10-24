// 只用鍵盤玩：空白鍵前進、Tab 找按鈕、Enter 按下、Esc 暫停、左鍵回上一句
// 同時記錄記憶體：玩完一整輪後，記憶體不應該一直長大
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const SP = fileURLToPath(new URL('./out', import.meta.url));

export default async ({ ev, sleep, send }) => {
  const key = async (k, code = k, vk = 0) => {
    const base = { key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
    await send('Input.dispatchKeyEvent', { type: 'keyDown', ...base, text: k === ' ' ? ' ' : k === 'Enter' ? '\r' : undefined });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  };
  const KEYS = { space: [' ', 'Space', 32], enter: ['Enter', 'Enter', 13], tab: ['Tab', 'Tab', 9], esc: ['Escape', 'Escape', 27], left: ['ArrowLeft', 'ArrowLeft', 37] };
  const press = (name) => key(...KEYS[name]);
  const issues = [];
  const heap = async () => (await send('Runtime.getHeapUsage')).result?.usedSize || 0;

  for (const role of ['xiaoyu', 'kai']) {
    await ev(`location.href = '/?lang=zh'`);
    await sleep(1500);
    const before = await heap();
    // 標題：Tab 到「開始」，Enter
    let ok = false;
    for (let i = 0; i < 6 && !ok; i++) { await press('tab'); ok = await ev(`return document.activeElement?.id === 'go'`); }
    if (!ok) issues.push('標題畫面：Tab 找不到「開始」');
    await press('enter'); await sleep(300);
    // 選角色：Tab 到那個角色，Enter
    ok = false;
    for (let i = 0; i < 12 && !ok; i++) { await press('tab'); ok = await ev(`return document.activeElement?.dataset?.id === '${role}'`); }
    if (!ok) issues.push('選角色：Tab 找不到角色按鈕');
    await press('enter'); await sleep(300);
    let backTried = false, escTried = false, steps = 0, stuck = 0, last = '';
    for (; steps < 900; steps++) {
      const s = await ev(`
        const $ = (q) => document.querySelector(q);
        return { panel: !$('#panel').hidden, pause: !$('#pause').hidden, closing: !!$('.closing-card'),
          diary: !!$('.diary-card'), quad: !!$('.diary-card .quad'), words: !!$('#wordArea .word'),
          sig: ($('#panel').hidden ? '' : $('#panel').innerText.slice(0, 120)) + $('#line').textContent,
          focus: document.activeElement?.className || document.activeElement?.tagName };`);
      if (s.closing) break;
      stuck = s.sig === last ? stuck + 1 : 0; last = s.sig;
      if (stuck > 25) { issues.push(`${role}：只用鍵盤卡住了：${s.sig.slice(0, 60)}（焦點在 ${s.focus}）`); break; }
      if (s.pause) { await press('esc'); continue; }
      if (!s.panel) {
        if (!escTried && steps > 20) { escTried = true; await press('esc'); await sleep(150); const p = await ev(`return !document.querySelector('#pause').hidden`); if (!p) issues.push('Esc 沒有打開暫停'); await press('esc'); await sleep(150); continue; }
        if (!backTried && steps > 30) { backTried = true; await press('left'); await sleep(150); const past = await ev(`return document.querySelector('#dialog').classList.contains('past')`); if (!past) issues.push('左鍵沒有回到上一句'); }
        await press('space'); await sleep(60); continue;
      }
      // 面板：日記的格子和詞要選，寫字的地方留白，再 Tab 到按鈕按 Enter
      if (s.quad && !s.words) { await ev(`document.querySelector('.quad').focus()`); await press('enter'); await sleep(100); continue; }
      if (s.words) { await ev(`document.querySelector('.word').focus()`); await press('enter'); await sleep(100); }
      // Tab 到第一個可以按的按鈕（選項或繼續），Enter
      let hit = false;
      for (let i = 0; i < 25 && !hit; i++) {
        await press('tab');
        hit = await ev(`const a = document.activeElement; return !!a && a.closest('#panel') && a.matches('button:not(.locked):not(#review):not(.text-btn), a.btn:not(#download)') && !a.matches('.quad, .word');`);
      }
      if (!hit) { issues.push(`${role}：Tab 找不到可以按的按鈕：${s.sig.slice(0, 60)}`); break; }
      await press('enter'); await sleep(120);
    }
    const after = await heap();
    issues.push(`（資訊）${role}：鍵盤玩了 ${steps} 步；記憶體 ${(before / 1e6).toFixed(1)} → ${(after / 1e6).toFixed(1)} MB`);
  }
  // 再玩一輪同一個角色，看記憶體是不是一直長
  await send('HeapProfiler.collectGarbage').catch(() => {});
  writeFileSync(`${SP}\\keys.txt`, issues.join('\n'), 'utf8');
  console.log(issues.join('\n'));
};
