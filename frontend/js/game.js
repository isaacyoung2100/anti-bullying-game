import {
  STORIES, CHARACTERS, START_COURAGE, OVERNIGHT, ZHIHAO_INNER, HELP_LINES,
} from './story.js?v=dev';
import { W, drawScene, drawForeground, drawChar, drawPortrait, sceneLabels } from './sprites.js?v=dev';
import { t, tr, getLang, setLang } from './i18n.js?v=dev';

const $ = (id) => document.getElementById(id);
const screen = $('screen');
const g = screen.getContext('2d');

// 角色腳底的高度
const FLOOR_Y = 100;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const state = {
  story: null,        // 目前玩的角色故事
  steps: [],
  i: 0,
  courage: START_COURAGE,
  witness: 0,         // 有人看到卻沒說話的次數
  kind: 0,            // 有人伸出手的次數
  flags: {},
  days: [],           // 每天結束時的勇氣 [{ day, courage }]
  day: null,
  dayStep: null,      // 今天的標題卡（日記用它的引導問題）
  diary: [],          // 每天的日記 [{ day, quad, word, prompts, answers }]
  thinkFirst: null,   // 「換你想一想」第一次的選擇，給「聽完分享，再想一次」對照
  view: { bg: 'title', chars: [], speaker: null },
  typing: null,
  paused: false,
};

// ---------- 繪圖 ----------

// 背景每次重畫很花時間，先畫好存起來；boil 是手繪線條輕輕抖動的三個畫格
const backdrops = new Map();
function backdrop(bg, boil) {
  const key = `${bg}:${boil}`;
  if (!backdrops.has(key)) {
    const cv = document.createElement('canvas');
    cv.width = screen.width; cv.height = screen.height;
    const bg2 = cv.getContext('2d');
    const k = screen.width / W;
    bg2.setTransform(k, 0, 0, k, 0, 0);
    drawScene(bg2, bg, boil);
    backdrops.set(key, cv);
  }
  return backdrops.get(key);
}

function render(time) {
  // 系統設定「減少動態效果」時，線條和角色都不動
  const still = reducedMotion.matches;
  const boil = still ? 0 : Math.floor(time / 380) % 3;
  const k = screen.width / W;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(backdrop(state.view.bg, boil), 0, 0);
  g.setTransform(k, 0, 0, k, 0, 0);
  const speaking = state.view.speaker;
  const anySpeaker = speaking && state.view.chars.some((c) => c.id === speaking);
  state.view.chars.forEach((c, n) => {
    const talking = c.id === speaking;
    const bob = still ? 0
      : talking ? (Math.floor(time / 260) % 2) : (Math.floor((time + n * 400) / 900) % 2);
    drawChar(g, c.id, c.x, FLOOR_Y, c.emo, { bob: -bob * 0.8, dim: anySpeaker && !talking, boil });
  });
  drawForeground(g, state.view.bg, boil);
  for (const label of sceneLabels(state.view.bg)) {
    g.font = `700 ${label.size}px ${getComputedStyle(document.body).fontFamily}`;
    g.fillStyle = label.color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(t(label.key), label.x, label.y);
  }
}

// 給螢幕閱讀器的場景描述：在哪裡、有誰。畫面內容改變時呼叫，不依賴動畫迴圈
function describeScene() {
  const label = [t('scenes')[state.view.bg], state.view.chars.map((c) => nameOf(c.id)).join(t('listSep'))]
    .filter(Boolean).join(t('labelSep'));
  screen.setAttribute('aria-label', label || t('sceneDefault'));
}

let lastFrame = 0;
function loop(t) {
  if (t - lastFrame > 80) { render(t); lastFrame = t; }
  requestAnimationFrame(loop);
}

// ---------- 勇氣值 ----------

function clamp(n) { return Math.max(0, Math.min(100, n)); }

function setHudVisible(on) {
  $('hud').classList.toggle('off', !on);
}

