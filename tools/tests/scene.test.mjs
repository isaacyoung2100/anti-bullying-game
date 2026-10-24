// 畫面一致性：沿著劇情一步一步模擬畫面上有誰（和遊戲引擎一樣的規則），每個分支都走到
// 抓「說話的人不在畫面上」「鏡頭拉近卻沒有那個人」「欄位的值打錯」這類錯誤
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORIES, CHARACTERS } from '../../frontend/js/story.js';
import { SCENES, PALETTES, PROPS } from '../../frontend/js/sprites.js';

const EMOS = new Set(['neutral', 'happy', 'sad', 'cry', 'surprised', 'angry']);
const ANIMS = new Set(['run', 'shake', 'jump', 'cheer']);
const WEARS = new Set(['earmuffs', 'hat']);
const TIMES = new Set(['dusk']);
// 不用站在畫面上也可以說話的人（旁白、全班、沒有畫出來的人）
const OFFSCREEN_OK = new Set(['narrator', 'class']);

// 走過每一個分支：狀態相同（同一步、同樣的畫面、同樣的旗標）只走一次
function walkScenes(st, visit) {
  const list = [...st.story, ...st.ending];
  const seen = new Set();
  const go = (queue, view, flags) => {
    while (queue.length) {
      const step = queue.shift();
      if (step.k === 'day') { view = { bg: step.bg, chars: [], day: step.day }; continue; }
      if (step.k === 'if') { if (flags[step.flag]) queue.unshift(...step.then); continue; }
      if (step.k === 'choice') {
        const key = `${list.indexOf(step)}|${JSON.stringify(view)}|${Object.keys(flags).sort()}|${queue.length}`;
        if (seen.has(key)) return;
        seen.add(key);
        for (const o of step.options) go([...o.then, ...queue], { ...view, chars: [...view.chars] }, o.flag ? { ...flags, [o.flag]: true } : flags);
        return;
      }
      if (step.bg) view = { ...view, bg: step.bg, chars: (step.chars || []).map((c) => c.id) };
      if (step.glimpse) view = { ...view, chars: [st.id, step.glimpse] };
      visit(step, view);
      if (step.glimpse) view = { ...view, glimpseFrom: true };
    }
  };
  go([...list], { bg: null, chars: [], day: null }, {});
}

test('畫面一致性：說話的人站在畫面上，欄位的值都認得', () => {
  const bad = new Set();
  for (const st of STORIES) {
    walkScenes(st, (s, view) => {
      const where = `${st.id} ${view.day}「${(s.text || '').slice(0, 18)}」`;
      if (s.bg && !SCENES[s.bg]) bad.add(`${where}：不認得場景 ${s.bg}`);
      for (const c of s.chars || []) {
        if (!PALETTES[c.id]) bad.add(`${where}：沒有畫 ${c.id} 的樣子`);
        if (c.x < 24 || c.x > 168) bad.add(`${where}：${c.id} 站在直向畫面看不到的地方（x=${c.x}）`);
        if (c.emo && !EMOS.has(c.emo)) bad.add(`${where}：不認得表情 ${c.emo}`);
      }
      if (s.emo && !EMOS.has(s.emo)) bad.add(`${where}：不認得表情 ${s.emo}`);
      if (s.seenEmo && !EMOS.has(s.seenEmo)) bad.add(`${where}：不認得表情 ${s.seenEmo}`);
      if (s.anim && !ANIMS.has(s.anim)) bad.add(`${where}：不認得動作 ${s.anim}`);
      if (s.time && !TIMES.has(s.time)) bad.add(`${where}：不認得時間 ${s.time}`);
      for (const p of s.props || []) if (!PROPS[p]) bad.add(`${where}：不認得道具 ${p}`);
      for (const [id, items] of Object.entries(s.wear || {})) {
        if (!view.chars.includes(id)) bad.add(`${where}：${id} 不在畫面上，沒辦法穿戴`);
        for (const w of items) if (!WEARS.has(w)) bad.add(`${where}：不認得裝扮 ${w}`);
      }
      if (s.glimpse && (!CHARACTERS[s.glimpse] || s.glimpse === st.id)) bad.add(`${where}：一瞥看到的人不對`);
      // 說話的人要在畫面上（旁白、全班除外；主角說話時一定在畫面上）
      if (!OFFSCREEN_OK.has(s.speaker) && !view.chars.includes(s.speaker)) bad.add(`${where}：${CHARACTERS[s.speaker]?.name || s.speaker} 在說話，卻不在畫面上`);
      // 鏡頭拉近、跑步、家裡吃飯：主角要在畫面上
      if ((s.zoom || s.anim === 'run') && !view.chars.includes(typeof s.zoom === 'string' ? s.zoom : st.id)) bad.add(`${where}：鏡頭要拉近的人不在畫面上`);
      if (view.bg && !view.chars.includes(st.id) && !s.glimpse) bad.add(`${where}：主角不在畫面上`);
      // 手機畫面的格式
      if (s.phone && !s.phone.off) {
        if (!Array.isArray(s.phone.msgs) || !s.phone.title) bad.add(`${where}：手機畫面缺 title 或 msgs`);
        for (const m of s.phone.msgs || []) if (!(m.text || m.sticker || m.system || m.toast)) bad.add(`${where}：手機訊息是空的`);
      }
    });
  }
  assert.deepEqual([...bad], []);
});

test('每天的標題卡都有場景、標題和摘要，日子照順序', () => {
  const ORDER = ['週一', '週二', '週三', '週四', '週五'];
  for (const st of STORIES) {
    const days = st.story.filter((s) => s.k === 'day');
    assert.deepEqual(days.map((d) => d.day), ORDER, `${st.id} 的日子順序：${days.map((d) => d.day)}`);
    for (const d of days) assert.ok(SCENES[d.bg] && d.title && d.recap, `${st.id} ${d.day} 的標題卡缺欄位`);
    const end = st.ending.find((s) => s.k === 'day');
    assert.ok(end && end.day === '週六', `${st.id} 的結局要從週六的標題卡開始`);
  }
});

test('同一句話不會連續出現兩次', () => {
  const bad = [];
  for (const st of STORIES) {
    let last = '';
    walkScenes(st, (s) => {
      if (s.text === last && !s.react) bad.push(`${st.id}「${s.text}」`);
      last = s.text;
    });
  }
  assert.deepEqual([...new Set(bad)], []);
});
