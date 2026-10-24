// 劇本與數值的自動化檢查：npm test
// 窮舉每個角色所有的選擇路徑，確認設計原則在每一條路徑上都成立

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import {
  STORIES, CHARACTERS, START_COURAGE, OVERNIGHT, HELP_LINES, ZHIHAO_INNER,
} from '../../frontend/js/story.js';
import { enumeratePaths, lockRates } from '../lib/paths.mjs';
import { dayMoods, longestWithoutGood, breaksBadRun } from '../lib/days.mjs';

const ALL = STORIES.map((st) => ({ st, paths: enumeratePaths(st, { start: START_COURAGE, overnight: OVERNIGHT }) }));

// 刻意設計成「每條路徑都說不出口」的選項；其他選項如果在所有路徑都被劃掉，就是數值沒調好
const ALWAYS_LOCKED_OK = new Set([
  'azhe|週一|2',  // 第一天就讓玩家遇到「說不出口」
  'aming|週一|2',
  'kai|週一|2',
]);

// 歧視用語與性別貶抑的綽號：需要呈現侮辱時，用綽號或嘲笑的行為呈現，不教孩子新的罵人字眼
const FORBIDDEN = ['外籍新娘', '娘娘腔', '娘炮', '被笑娘', '女生國', '正義魔人', '智障'];

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

test('台詞一句 40 字以內（多行台詞每一行分開算）', () => {
  for (const { st } of ALL) {
    const visit = (s) => {
      for (const t of [s.text, s.inner, s.fear].filter(Boolean)) {
        for (const seg of t.split('\n')) assert.ok(seg.length <= 40, `${st.id}：${seg.length} 字「${seg}」`);
      }
    };
    walkSteps([...st.story, ...st.ending], (s) => {
      visit(s);
      if (s.k === 'choice') s.options.forEach(visit);
    });
  }
});

test('每一天都有日記引導問題、四個旁觀同學的小行動', () => {
  for (const { st } of ALL) {
    for (const d of st.story.filter((s) => s.k === 'day')) {
      assert.ok(d.diary?.length >= 1 && d.diary.length <= 2, `${st.id} ${d.day} 要有一到兩個日記問題`);
      assert.equal(d.help?.length, 4, `${st.id} ${d.day} 要有四個小行動`);
    }
  }
});

test('每個故事都有普通同學冠宇的小善意（不只弱勢角色互相幫忙）', () => {
  for (const { st, paths } of ALL) {
    for (const p of paths) {
      assert.ok(p.lines.some((l) => l.speaker === 'guanyu' || l.text.includes('冠宇')), `${st.id} 有路徑沒有遇到冠宇`);
    }
  }
});

test('劇情一致：接力棒次在每個故事裡都一樣', () => {
  // 小雨第三、小晴第四、阿凱第五、品妤第六、冠宇第七
  const ORDER = { 第三棒: '小雨', 第四棒: '小晴', 第五棒: '阿凱', 第六棒: '品妤', 第七棒: '冠宇' };
  for (const { st } of ALL) {
    walkSteps([...st.story, ...st.ending], (s) => {
      for (const [leg, name] of Object.entries(ORDER)) {
        if (!s.text?.includes(leg)) continue;
        const who = st.id === { 小雨: 'xiaoyu', 小晴: 'qing', 阿凱: 'kai', 品妤: 'pinyu' }[name] ? '你' : name;
        assert.ok(s.text.includes(who) || s.text.includes(`${leg}的${name}`) || s.text.includes('你跑'), `${st.id}：「${s.text}」的${leg}應該是${name}`);
      }
    });
  }
});

test('不會連續三天都沒有好事：最多連續兩天，就要有人主動伸出手（每條路徑都有）', () => {
  for (const { st } of ALL) {
    const days = dayMoods(st);
    const run = longestWithoutGood(days);
    assert.ok(run <= 2, `${st.id} 有連續 ${run} 天沒有好事：${days.map((d) => `${d.day}${d.good ? '好' : ''}`).join(' ')}`);
  }
});

test('最多連續兩天被欺負：連續兩天之後的那一天，整天都是好的', () => {
  for (const { st } of ALL) {
    const days = dayMoods(st);
    const bad = breaksBadRun(days);
    assert.equal(bad, null, `${st.id} 的${bad?.day}「${bad?.title}」接在連續兩天被欺負之後，卻${bad?.bad ? '又被欺負' : '沒有好事'}：${days.map((d) => `${d.day}${d.bad ? '壞' : ''}${d.good ? '好' : ''}`).join(' ')}`);
  }
});