function updateHud(delta) {
  setHudVisible(true);
  const fill = $('courageFill');
  fill.style.width = `${state.courage}%`;
  // 螢幕閱讀器用：不只靠長條和顏色
  const bar = $('courageBar');
  bar.setAttribute('aria-valuenow', String(state.courage));
  bar.setAttribute('aria-valuetext', t('energyText', state.courage));
  fill.style.background = state.courage >= 60 ? 'var(--good)' : state.courage >= 35 ? 'var(--mid)' : 'var(--bad)';
  $('dayChip').textContent = tr(state.day) || '';
  const d = $('courageDelta');
  if (delta) {
    d.textContent = delta > 0 ? `+${delta}` : `${delta}`;
    d.className = `mood-delta ${delta > 0 ? 'up' : 'down'}`;
    setTimeout(() => { d.textContent = ''; }, 2500);
  }
}

function applyEffect(effect) {
  if (!effect) return;
  state.witness += effect.witness || 0;
  state.kind += effect.kind || 0;
  if (effect.courage) {
    const before = state.courage;
    state.courage = clamp(state.courage + effect.courage);
    updateHud(state.courage - before);
  }
}

// ---------- 對話 ----------

// 玩家扮演的角色顯示為「你」
function nameOf(id) {
  if (id === state.story?.id) return t('you');
  return tr((CHARACTERS[id] || CHARACTERS.narrator).name);
}

function showLine(step) {
  const { speaker } = step;
  const text = tr(step.text);
  const inner = tr(step.inner);
  hidePanel();
  $('dialog').classList.remove('idle');
  $('speaker').textContent = nameOf(speaker);
  state.view.speaker = speaker;
  const portrait = $('portrait');
  const emo = state.view.chars.find((c) => c.id === speaker)?.emo || 'neutral';
  portrait.classList.toggle('empty', !drawPortrait(portrait, speaker, emo));
  const innerEl = $('inner');
  innerEl.textContent = inner ? `${t('innerPrefix')}${inner}` : '';
  innerEl.hidden = true;
  // 打字效果會一直改動文字，所以螢幕閱讀器改念這一行完整的句子
  $('srLine').textContent = [nameOf(speaker), text, inner ? `${t('innerPrefix')}${inner}` : '']
    .filter(Boolean).join(' ');
  describeScene();
  typeText(text, !!inner);
}

function typeText(text, hasInner) {
  const el = $('line');
  clearInterval(state.typing?.timer);
  let n = 0;
  el.textContent = '';
  $('nextHint').classList.add('hide');
  const timer = setInterval(() => {
    n += 1;
    el.textContent = text.slice(0, n);
    if (n >= text.length) finishTyping();
  }, 35);
  state.typing = { timer, text, hasInner };
}

function finishTyping() {
  if (!state.typing) return false;
  clearInterval(state.typing.timer);
  $('line').textContent = state.typing.text;
  if (state.typing.hasInner) $('inner').hidden = false;
  $('nextHint').classList.remove('hide');
  state.typing = null;
  return true;
}

function clearDialog() {
  clearInterval(state.typing?.timer);
  state.typing = null;
  $('dialog').classList.add('idle');
  $('speaker').textContent = '';
  $('line').textContent = '';
  $('inner').hidden = true;
  $('portrait').classList.add('empty');
}

// ---------- 面板 ----------

// 短的內容（每天的標題、選擇、內心話）用浮在場景上的卡片；
// 長的內容（一週回顧、最後一頁）用 page: true 佔滿整個畫面，像一般網頁一樣往下滑
function showPanel(html, cls = '', { page = false } = {}) {
  clearDialog();
  const panel = $('panel');
  panel.classList.toggle('page', page);
  panel.innerHTML = `<div class="card paper-card ${cls}">${html}</div>`;
  panel.hidden = false;
  panel.scrollTop = 0;
  describeScene();
  const card = panel.firstElementChild;
  card.addEventListener('click', (e) => e.stopPropagation());
  return card;
}

