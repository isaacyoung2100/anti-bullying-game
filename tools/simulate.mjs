// 列舉每個角色所有的選擇路徑，檢查心靈能量的平衡
// 用法：node tools/simulate.mjs [起始能量] [結局門檻]
// 報告：每天的選項有多少比例的路徑會被劃掉、兩種結局的比例、告訴媽媽的路徑數

const base = new URL('../frontend/js/', import.meta.url);
const { STORIES, START_COURAGE, OVERNIGHT, BRAVE_THRESHOLD } = await import(new URL('story.js', base));

const START = Number(process.argv[2] || START_COURAGE);
const T = Number(process.argv[3] || BRAVE_THRESHOLD);
const clamp = (n) => Math.max(0, Math.min(100, n));

for (const st of STORIES) {
  const endings = [];
  const seen = new Map(); // 第幾個選擇 → [每個選項被劃掉的次數, 到達次數, 當天]
  let day = '';

  const walk = (i, c, flags, first, choiceNo) => {
    for (; i < st.story.length; i++) {
      const s = st.story[i];
      if (s.k === 'day') { if (!first) c = clamp(c + OVERNIGHT); first = false; day = s.day; continue; }
      if (s.k === 'if') { if (flags[s.flag]) for (const t of s.then) c = clamp(c + (t.effect?.courage || 0)); continue; }
      if (s.k === 'choice') {
        const rec = seen.get(choiceNo) || { locked: s.options.map(() => 0), reached: 0, day };
        rec.reached += 1;
        s.options.forEach((o, j) => {
          if ((o.need || 0) > c) { rec.locked[j] += 1; return; }
          let c2 = c + (o.effect?.courage || 0);
          for (const t of o.then) c2 += t.effect?.courage || 0;
          walk(i + 1, clamp(c2), { ...flags, ...(o.flag ? { [o.flag]: 1 } : {}) }, first, choiceNo + 1);
        });
        seen.set(choiceNo, rec);
        return;
      }
      c = clamp(c + (s.effect?.courage || 0));
    }
    endings.push({ c, toldMom: !!flags.toldMom });
  };
  walk(0, START, {}, true, 0);

  const a = endings.filter((e) => e.c >= T).length;
  console.log(`\n${st.name}：${endings.length} 條路徑，結局 A ${Math.round((a / endings.length) * 100)}%，告訴媽媽 ${endings.filter((e) => e.toldMom).length} 條，結局時能量 ${Math.min(...endings.map((e) => e.c))}–${Math.max(...endings.map((e) => e.c))}`);
  for (const [, rec] of [...seen].sort((x, y) => x[0] - y[0])) {
    const cells = rec.locked.map((n, j) => `${'ABC'[j]} ${Math.round((n / rec.reached) * 100)}%`).join('  ');
    console.log(`  ${rec.day} 劃掉比例：${cells}`);
  }
}
