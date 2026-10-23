import {
  STORIES, CHARACTERS, START_COURAGE, OVERNIGHT, ZHIHAO_INNER, HELP_LINES,
} from './story.js';
import { W, H, SCENES, FOREGROUNDS, drawChar, drawPortrait, sceneLabels } from './sprites.js';

const $ = (id) => document.getElementById(id);
const screen = $('screen');
const g = screen.getContext('2d');
const low = document.createElement('canvas');
low.width = W; low.height = H;
const lg = low.getContext('2d');

// 角色腳底的高度
const FLOOR_Y = 100;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const SCENE_NAMES = { classroom: '教室', track: '操場', sportsday: '運動會', home: '家裡', title: '操場' };

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
  view: { bg: 'title', chars: [], speaker: null },
  typing: null,
  paused: false,
};

// ---------- 繪圖 ----------

function render(t) {
  lg.imageSmoothingEnabled = false;
  (SCENES[state.view.bg] || SCENES.classroom)(lg, t);
  const speaking = state.view.speaker;
  const anySpeaker = speaking && state.view.chars.some((c) => c.id === speaking);
  state.view.chars.forEach((c, n) => {
    const talking = c.id === speaking;
    // 系統設定「減少動態效果」時，角色不晃動
    const bob = reducedMotion.matches ? 0
      : talking ? (Math.floor(t / 260) % 2) : (Math.floor((t + n * 400) / 900) % 2);
    drawChar(lg, c.id, c.x, FLOOR_Y, c.emo, { bob: -bob, dim: anySpeaker && !talking });
  });
  FOREGROUNDS[state.view.bg]?.(lg, t);
  g.imageSmoothingEnabled = false;
  g.drawImage(low, 0, 0, screen.width, screen.height);
  const k = screen.width / W;
  for (const label of sceneLabels(state.view.bg)) {
    g.font = `900 ${label.size * k}px 'Noto Sans TC', sans-serif`;
    g.fillStyle = label.color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(label.text, label.x * k, label.y * k);
  }
}

// 給螢幕閱讀器的場景描述：在哪裡、有誰。畫面內容改變時呼叫，不依賴動畫迴圈
function describeScene() {
  const label = [SCENE_NAMES[state.view.bg], state.view.chars.map((c) => nameOf(c.id)).join('、')]
    .filter(Boolean).join('：');
  screen.setAttribute('aria-label', label || '遊戲畫面');
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
  bar.setAttribute('aria-valuetext', `${state.courage}（滿分 100）`);
  fill.style.background = state.courage >= 60 ? 'var(--good)' : state.courage >= 35 ? 'var(--gold)' : 'var(--bad)';
  $('dayChip').textContent = state.day || '';
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
  if (id === state.story?.id) return '你';
  return (CHARACTERS[id] || CHARACTERS.narrator).name;
}