function hidePanel() {
  $('panel').hidden = true;
  $('panel').innerHTML = '';
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

const paragraphs = (s) => esc(s).replace(/\n/g, '<br>');

// ---------- 流程 ----------

function next() {
  state.i += 1;
  run();
}

function insertAfterCurrent(newSteps) {
  state.steps.splice(state.i + 1, 0, ...newSteps.map((s) => ({ ...s })));
}

function run() {
  const step = state.steps[state.i];
  if (!step) return;
  const handler = {
    title: stepTitle,
    select: stepSelect,
    day: stepDay,
    choice: stepChoice,
    if: stepIf,
    ending: stepEnding,
    zhihao: stepZhihao,
    reflect: stepReflect,
    think: stepThink,
    closing: stepClosing,
    diary: stepDiary,
  }[step.k] || stepLine;
  handler(step);
}

function stepLine(step) {
  if (step.bg) {
    state.view.bg = step.bg;
    state.view.chars = (step.chars || []).map((c) => ({ ...c }));
  }
  if (step.emo) {
    // 旁白或全班說話時，表情套用在「你」身上
    const target = state.view.chars.some((c) => c.id === step.speaker) ? step.speaker : state.story.id;
    const c = state.view.chars.find((x) => x.id === target);
    if (c) c.emo = step.emo;
  }
  if (!step.applied) {
    applyEffect(step.effect);
    step.applied = true;
  }
  showLine(step);
}

function stepTitle() {
  state.view.bg = 'title';
  state.view.chars = [
    { id: 'xiaoyu', x: 40, emo: 'neutral' },
    { id: 'jiajia', x: 68, emo: 'happy' },
    { id: 'azhe', x: 96, emo: 'sad' },
    { id: 'aming', x: 124, emo: 'neutral' },
    { id: 'zhihao', x: 152, emo: 'happy' },
  ];
  state.view.speaker = null;
  setHudVisible(false);
  const card = showPanel(`
    <button class="text-btn lang-btn" type="button" id="lang" lang="${getLang() === 'zh' ? 'en' : 'zh-Hant'}">🌐 ${t('switchLang')}</button>
    <div class="kicker">${t('titleKicker')}</div>
    <h1>${t('titleHtml')}</h1>
    <p class="sub">${t('titleSub')}</p>
    <div class="notice">${t('titleNotice')}</div>
    <div class="btn-row"><button class="btn" type="button" id="go">${t('start')}</button></div>
  `, 'title-card');
  card.querySelector('#go').onclick = next;
  card.querySelector('#lang').onclick = () => {
    setLang(getLang() === 'zh' ? 'en' : 'zh');
    applyLang();
    run();
    $('lang')?.focus();
  };
}

// 套用語言到 HTML 本身的文字（HUD、提示、頁面標題）
function applyLang() {
  document.documentElement.lang = t('htmlLang');
  document.title = t('gameTitle');
  document.querySelector('.courage-label').textContent = t('energy');
  $('courageBar').setAttribute('aria-label', t('energy'));
  $('btnPause').textContent = t('pause');
  $('btnPause').setAttribute('aria-label', t('pauseLabel'));
  $('nextHint').textContent = t('nextHint');
}

function stepSelect() {
  state.view.speaker = null;
  setHudVisible(false);
  const card = showPanel(`
    <div class="kicker">${t('selectKicker')}</div>
    <h2>${t('selectQ')}</h2>
    <div class="roles">
      ${STORIES.map((st) => `
        <button class="role" type="button" data-id="${st.id}">
          <canvas width="64" height="64" data-p="${st.id}" aria-hidden="true"></canvas>
          <span class="role-text">
            <span class="role-name">${esc(tr(st.name))}</span>
            <span class="role-blurb">${esc(tr(st.blurb))}</span>
          </span>
        </button>`).join('')}
    </div>
  `, 'select-card');
  STORIES.forEach((st) => drawPortrait(card.querySelector(`[data-p="${st.id}"]`), st.id, 'neutral'));
  card.querySelectorAll('.role').forEach((btn) => {
    btn.onclick = () => startStory(btn.dataset.id);
  });
}

function stepDay(step) {
  if (state.day) {
    state.days.push({ day: state.day, courage: state.courage });
    applyEffect({ courage: OVERNIGHT });
  }
  state.day = step.day;
  state.dayStep = step;
  state.view.bg = step.bg;
  state.view.chars = [];
  state.view.speaker = null;
  updateHud();
  showPanel(`
    <div class="kicker">${esc(tr(step.day))}</div>
    <h1>${esc(tr(step.title))}</h1>
    <div class="btn-row"><button class="btn" type="button" id="go">${t('cont')}</button></div>
  `, 'chapter-card').querySelector('#go').onclick = next;
}

function stepIf(step) {
  if (state.flags[step.flag]) insertAfterCurrent(step.then);
  next();
}

function stepChoice(step) {
  state.view.speaker = null;
  const card = showPanel(`
    <div class="kicker">${t('choiceKicker')}</div>
    <h2>${esc(tr(step.prompt))}</h2>
    <div class="choices">
      ${step.options.map((o, n) => {
        const locked = (o.need || 0) > state.courage;
        // 說不出口時，顯示心裡具體在怕什麼：說不出口是因為處境太難，不是因為不夠勇敢
        return locked
          // 用 aria-disabled 而不是 disabled：螢幕閱讀器才會念到「說不出口」，不會直接跳過
          ? `<button class="choice locked" type="button" aria-disabled="true"><s>${esc(tr(o.text))}</s><span class="why">${t('cantSay')}</span>${o.fear ? `<span class="fear">${t('innerPrefix')}${esc(tr(o.fear))}</span>` : ''}</button>`
          : `<button class="choice" type="button" data-n="${n}">${esc(tr(o.text))}</button>`;
      }).join('')}
    </div>
  `, 'choice-card');
  card.querySelectorAll('.choice:not(.locked)').forEach((btn) => {
    btn.onclick = () => {
      const o = step.options[Number(btn.dataset.n)];
      if (o.flag) state.flags[o.flag] = true;
      applyEffect(o.effect);
      insertAfterCurrent(o.then);
      next();
    };
  });
}

// ---------- 日記 ----------

// 每天結束前寫日記（社會情緒學習的自我覺察）：
// 先找到心情在情緒象限的哪一格，再替它命名（選一個詞或自己寫），最後回答一兩個引導問題
// 日記只留在這次遊戲裡，不上傳、不記錄；可以跳過，也可以不寫字
const QUADS = ['red', 'yellow', 'blue', 'green'];  // 左上、右上、左下、右下

function stepDiary() {
  state.view.speaker = null;
  const quads = t('quads');
  const ax = t('diaryAxis');
  const n = state.diary.length;
  // 劇本的標題卡可以有自己的引導問題（diary）；沒有就用每天通用的一題
  const prompts = state.dayStep?.diary?.length
    ? state.dayStep.diary.map(tr)
    : [t('diaryPrompts')[n % t('diaryPrompts').length]];
  const entry = { day: state.day, quad: null, word: '', prompts, answers: [] };
  const dateTag = `<span class="diary-date">${t('diaryKicker', esc(tr(state.day)))}</span>`;
  const axisFor = (q) => [q === 'red' || q === 'yellow' ? ax.high : ax.low, q === 'red' || q === 'blue' ? ax.bad : ax.good].join(t('listSep'));

  const pickMood = () => {
    const card = showPanel(`
      ${dateTag}
      <h2 class="diary-q">${t('diaryMoodQ')}</h2>
      <div class="quad-wrap">
        <div class="quad-y" aria-hidden="true"><span>${ax.high}</span><span>${ax.low}</span></div>
        <div class="quad-grid">
          ${QUADS.map((q) => `
            <button class="quad ${q}" type="button" data-q="${q}" aria-pressed="false" aria-label="${quads[q].name} (${axisFor(q)})">
              <span class="face" aria-hidden="true">${quads[q].face}</span>${quads[q].name}<small>${quads[q].hint}</small>
            </button>`).join('')}
        </div>
        <div class="quad-x" aria-hidden="true"><span>← ${ax.bad}</span><span>${ax.good} →</span></div>
      </div>
      <div id="wordArea" aria-live="polite"></div>
      <button class="text-btn" type="button" id="skip">${t('diarySkip')}</button>
      <div class="btn-row"><button class="btn" type="button" id="next" disabled>${t('diaryNext')}</button></div>
    `, 'diary-card', { page: true });
    const nextBtn = card.querySelector('#next');
    const ready = () => { nextBtn.disabled = !entry.word; };

    const showWords = () => {
      const area = card.querySelector('#wordArea');
      area.innerHTML = `
        <h3 class="diary-q">${t('diaryWordQ')}</h3>
        <div class="words">
          ${quads[entry.quad].words.map((w) => `<button class="word" type="button" aria-pressed="false">${esc(w)}</button>`).join('')}
        </div>
        <label class="own-word">${t('diaryOwnWord')}<input type="text" id="ownWord" maxlength="16" placeholder="${t('diaryOwnPlaceholder')}"></label>`;
      const own = area.querySelector('#ownWord');
      area.querySelectorAll('.word').forEach((btn) => {
        btn.onclick = () => {
          area.querySelectorAll('.word').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
          entry.word = btn.textContent;
          own.value = '';
          ready();
        };
      });
      // 自己命名情緒：寫了自己的詞，就以自己的詞為準
      own.oninput = () => {
        area.querySelectorAll('.word').forEach((b) => b.setAttribute('aria-pressed', 'false'));
        entry.word = own.value.trim();
        ready();
      };
    };

    card.querySelectorAll('.quad').forEach((btn) => {
      btn.onclick = () => {
        card.querySelectorAll('.quad').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        entry.quad = btn.dataset.q;
        entry.word = '';
        ready();
        showWords();
      };
    });
    card.querySelector('#skip').onclick = () => {
      state.diary.push({ day: state.day, skipped: true });
      next();
    };
    nextBtn.onclick = write;
  };

  const write = () => {
    const card = showPanel(`
      ${dateTag}
      <div><span class="picked-feel ${entry.quad}">${quads[entry.quad].face} ${t('diaryFeel', esc(entry.word))}</span></div>
      ${prompts.map((p, i) => `
        <p class="diary-q"><label for="ans${i}">${esc(p)}</label></p>
        <textarea class="diary-text" id="ans${i}" maxlength="300" placeholder="${t('diaryTextPlaceholder')}"></textarea>`).join('')}
      <div class="btn-row"><button class="btn" type="button" id="go">${t('diaryDone')}</button></div>
    `, 'diary-card', { page: true });
    card.querySelector('#go').onclick = () => {
      entry.answers = prompts.map((_, i) => card.querySelector(`#ans${i}`).value.trim());
      state.diary.push(entry);
      next();
    };
  };

  pickMood();
}

// 一週回顧裡的日記：五天依序排好，給小組對照、上台分享時看
function diaryWeekHtml() {
  const quads = t('quads');
  return state.diary.map((e) => `
    <div class="diary-entry">
      <div class="head">
        <span class="day">${esc(tr(e.day))}</span>
        ${e.skipped ? '' : `<span class="picked-feel ${e.quad}">${quads[e.quad].face} ${esc(e.word)}</span>`}
      </div>
      ${e.skipped ? `<p class="q">${t('diaryEmpty')}</p>`
        : e.prompts.map((p, i) => (e.answers[i] ? `<p class="q">${esc(p)}</p><p>${esc(e.answers[i])}</p>` : '')).join('')}
    </div>`).join('');
}

// ---------- 結局與反思 ----------

function stepEnding() {
  // 每個角色只有一個結局：欺負的人和旁觀者的行為固定，前面發生的事只透過旗標加入細節
  insertAfterCurrent([...state.story.ending, { k: 'zhihao' }, { k: 'reflect' }, { k: 'think' }, { k: 'closing' }]);
  next();
}

function stepZhihao() {
  state.days.push({ day: state.day, courage: state.courage });
  state.view.bg = 'classroom';
  state.view.chars = [{ id: 'zhihao', x: 96, emo: 'sad' }];
  state.view.speaker = null;
  const card = showPanel(`
    <canvas class="portrait-lg" width="128" height="128" aria-hidden="true"></canvas>
    <div>
      <div class="kicker">${t('zhihaoKicker')}</div>
      <h2>${t('zhihaoTitle')}</h2>
      <p>${paragraphs(tr(ZHIHAO_INNER))}</p>
      <div class="btn-row"><button class="btn" type="button" id="go">${t('cont')}</button></div>
    </div>
  `, 'inner-card');
  drawPortrait(card.querySelector('canvas'), 'zhihao', 'sad');
  card.querySelector('#go').onclick = next;
}

// 用「心裡的天氣」呈現每天的心情，而不是分數：心情低落不代表比較差
function weatherOf(energy) {
  const cls = energy >= 75 ? 'sun' : energy >= 55 ? 'cloud' : energy >= 35 ? 'overcast' : 'rain';
  const icon = { sun: '☀️', cloud: '⛅', overcast: '☁️', rain: '🌧️' }[cls];
  return { cls, icon, word: t('weather')[cls] };
}

// 天氣格子很窄：英文的星期用縮寫（Wednesday 放不下）
const shortDay = (day) => (getLang() === 'en' ? tr(day).slice(0, 3) : tr(day));

function stepReflect() {
  state.view.bg = 'track';
  state.view.chars = [{ id: state.story.id, x: 96, emo: 'neutral' }];
  const tiles = state.days.map((d) => {
    const w = weatherOf(d.courage);
    return `
    <div class="wx-day">
      <span class="wx" aria-hidden="true">${w.icon}</span>
      <span class="wx-word">${w.word}</span>
      <span class="wx-label">${esc(shortDay(d.day))}</span>
    </div>`;
  }).join('');
  showPanel(`
    <div class="kicker">${t('weekKicker')}</div>
    <h2>${t('weekTitle')}</h2>
    <div class="wx-row" role="list" aria-label="${t('weekAria')}">${tiles}</div>
    <div class="facts">
      <p>${t('witnessFact', state.witness)}</p>
      <p>${t('kindFact', state.kind)}</p>
      <p class="quiet">${t('weekQuiet')}</p>
    </div>
    ${state.diary.length ? `<h2>${t('diaryWeekTitle')}</h2><div class="diary-week">${diaryWeekHtml()}</div>` : ''}
    <div class="btn-row"><button class="btn" type="button" id="go">${t('cont')}</button></div>
  `, 'reflect-card', { page: true }).querySelector('#go').onclick = next;
}

// 換位思考：從被欺負的人回到旁觀者，想一件自己可以做的小事（不記錄、不評分）
// again：進班的綜合活動，各組上台分享之後再想一次，和第一次的選擇對照
function stepThink(step = {}) {
  const again = !!step.again;
  const first = state.thinkFirst;
  const kicker = (n) => (again ? t('againKicker', n) : t('thinkKicker', n));
  state.view.speaker = null;
  const st = state.story;
  const name = esc(tr(st.name));
  const days = st.story.filter((s) => s.k === 'day');
  // 每天有自己的小行動（劇本裡的 help）；沒有寫的話用通用的四個
  const fallback = t('fallbackActions', st).map((text) => ({ text, result: '' }));
  const actionsFor = (day) => day.help || fallback;
  const weatherFor = (day) => {
    const mood = state.days.find((d) => d.day === day.day);
    return mood ? weatherOf(mood.courage).word : '';
  };

  // 一次只問一件事：先選哪一天，再看那天發生什麼、選一件小事，最後看結果
  const pickDay = () => {
    const card = showPanel(`
      <div class="kicker">${kicker(1)}</div>
      ${again && first ? `<p class="first-note">${t('firstWas', esc(tr(first.day.day)), esc(tr(first.action.text)))}</p>` : ''}
      <h2>${t('thinkDayQ', name)}</h2>
      <div class="pick-col">
        ${days.map((d, n) => `
          <button class="pick day-pick" type="button" data-n="${n}">
            <span class="pick-main">${t('dayLabel', esc(tr(d.day)), esc(tr(d.title)))}</span>
            <small>${t('dayMood', name, weatherFor(d))}</small>
          </button>`).join('')}
      </div>
    `, 'think-card');
    card.querySelectorAll('.pick').forEach((btn) => {
      btn.onclick = () => pickAction(days[Number(btn.dataset.n)]);
    });
  };

  // 玩完一整週，很難記得每天發生什麼：先提醒那天的事
  const pickAction = (day) => {
    const card = showPanel(`
      <div class="kicker">${kicker(2)}</div>
      <div class="think-recap">
        <div class="round-label">${t('dayTitle', esc(tr(day.day)), esc(tr(day.title)))}</div>
        <p>${esc(tr(day.recap) || '')}</p>
      </div>
      <h2 class="think-q">${t('thinkActQ')}</h2>
      <div class="pick-col">
        ${actionsFor(day).map((a, n) => `<button class="pick" type="button" data-n="${n}">${esc(tr(a.text))}</button>`).join('')}
      </div>
      <button class="text-btn" type="button" id="back">${t('otherDay')}</button>
    `, 'think-card');
    card.querySelectorAll('.pick').forEach((btn) => {
      btn.onclick = () => showResult(day, actionsFor(day)[Number(btn.dataset.n)]);
    });
    card.querySelector('#back').onclick = pickDay;
  };

  const showResult = (day, action) => {
    if (again && first) {
      const label = (d, a) => `${t('dayTitle', esc(tr(d.day)), esc(tr(d.title)))}<br>${esc(tr(a.text))}`;
      showPanel(`
        <div class="kicker">${kicker(3)}</div>
        <div class="compare">
          <div><span class="label">${t('firstLabel')}</span>${label(first.day, first.action)}</div>
          <div><span class="label">${t('nowLabel')}</span>${label(day, action)}</div>
        </div>
        <p>${first.day === day && first.action.text === action.text ? t('sameNote') : t('changedNote')}</p>
        <p><b>${t('youCanToo')}</b></p>
        <div class="btn-row"><button class="btn" type="button" id="go">${t('cont')}</button></div>
      `, 'think-card').querySelector('#go').onclick = next;
      return;
    }
    state.thinkFirst = { day, action };
    showPanel(`
      <div class="kicker">${kicker(3)}</div>
      <div class="round-label">${t('dayTitle', esc(tr(day.day)), esc(tr(day.title)))}</div>
      <p class="think-choice">${t('youChose', esc(tr(action.text)))}</p>
      ${action.result ? `<p class="think-result">${esc(tr(action.result))}</p>` : ''}
      <p>${t('differentMoment', name)}</p>
      <p><b>${t('youCanToo')}</b></p>
      <div class="btn-row"><button class="btn" type="button" id="go">${t('cont')}</button></div>
    `, 'think-card').querySelector('#go').onclick = next;
  };

  pickDay();
}

function stepClosing() {
  setHudVisible(false);
  const card = showPanel(`
    <div class="kicker">${t('closingKicker')}</div>
    <h2>${t('closingTitle')}</h2>
    <p class="big">${t('notYourFault')}</p>
    <ul>
      ${t('closingTips').map((tip) => `<li>${tip}</li>`).join('')}
    </ul>
    <div class="help-lines">
      ${HELP_LINES.map((h) => `<p><b>${esc(tr(h.name))}　${esc(h.number)}</b><br><span>${esc(tr(h.note))}</span></p>`).join('')}
    </div>
    <p>${t('bystanderTip')}</p>
    <div class="btn-row">
      ${state.thinkFirst ? `<button class="btn" type="button" id="rethink">${t('againBtn')}</button>` : ''}
      ${state.story ? `<button class="btn secondary" type="button" id="again">${t('playAgain')}</button>` : ''}
      <button class="btn secondary" type="button" id="home">${t('home')}</button>
    </div>
  `, 'closing-card', { page: true });
  // 綜合活動：各組上台分享後，回到「換你想一想」再選一次
  card.querySelector('#rethink')?.addEventListener('click', () => {
    insertAfterCurrent([{ k: 'think', again: true }, { k: 'closing' }]);
    next();
  });
  card.querySelector('#again')?.addEventListener('click', () => startStory(state.story.id));
  card.querySelector('#home').onclick = goHome;
}

// ---------- 暫停選單 ----------

function pause() {
  if (state.paused || !state.story) return;
  state.paused = true;
  const canFullscreen = document.fullscreenEnabled;
  const overlay = $('pause');
  overlay.hidden = false;
  overlay.innerHTML = `
    <div class="card paper-card pause-card" role="dialog" aria-label="${t('pauseMenu')}">
      <div class="kicker">${t('pauseKicker')}</div>
      <h2>${t('pauseTitle')}</h2>
      <p>${t('pauseText')}</p>
      <p class="help-inline">${t('pauseHelp', esc(tr(HELP_LINES[0].name)), esc(HELP_LINES[0].number))}</p>
      <div class="menu">
        <button class="btn" type="button" id="resume">${t('resume')}</button>
        <button class="btn secondary" type="button" id="restartStory">${t('restartStory')}</button>
        <button class="btn secondary" type="button" id="toHome">${t('home')}</button>
        ${canFullscreen ? `<button class="btn secondary" type="button" id="fullscreen">${document.fullscreenElement ? t('exitFullscreen') : t('fullscreen')}</button>` : ''}
        <button class="btn secondary" type="button" id="quit">${t('quit')}</button>
      </div>
    </div>`;
  overlay.addEventListener('click', (e) => e.stopPropagation(), { once: true });
  overlay.querySelector('#resume').onclick = resume;
  overlay.querySelector('#restartStory').onclick = () => startStory(state.story.id);
  overlay.querySelector('#toHome').onclick = goHome;
  overlay.querySelector('#fullscreen')?.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
    resume();
  });
  // 離開遊戲：直接到最後一頁（這不是你的錯、求助方式）
  overlay.querySelector('#quit').onclick = () => {
    resume();
    state.steps = [...state.steps.slice(0, state.i + 1), { k: 'closing' }];
    next();
  };
}

