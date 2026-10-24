// 把一個角色的劇本切成每一天，標記這一天有沒有「壞事」和「好事」
// 壞事：固定劇情裡有讓心靈能量下降的事（被欺負）
// 好事：固定劇情裡有人主動伸出手（effect.kind），每條路徑都會遇到；選項和 if 裡的不算
// 結局（運動會）一定有朋友的肯定，算好的一天

export function dayMoods(story) {
  const days = [];
  let cur = null;
  for (const s of story.story) {
    if (s.k === 'day') {
      cur = { day: s.day, title: s.title, bad: false, good: false, goodLines: [] };
      days.push(cur);
      continue;
    }
    if (!cur || s.k) continue;
    if ((s.effect?.courage || 0) < 0) cur.bad = true;
    if ((s.effect?.kind || 0) > 0) { cur.good = true; cur.goodLines.push(s.text); }
  }
  days.push({ day: '週六', title: story.ending[0]?.title, bad: false, good: true, goodLines: [] });
  return days;
}

// 最長連續幾天「沒有好事」
export function longestWithoutGood(days) {
  let run = 0;
  let best = 0;
  for (const d of days) {
    run = d.good ? 0 : run + 1;
    best = Math.max(best, run);
  }
  return best;
}