function showLine({ speaker, text, inner }) {
  hidePanel();
  $('dialog').classList.remove('idle');
  $('speaker').textContent = nameOf(speaker);
  state.view.speaker = speaker;
  const portrait = $('portrait');
  const emo = state.view.chars.find((c) => c.id === speaker)?.emo || 'neutral';
  portrait.classList.toggle('empty', !drawPortrait(portrait, speaker, emo));
  const innerEl = $('inner');
  innerEl.textContent = inner ? `心裡想：${inner}` : '';
  innerEl.hidden = true;
  // 打字效果會一直改動文字，所以螢幕閱讀器改念這一行完整的句子
  $('srLine').textContent = [nameOf(speaker), text, inner ? `心裡想：${inner}` : '']
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

function showPanel(html, cls = '') {
  clearDialog();
  const panel = $('panel');
  panel.innerHTML = `<div class="card pixel-box ${cls}">${html}</div>`;
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
  showPanel(`
    <div class="kicker">反霸凌體驗遊戲</div>
    <h1>五年三班<br>大隊接力</h1>
    <p class="sub">運動會前的一個禮拜。<br>選一個同學，過他的一週。</p>
    <div class="notice">
      這個故事裡會有同學之間不愉快的事，例如嘲笑和排擠。如果玩的時候覺得不舒服，可以隨時按右上角的「暫停」。
    </div>
    <div class="btn-row"><button class="btn" type="button" id="go">開始 ▶</button></div>
  `, 'title-card').querySelector('#go').onclick = next;
}

function stepSelect() {
  state.view.speaker = null;
  setHudVisible(false);
  const card = showPanel(`
    <div class="kicker">選擇角色</div>
    <h2>你想成為誰？</h2>
    <div class="roles">
      ${STORIES.map((st) => `
        <button class="role" type="button" data-id="${st.id}">
          <canvas width="64" height="64" data-p="${st.id}" aria-hidden="true"></canvas>
          <span class="role-text">
            <span class="role-name">${esc(st.name)}</span>
            <span class="role-blurb">${esc(st.blurb)}</span>
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
  state.view.bg = step.bg;
  state.view.chars = [];
  state.view.speaker = null;
  updateHud();
  showPanel(`
    <div class="kicker">${esc(step.day)}</div>
    <h1>${esc(step.title)}</h1>
    <div class="btn-row"><button class="btn" type="button" id="go">繼續 ▶</button></div>
  `, 'chapter-card').querySelector('#go').onclick = next;
}

function stepIf(step) {
  if (state.flags[step.flag]) insertAfterCurrent(step.then);
  next();
}

function stepChoice(step) {
  state.view.speaker = null;
  const card = showPanel(`
    <div class="kicker">你的選擇</div>
    <h2>${esc(step.prompt)}</h2>
    <div class="choices">
      ${step.options.map((o, n) => {
        const locked = (o.need || 0) > state.courage;
        // 說不出口時，顯示心裡具體在怕什麼：說不出口是因為處境太難，不是因為不夠勇敢
        return locked
          // 用 aria-disabled 而不是 disabled：螢幕閱讀器才會念到「說不出口」，不會直接跳過
          ? `<button class="choice locked" type="button" aria-disabled="true"><s>${esc(o.text)}</s><span class="why">（你現在說不出口）</span>${o.fear ? `<span class="fear">心裡想：${esc(o.fear)}</span>` : ''}</button>`
          : `<button class="choice" type="button" data-n="${n}">${esc(o.text)}</button>`;
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
      <div class="kicker">你可能不知道的事</div>
      <h2>志豪的內心話</h2>
      <p>${paragraphs(ZHIHAO_INNER)}</p>
      <div class="btn-row"><button class="btn" type="button" id="go">繼續 ▶</button></div>
    </div>
  `, 'inner-card');
  drawPortrait(card.querySelector('canvas'), 'zhihao', 'sad');
  card.querySelector('#go').onclick = next;
}

// 用「心裡的天氣」呈現每天的心情，而不是分數：心情低落不代表比較差
function weatherOf(energy) {
  if (energy >= 75) return { cls: 'sun', word: '晴天' };
  if (energy >= 55) return { cls: 'cloud', word: '多雲' };
  if (energy >= 35) return { cls: 'overcast', word: '陰天' };
  return { cls: 'rain', word: '下雨' };
}

function stepReflect() {
  state.view.bg = 'track';
  state.view.chars = [{ id: state.story.id, x: 96, emo: 'neutral' }];
  const tiles = state.days.map((d) => {
    const w = weatherOf(d.courage);
    return `
    <div class="wx-day">
      <span class="wx ${w.cls}" aria-hidden="true"><i></i></span>
      <span class="wx-word">${w.word}</span>
      <span class="wx-label">${esc(d.day)}</span>
    </div>`;
  }).join('');
  showPanel(`
    <div class="kicker">這一個禮拜</div>
    <h2>你心裡的天氣</h2>
    <div class="wx-row" role="list" aria-label="每天心裡的天氣">${tiles}</div>
    <div class="facts">
      <p>有 <b class="num">${state.witness}</b> 人次，看到了，卻沒有說話。</p>
      <p>有 <b class="num">${state.kind}</b> 次，有人對你伸出手。</p>
      <p class="quiet">對被欺負的人來說，一句「你還好嗎？」可能就改變了一整天。</p>
    </div>
    <div class="btn-row"><button class="btn" type="button" id="go">繼續 ▶</button></div>
  `, 'reflect-card').querySelector('#go').onclick = next;
}

// 換位思考：從被欺負的人回到旁觀者，想一件自己可以做的小事（不記錄、不評分）
function stepThink() {
  state.view.speaker = null;
  const st = state.story;
  const ta = st.pronoun || '他';
  const days = st.story.filter((s) => s.k === 'day');
  const actions = ['問一句：「你還好嗎？」', '不跟著笑', `陪${ta}一起走一段路`, '下課去告訴老師'];
  const card = showPanel(`
    <div class="kicker">換你想一想</div>
    <h2>如果你是五年三班的同學，你會在哪一天，走過去找${esc(st.name)}？</h2>
    <div class="pick-row" id="dayPick">
      ${days.map((d, n) => `<button class="pick" type="button" data-n="${n}">${esc(d.day)}<small>${esc(d.title)}</small></button>`).join('')}
    </div>
    <div id="actionPart" hidden>
      <div class="think-recap">
        <div class="round-label" id="recapHead"></div>
        <p id="recapText"></p>
      </div>
      <p class="think-q">那天，你可以做什麼？</p>
      <div class="pick-col" id="actionPick">
        ${actions.map((a, n) => `<button class="pick" type="button" data-n="${n}">${esc(a)}</button>`).join('')}
      </div>
    </div>
    <div id="thinkResult" hidden>
      <p class="think-result" id="thinkText"></p>
      <div class="btn-row"><button class="btn" type="button" id="go">繼續 ▶</button></div>
    </div>
  `, 'think-card');
  let dayN = null;
  const mark = (row, btn) => row.querySelectorAll('.pick').forEach((b) => b.classList.toggle('picked', b === btn));
  card.querySelectorAll('#dayPick .pick').forEach((btn) => {
    btn.onclick = () => {
      dayN = Number(btn.dataset.n);
      mark(card.querySelector('#dayPick'), btn);
      // 玩完一整週，很難記得每天發生什麼：先提醒那天的事和那天心裡的天氣
      const day = days[dayN];
      const mood = state.days.find((d) => d.day === day.day);
      card.querySelector('#recapHead').textContent =
        `${day.day}・${day.title}${mood ? `・${st.name}心裡的天氣：${weatherOf(mood.courage).word}` : ''}`;
      card.querySelector('#recapText').textContent = day.recap || '';
      card.querySelector('#actionPart').hidden = false;
    };
  });
  card.querySelectorAll('#actionPick .pick').forEach((btn) => {
    btn.onclick = () => {
      mark(card.querySelector('#actionPick'), btn);
      const day = days[dayN];
      card.querySelector('#thinkText').textContent =
        `${day.day}，「${day.title}」那天，你${actions[Number(btn.dataset.n)].replace('：', '')}。\n對${st.name}來說，這可能就是那個禮拜裡，最不一樣的一刻。\n現實中的你，也可以這樣做。`;
      card.querySelector('#thinkResult').hidden = false;
      card.querySelector('#go').onclick = next;
    };
  });
}

function stepClosing() {
  setHudVisible(false);
  const card = showPanel(`
    <div class="kicker">最後</div>
    <h2>如果你在現實生活中，也遇到類似的事</h2>
    <p class="big">這不是你的錯。</p>
    <ul>
      <li>告訴一個你信任的大人：爸爸媽媽、導師、輔導室或學務處的老師都可以。</li>
      <li>如果很難說出口，可以先寫下來，交給他們看。</li>
      <li>說出來之後，大人需要一點時間了解和處理。如果事情沒有馬上變好，那不是你的錯，可以再說一次，或找另一個大人。</li>
    </ul>
    <div class="help-lines">
      ${HELP_LINES.map((h) => `<p><b>${esc(h.name)}　${esc(h.number)}</b><br><span>${esc(h.note)}</span></p>`).join('')}
    </div>
    <p>如果你看到別人被這樣對待：你不用很勇敢。走過去問一句「你還好嗎？」，就很有用。</p>
    <div class="btn-row">
      ${state.story ? '<button class="btn" type="button" id="again">再玩一次</button>' : ''}
      <button class="btn secondary" type="button" id="home">回主畫面</button>
    </div>
  `, 'closing-card');
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
    <div class="card pixel-box pause-card" role="dialog" aria-label="暫停選單">
      <div class="kicker">暫停</div>
      <h2>休息一下</h2>
      <p>如果玩的時候想起不舒服的事，可以先停下來，找身邊信任的大人聊一聊。</p>
      <p class="help-inline">需要幫忙：${esc(HELP_LINES[0].name)} <b>${esc(HELP_LINES[0].number)}</b>（24 小時）</p>
      <div class="menu">
        <button class="btn" type="button" id="resume">繼續玩</button>
        <button class="btn secondary" type="button" id="restartStory">重新開始這個故事</button>
        <button class="btn secondary" type="button" id="toHome">回主畫面</button>
        ${canFullscreen ? `<button class="btn secondary" type="button" id="fullscreen">${document.fullscreenElement ? '離開全螢幕' : '全螢幕'}</button>` : ''}
        <button class="btn secondary" type="button" id="quit">離開遊戲</button>
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
  state.steps = [...state.story.story, { k: 'ending' }].map((s) => ({ ...s }));
  run();
}

goHome();
requestAnimationFrame(loop);
