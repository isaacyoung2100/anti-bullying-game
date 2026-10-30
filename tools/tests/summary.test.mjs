// 「這週的你」的檢查：每個角色隨便怎麼選，程式組的總結都完整；
// 送給 AI 的事實只有劇本裡的句子，沒有學生自己打的字，長度也在後端的限制內

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORIES, CHARACTERS } from '../../frontend/js/story.js';
import { setLang, tr, t } from '../../frontend/js/i18n.js';
import { weekFacts, localSummary, checkSummary } from '../../frontend/js/summary.js';

// 和 backend/app.py 的欄位上限一致
const MAX = { role: 24, day: 16, weather: 16, feel: 24, text: 200, who: 24 };

// 用固定的亂數玩一週：每個選擇隨便選一個，記下和遊戲一樣的 picks、日記、每天的能量
function playWeek(st, seed) {
  let r = seed;
  const rand = (n) => { r = (r * 1103515245 + 12345) % 2147483648; return r % n; };
  const state = { story: st, days: [], picks: [], diary: [] };
  let day = null;
  let courage = 50;
  const quads = ['red', 'yellow', 'blue', 'green'];
  const endDay = () => {
    if (!day) return;
    state.days.push({ day, courage });
    const q = quads[rand(4)];
    // 一半的日記用自己取的情緒詞：不能出現在事實裡
    const word = rand(2) ? t('quads')[q].words[rand(8)] : '我自己的祕密詞';
    state.diary.push({ day, quad: q, word, prompts: [], answers: ['日記內容不能送出去'] });
  };
  const walk = (steps) => {
    for (const s of steps) {
      if (s.k === 'day') { endDay(); day = s.day; continue; }
      if (s.k === 'if') { if (rand(2)) walk(s.then); continue; }
      if (s.k === 'choice') {
        // 和遊戲一樣：能量不夠的選項選不到
        const open = s.options.filter((x) => (x.need || 0) <= courage);
        const o = open.length ? open[rand(open.length)] : s.options[0];
        const cant = s.options.filter((x) => (x.need || 0) > courage).map((x) => x.text);
        state.picks.push({ day, prompt: s.prompt, text: o.text, cant, need: o.need || 0 });
        courage = Math.max(0, Math.min(100, courage + (o.effect?.courage || 0)));
        walk(o.then);
        continue;
      }
      if (s.react) {
        const o = s.react[rand(s.react.length)];
        state.picks.push({ day, who: s.glimpse, text: o.text, none: !!o.none });
      }
      courage = Math.max(0, Math.min(100, courage + (s.effect?.courage || 0)));
    }
  };
  walk(st.story);
  walk(st.ending);
  endDay();
  return state;
}

const nameOf = (st) => (id) => tr(id === st.id ? st.name : (CHARACTERS[id] || CHARACTERS.narrator).name);
const weatherWord = (c) => t('weather')[c >= 75 ? 'sun' : c >= 55 ? 'cloud' : c >= 35 ? 'overcast' : 'rain'];

for (const lang of ['zh', 'en']) {
  test(`這週的你（${lang}）：每個角色、各種選法都有完整的總結，而且通過 AI 輸出的同一套檢查`, () => {
    setLang(lang);
    for (const st of STORIES) {
      for (let seed = 1; seed <= 40; seed++) {
        const facts = weekFacts(playWeek(st, seed), nameOf(st), weatherWord);
        const s = localSummary(facts);
        assert.ok(s.text.length > 20, `${st.id} 的總結太短`);
        assert.ok(!/undefined|null|NaN/.test(s.text + s.share), `${st.id} 的總結有漏掉的值：${s.text}`);
        assert.ok(checkSummary({ summary: s.text, share: s.share }, lang), `${st.id} 的總結沒通過檢查：${s.text}｜${s.share}`);
      }
    }
  });

  test(`這週的你（${lang}）：送給 AI 的事實沒有學生打的字，長度在後端的限制內`, () => {
    setLang(lang);
    for (const st of STORIES) {
      for (let seed = 1; seed <= 40; seed++) {
        const facts = weekFacts(playWeek(st, seed), nameOf(st), weatherWord);
        const json = JSON.stringify(facts);
        assert.ok(!json.includes('祕密詞') && !json.includes('日記內容'), `${st.id} 的事實裡有學生打的字`);
        assert.ok(facts.role.length <= MAX.role);
        assert.ok(facts.days.length <= 7);
        for (const d of facts.days) {
          assert.ok(d.day.length <= MAX.day && d.weather.length <= MAX.weather && (d.feel || '').length <= MAX.feel);
          assert.ok(d.chose.length <= 6 && d.noticed.length <= 3, `${st.id} ${d.day} 的選擇太多`);
          for (const c of d.chose) {
            assert.ok(c.cant.length <= 4);
            for (const s of [c.text, ...c.cant]) assert.ok(s.length <= MAX.text, `太長（${s.length}）：${s}`);
          }
          for (const n of d.noticed) assert.ok(n.who.length <= MAX.who && n.text.length <= MAX.text, `太長：${n.text}`);
        }
      }
    }
  });
}

test('AI 輸出的檢查：擋掉太長、貼標籤、不是中文的內容', () => {
  const ok = { summary: '這週你心裡的天氣，從週一的「下雨」，走到週六的「晴天」。你注意到了小晴。', share: '這週我學會替自己的心情取名字。' };
  assert.ok(checkSummary(ok, 'zh'));
  assert.ok(!checkSummary({ ...ok, summary: ok.summary + '你有點冷漠。' }, 'zh'));
  assert.ok(!checkSummary({ ...ok, summary: '字'.repeat(300) }, 'zh'));
  assert.ok(!checkSummary({ ...ok, summary: 'This is not Chinese at all, but long enough.' }, 'zh'));
  assert.ok(!checkSummary({ summary: ok.summary }, 'zh'));
  assert.ok(!checkSummary(ok, 'fr'));
});