// 背景一瞥：用旁觀同學的眼睛看到另一個角色（多視角交織）
// 每個角色一週只注意到兩次，不然會模糊主角自己的故事；
// 只放在主線（不在選項或條件裡），每個玩家都會看到；不加減能量
function glimpsesByDay(st) {
  const out = [];
  let day = '週一';
  for (const s of st.story) {
    if (s.k === 'day') day = s.day;
    if (s.glimpse) out.push({ day, ...s });
  }
  for (const s of st.ending) if (s.glimpse) out.push({ day: '週六', ...s });
  return out;
}

test('背景一瞥：每個角色一週兩則，在不同天、看到不同的人，都在主線上，不影響能量', () => {
  for (const { st } of ALL) {
    const list = glimpsesByDay(st);
    assert.equal(list.length, 2, `${st.id} 有 ${list.length} 則背景一瞥`);
    assert.notEqual(list[0].day, list[1].day, `${st.id} 的兩則一瞥在同一天`);
    assert.notEqual(list[0].glimpse, list[1].glimpse, `${st.id} 的兩則一瞥看到同一個人`);
    for (const g of list) {
      assert.ok(g.glimpse in CHARACTERS && g.glimpse !== st.id, `${st.id}：看到的人 ${g.glimpse} 不對`);
      assert.ok(!g.effect, `${st.id} ${g.day} 的背景一瞥不能加減能量`);
    }
    // 選項和條件裡不能有一瞥（不然有的玩家看不到）
    for (const s of [...st.story, ...st.ending]) {
      if (s.k === 'choice') s.options.forEach((o) => walkSteps(o.then, (x) => assert.ok(!x.glimpse, `${st.id}：一瞥放進了選項裡`)));
      if (s.k === 'if') walkSteps(s.then, (x) => assert.ok(!x.glimpse, `${st.id}：一瞥放進了條件裡`));
    }
  }
});

test('對照頁：上面那張就是自己那天的一瞥，六個角色串成一圈', () => {
  const next = {};
  for (const { st } of ALL) {
    const c = st.contrast;
    assert.ok(c && c.seen && c.truth && c.lead, `${st.id} 缺對照頁`);
    const g = glimpsesByDay(st).find((x) => x.day === c.day);
    assert.equal(g.glimpse, c.who, `${st.id} 對照頁的人和${c.day}的一瞥不同`);
    assert.equal(g.text, c.seen, `${st.id} 對照頁上面那張要和${c.day}的一瞥一模一樣`);
    assert.ok(STORIES.some((x) => x.id === c.who), `${st.id} 的對照頁要對照一個可以玩的角色`);
    next[st.id] = c.who;
  }
  // 從任何一個角色出發，沿著對照頁走六步回到自己，而且每個角色都經過
  const seen = new Set();
  let cur = STORIES[0].id;
  for (let i = 0; i < STORIES.length; i++) { seen.add(cur); cur = next[cur]; }
  assert.equal(cur, STORIES[0].id, '對照頁沒有串成一圈');
  assert.equal(seen.size, STORIES.length, '對照頁的圈沒有經過每個角色');
});

test('背景一瞥的小回應：每則三個，剛好一個「沒做」，每句 40 字以內', () => {
  for (const { st } of ALL) {
    for (const g of glimpsesByDay(st)) {
      assert.equal(g.react?.length, 3, `${st.id} ${g.day} 的一瞥要有三個回應`);
      assert.equal(g.react.filter((r) => r.none).length, 1, `${st.id} ${g.day} 要剛好一個「沒做」`);
      for (const r of g.react) {
        assert.ok(r.text && r.result, `${st.id} ${g.day} 的回應缺文字`);
        for (const x of [r.text, r.result]) assert.ok(x.length <= 40, `${st.id}：${x.length} 字「${x}」`);
      }
    }
  }
});

test('對照頁的第二件：揭曉另一則一瞥，上面那張和那天的一瞥一模一樣', () => {
  for (const { st } of ALL) {
    const c = st.contrast2;
    assert.ok(c && c.seen && c.truth && c.lead, `${st.id} 缺對照頁的第二件`);
    const list = glimpsesByDay(st);
    const g = list.find((x) => x.day === c.day);
    assert.ok(g, `${st.id} 的${c.day}沒有一瞥`);
    assert.equal(g.glimpse, c.who, `${st.id} 第二件的人和${c.day}的一瞥不同`);
    assert.equal(g.text, c.seen, `${st.id} 第二件上面那張要和${c.day}的一瞥一模一樣`);
    // 兩件剛好就是這個角色的兩則一瞥
    assert.deepEqual(new Set([st.contrast.seen, c.seen]), new Set(list.map((x) => x.text)), `${st.id} 的對照頁沒有揭曉全部的一瞥`);
  }
});
