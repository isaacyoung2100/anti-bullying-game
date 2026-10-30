// 列舉每個角色所有的選擇路徑，檢查心靈能量的平衡
// 用法：npm run simulate（或 node tools/simulate.mjs [起始能量]）
// 報告：每天的選項在多少比例的路徑會「害怕還是做了」（勇氣不夠）、告訴媽媽的路徑數、結局時的能量範圍

import { STORIES, START_COURAGE, OVERNIGHT } from '../frontend/js/story.js';
import { enumeratePaths, scaredRates } from './lib/paths.mjs';

const start = Number(process.argv[2] || START_COURAGE);

for (const st of STORIES) {
  const paths = enumeratePaths(st, { start, overnight: OVERNIGHT });
  const energies = paths.map((p) => p.energy);
  console.log(`\n${st.name}：${paths.length} 條路徑，可以告訴媽媽 ${paths.filter((p) => p.flags.toldMom).length} 條，結局時能量 ${Math.min(...energies)}–${Math.max(...energies)}`);
  for (const r of scaredRates(paths)) {
    const cells = r.scared.map((n, i) => `${'ABCD'[i]} ${Math.round((n / r.reached) * 100)}%`).join('  ');
    console.log(`  ${r.day} 會害怕的比例：${cells}`);
  }
}
