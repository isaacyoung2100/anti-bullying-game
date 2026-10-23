// 劇本與數值的自動化檢查：npm test
// 窮舉每個角色所有的選擇路徑，確認設計原則在每一條路徑上都成立

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import {
  STORIES, CHARACTERS, START_COURAGE, OVERNIGHT, HELP_LINES, ZHIHAO_INNER,
} from '../../frontend/js/story.js';
import { enumeratePaths, lockRates } from '../lib/paths.mjs';

const ALL = STORIES.map((st) => ({ st, paths: enumeratePaths(st, { start: START_COURAGE, overnight: OVERNIGHT }) }));

// 刻意設計成「每條路徑都說不出口」的選項；其他選項如果在所有路徑都被劃掉，就是數值沒調好
const ALWAYS_LOCKED_OK = new Set([
  'azhe|週一|2',  // 第一天就讓玩家遇到「說不出口」
  'aming|週一|2',
  'kai|週一|2',
]);

const FORBIDDEN = ['外籍新娘'];

function walkSteps(list, fn) {
  for (const s of list) {
    fn(s);
    if (s.k === 'choice') s.options.forEach((o) => walkSteps(o.then, fn));
    if (s.k === 'if') walkSteps(s.then, fn);
  }
}

test('劇本格式：每一步都是認得的類型，說話的人都存在', () => {
  for (const { st } of ALL) {
    walkSteps([...st.story, ...st.ending], (s) => {
      if (s.k === 'day') return assert.ok(s.day && s.title && s.bg, `${st.id} 的 day 缺欄位`);
      if (s.k === 'choice') {
        assert.ok(s.prompt, `${st.id} 的選擇缺 prompt`);
        assert.ok(s.options.length >= 2, `${st.id}「${s.prompt}」至少要有兩個選項`);
        for (const o of s.options) {
          assert.ok(o.text && Array.isArray(o.then), `${st.id} 有選項缺 text 或 then`);
          if (o.need) assert.ok(o.fear, `${st.id}「${o.text}」會被劃掉，必須寫 fear（心裡在怕什麼）`);
        }
        return;
      }
      if (s.k === 'if') return assert.ok(s.flag && Array.isArray(s.then), `${st.id} 的 if 缺欄位`);
      assert.ok(s.speaker in CHARACTERS, `${st.id}：不認得說話的人 ${s.speaker}`);
      assert.ok(s.text && s.text.trim(), `${st.id}：有一句空白台詞`);
    });
  }
});

test('「換你想一想」可以選的每一天，都有那天發生了什麼的摘要', () => {
  for (const { st } of ALL) {
    for (const d of st.story.filter((s) => s.k === 'day')) {
      assert.ok(d.recap && d.recap.trim(), `${st.id} ${d.day} 缺少 recap（玩家回想那天時需要）`);
      assert.ok(Array.isArray(d.help) && d.help.length >= 3, `${st.id} ${d.day} 至少要有三個那天專屬的小行動（help）`);
      for (const h of d.help) assert.ok(h.text && h.result, `${st.id} ${d.day} 的小行動缺 text 或 result`);
    }
  }
});

test('劇本格式：if 用到的旗標，一定有某個選項會設定', () => {
  for (const { st } of ALL) {
    const set = new Set();
    const used = new Set();
    walkSteps([...st.story, ...st.ending], (s) => {
      if (s.k === 'choice') s.options.forEach((o) => o.flag && set.add(o.flag));
      if (s.k === 'if') used.add(s.flag);
    });
    for (const f of used) assert.ok(set.has(f), `${st.id}：旗標 ${f} 沒有任何選項會設定`);
  }
});

test('不會卡關：每個選擇點至少有一個選項可以選', () => {
  for (const { st, paths } of ALL) {
    const stuck = paths.filter((p) => p.deadEnds.length);
    assert.equal(stuck.length, 0, `${st.id} 有 ${stuck.length} 條路徑卡在全部被劃掉的選擇`);
  }
});

test('每條路徑都會走到結局', () => {
  for (const { st, paths } of ALL) {
    for (const p of paths) assert.ok(p.lines.some((l) => l.ending), `${st.id} 有路徑沒有走到運動會`);
  }
});

test('心靈能量永遠在 0 到 100 之間', () => {
  for (const { st, paths } of ALL) {
    for (const p of paths) {
      for (const e of p.energyLog) assert.ok(e.energy >= 0 && e.energy <= 100, `${st.id} ${e.day} 能量 ${e.energy}`);
    }
  }
});

