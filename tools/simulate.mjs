// 列舉每個角色所有的選擇路徑，檢查心靈能量的平衡
// 用法：npm run simulate（或 node tools/simulate.mjs [起始能量]）
// 報告：每天的選項在多少比例的路徑會被劃掉、告訴媽媽的路徑數、結局時的能量範圍

import { STORIES, START_COURAGE, OVERNIGHT } from '../frontend/js/story.js';
import { enumeratePaths, lockRates } from './lib/paths.mjs';

const start = Number(process.argv[2] || START_COURAGE);

for (const st of STORIES) {
  const paths = enumeratePaths(st, { start, overnight: OVERNIGHT });
  const energies = paths.map((p) => p.energy);
  console.log(`\n${st.name}：${paths.length} 條路徑，可以告訴媽媽 ${paths.filter((p) => p.flags.toldMom).length} 條，結局時能量 ${Math.min(...energies)}–${Math.max(...energies)}`);
  for (const r of lockRates(paths)) {
    const cells = r.locked.map((n, i) => `${'ABC'[i]} ${Math.round((n / r.reached) * 100)}%`).join('  ');
    console.log(`  ${r.day} 劃掉比例：${cells}`);
  }
}