function resume() {
  state.paused = false;
  $('pause').hidden = true;
  $('pause').innerHTML = '';
}

// ---------- 操作 ----------

function advance() {
  if (state.paused) return;
  const step = state.steps[state.i];
  if (!step) return;
  // 卡片上的「繼續」也可以用空白鍵按；選擇題要自己點
  if (step.k) {
    // 只按看得到的「繼續」：還沒選完的卡片，空白鍵不能跳過
    const go = $('panel').querySelector('#go');
    if (go && go.offsetParent !== null) go.click();
    return;
  }
  if (finishTyping()) return;
  next();
}

$('stage').addEventListener('click', (e) => {
  if (e.target.closest('#panel, #pause, #hud')) return;
  advance();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (state.paused) resume();
    else pause();
    return;
  }
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
    if (e.target.closest?.('input, textarea, button, a')) return;
    e.preventDefault();
    advance();
  }
});

$('btnPause').onclick = pause;

function resetProgress() {
  state.i = 0;
  state.courage = START_COURAGE;
  state.witness = 0;
  state.kind = 0;
  state.flags = {};
  state.days = [];
  state.day = null;
  state.dayStep = null;
  state.diary = [];
  state.thinkFirst = null;
}

// 回主畫面：標題 → 選角色
function goHome() {
  resume();
  state.story = null;
  resetProgress();
  state.steps = [{ k: 'title' }, { k: 'select' }];
  run();
}

function startStory(id) {
  resume();
  state.story = STORIES.find((st) => st.id === id);
  resetProgress();
  // 每天結束、隔天的標題卡之前寫一篇日記；週五的日記在結局（運動會）之前
  const steps = [];
  state.story.story.forEach((s, n) => {
    if (s.k === 'day' && n > 0) steps.push({ k: 'diary' });
    steps.push(s);
  });
  state.steps = [...steps, { k: 'diary' }, { k: 'ending' }].map((s) => ({ ...s }));
  run();
}

applyLang();
goHome();
requestAnimationFrame(loop);