test('只有刻意設計的選項，才會在每條路徑都被劃掉', () => {
  for (const { st, paths } of ALL) {
    for (const r of lockRates(paths)) {
      r.locked.forEach((n, i) => {
        if (n === r.reached) {
          assert.ok(ALWAYS_LOCKED_OK.has(`${st.id}|${r.day}|${i}`), `${st.id} ${r.day} 選項 ${'ABC'[i]} 在每條路徑都被劃掉，但不在允許清單上`);
        }
      });
    }
  }
});

test('向大人求助的選項（告訴媽媽）在大多數路徑都選得到', () => {
  for (const { st, paths } of ALL) {
    const told = paths.filter((p) => p.flags.toldMom).length;
    assert.ok(told / paths.length >= 0.25, `${st.id} 只有 ${told}/${paths.length} 條路徑能告訴媽媽`);
  }
});

test('欺負的人和旁觀者的行為固定：結局中不依旗標出現的內容，每條路徑都一樣', () => {
  for (const { st, paths } of ALL) {
    const fixed = (p) => p.lines.filter((l) => l.ending && !l.conditional).map((l) => `${l.speaker}:${l.text}`).join('\n');
    const first = fixed(paths[0]);
    for (const p of paths) assert.equal(fixed(p), first, `${st.id} 的結局固定內容會因路徑不同而改變`);
  }
});

test('老師一定會介入：每條路徑的週五，老師都會私下找主角談', () => {
  for (const { st, paths } of ALL) {
    for (const p of paths) {
      assert.ok(p.lines.some((l) => l.speaker === 'teacher' && l.text.includes('老師這幾天有注意到')), `${st.id} 有路徑週五老師沒有介入`);
    }
  }
});

test('結局一定有大人和下次的約定', () => {
  for (const { st, paths } of ALL) {
    for (const p of paths) {
      assert.ok(p.lines.some((l) => l.ending && l.speaker === 'teacher' && l.text.includes('下禮拜')), `${st.id} 有路徑的結局沒有老師的約定`);
    }
  }
});

test('劇情一致：阿明請媽媽不要來時，結局裡媽媽不會開口喊加油', () => {
  const { paths } = ALL.find((x) => x.st.id === 'aming');
  for (const p of paths.filter((x) => x.flags.askedMomAway)) {
    assert.ok(!p.lines.some((l) => l.ending && l.speaker === 'momM'), '請媽媽不要來的路徑，媽媽卻在結局說話');
    assert.ok(p.lines.some((l) => l.ending && l.text.includes('她還是來了')), '請媽媽不要來的路徑，結局要交代媽媽還是來了');
  }
});

test('劇情一致：小雨每條路徑都有班服（老師一定會私下處理）', () => {
  const { paths } = ALL.find((x) => x.st.id === 'xiaoyu');
  for (const p of paths) {
    assert.ok(p.lines.some((l) => l.text.includes('班服你不用擔心')), '有路徑老師沒有處理班服');
  }
});

test('不出現禁用的歧視詞', () => {
  for (const { st } of ALL) {
    walkSteps([...st.story, ...st.ending], (s) => {
      const texts = [s.text, s.inner, s.prompt, s.fear, ...(s.options || []).map((o) => `${o.text}${o.fear || ''}`)];
      for (const t of texts.filter(Boolean)) {
        for (const w of FORBIDDEN) assert.ok(!t.includes(w), `${st.id}：出現禁用詞「${w}」：${t}`);
      }
    });
  }
});

test('求助資源包含教育部防制校園霸凌專線 1953', () => {
  assert.ok(HELP_LINES.some((h) => h.number === '1953'));
});

test('志豪的內心話要承擔責任，不只是說自己以前也被笑', () => {
  assert.ok(ZHIHAO_INNER.includes('這不是藉口'));
});

// 路徑統計快照：數值改變時測試失敗，確認是刻意的再更新（UPDATE_SNAPSHOT=1 npm test）
test('路徑統計與快照相同', () => {
  const file = new URL('./paths.snapshot.json', import.meta.url);
  const now = Object.fromEntries(ALL.map(({ st, paths }) => [st.id, {
    paths: paths.length,
    toldMom: paths.filter((p) => p.flags.toldMom).length,
    lockRates: lockRates(paths).map((r) => `${r.day} ${r.locked.map((n) => Math.round((n / r.reached) * 100)).join('/')}`),
  }]));
  if (process.env.UPDATE_SNAPSHOT) writeFileSync(file, `${JSON.stringify(now, null, 2)}\n`);
  const saved = JSON.parse(readFileSync(file, 'utf8'));
  assert.deepEqual(now, saved);
});
