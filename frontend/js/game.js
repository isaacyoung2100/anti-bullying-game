import {
  PLAYER, CHARACTERS, START_COURAGE, OVERNIGHT, STORY, ENDINGS, ZHIHAO_INNER, BRAVE_THRESHOLD,
} from './story.js';
import { W, H, SCENES, FOREGROUNDS, drawChar, drawPortrait, sceneLabels } from './sprites.js';

const $ = (id) => document.getElementById(id);
const screen = $('screen');
const g = screen.getContext('2d');
const low = document.createElement('canvas');
low.width = W; low.height = H;
const lg = low.getContext('2d');

// 角色腳底的高度：要高於對話框，角色才不會被擋住
const FLOOR_Y = 77;

const state = {
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
    const bob = talking ? (Math.floor(t / 260) % 2) : (Math.floor((t + n * 400) / 900) % 2);
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

let lastFrame = 0;
function loop(t) {
  if (t - lastFrame > 80) { render(t); lastFrame = t; }
  requestAnimationFrame(loop);
}

// ---------- 勇氣值 ----------

function clamp(n) { return Math.max(0, Math.min(100, n)); }

function updateHud(delta) {
  $('hud').hidden = false;
  const fill = $('courageFill');
  fill.style.width = `${state.courage}%`;
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

function showLine({ speaker, text, inner }) {
  hidePanel();
  $('dialog').hidden = false;
  const who = CHARACTERS[speaker] || CHARACTERS.narrator;
  $('speaker').textContent = who.name;
  state.view.speaker = speaker;
  const portrait = $('portrait');
  const emo = state.view.chars.find((c) => c.id === speaker)?.emo || 'neutral';
  portrait.classList.toggle('empty', !drawPortrait(portrait, speaker, emo));
  const innerEl = $('inner');
  innerEl.textContent = inner ? `心裡想：${inner}` : '';
  innerEl.hidden = true;
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

// ---------- 面板 ----------

function showPanel(html, cls = '') {
  $('dialog').hidden = true;
  const panel = $('panel');
  panel.innerHTML = `<div class="card pixel-box ${cls}">${html}</div>`;
  panel.hidden = false;
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
    day: stepDay,
    choice: stepChoice,
    if: stepIf,
    ending: stepEnding,
    zhihao: stepZhihao,
    reflect: stepReflect,
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
    const target = state.view.chars.some((c) => c.id === step.speaker) ? step.speaker : PLAYER;
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
  $('hud').hidden = true;
  showPanel(`
    <div class="kicker">反霸凌體驗遊戲</div>
    <h1>五年三班大隊接力</h1>
    <p class="sub">運動會前的一個禮拜。這一次，你是阿哲。</p>
    <div class="notice">
      在這個遊戲裡，你會成為一個被同學欺負的孩子。<br>
      如果玩的時候覺得難受，可以隨時按畫面下方的「暫停」。
    </div>
    <div class="btn-row"><button class="btn" type="button" id="go">開始 ▶</button></div>
  `, 'title-card').querySelector('#go').onclick = next;
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
        return locked
          ? `<button class="choice locked" type="button" disabled><s>${esc(o.text)}</s><span class="why">（你現在說不出口）</span></button>`
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
  const key = state.courage >= BRAVE_THRESHOLD ? 'brave' : 'heavy';
  state.ending = key;
  insertAfterCurrent([...ENDINGS[key], { k: 'zhihao' }, { k: 'reflect' }, { k: 'closing' }]);
  next();
}

function stepZhihao() {
  state.days.push({ day: state.day, courage: state.courage });
  state.view.bg = 'classroom';
  state.view.chars = [{ id: 'zhihao', x: 96, emo: 'sad' }];
  state.view.speaker = null;
  const card = showPanel(`
    <canvas class="portrait-lg" width="128" height="128"></canvas>
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

function stepReflect() {
  state.view.bg = 'track';
  state.view.chars = [{ id: 'azhe', x: 96, emo: state.ending === 'brave' ? 'happy' : 'neutral' }];
  const bars = state.days.map((d) => `
    <div class="day-bar">
      <span class="bar-wrap"><span class="bar-fill" style="height:${d.courage}%"></span></span>
      <span class="bar-label">${esc(d.day)}</span>
    </div>`).join('');
  showPanel(`
    <div class="kicker">這一個禮拜</div>
    <h2>你的勇氣，每天都不一樣</h2>
    <div class="reflect-grid">
      <div class="day-bars" role="img" aria-label="每天的勇氣值">${bars}</div>
      <div class="facts">
        <p><b class="num">${state.witness}</b> 次，有人看到了，卻沒有說話。</p>
        <p><b class="num">${state.kind}</b> 次，有人對你伸出手。</p>
        <p class="quiet">對被欺負的人來說，一句「你還好嗎？」可能就改變了一整天。</p>
      </div>
    </div>
    <div class="btn-row"><button class="btn" type="button" id="go">繼續 ▶</button></div>
  `, 'reflect-card').querySelector('#go').onclick = next;
}

function stepClosing() {
  $('hud').hidden = true;
  const card = showPanel(`
    <div class="kicker">最後</div>
    <h2>如果你在現實生活中，也遇到類似的事</h2>
    <p class="big">這不是你的錯。</p>
    <ul>
      <li>告訴一個你信任的大人：爸爸媽媽、老師、輔導老師都可以。</li>
      <li>如果很難說出口，可以先寫下來，交給他們看。</li>
      <li>安心專線 <b>1925</b>（24 小時）、保護專線 <b>113</b>。</li>
    </ul>
    <p>如果你看到別人被這樣對待：你不用很勇敢。走過去問一句「你還好嗎？」，就很有用。</p>
    <div class="btn-row"><button class="btn" type="button" id="again">再玩一次</button></div>
  `, 'closing-card');
  card.querySelector('#again').onclick = restart;
}

// ---------- 暫停 ----------

function pause() {
  if (state.paused) return;
  state.paused = true;
  const overlay = $('pause');
  overlay.hidden = false;
  overlay.innerHTML = `
    <div class="card pixel-box pause-card">
      <div class="kicker">休息一下</div>
      <h2>沒關係，可以先停下來</h2>
      <p>如果玩的時候想起不舒服的事，可以找身邊信任的大人聊一聊。</p>
      <div class="btn-row">
        <button class="btn" type="button" id="resume">繼續玩</button>
        <button class="btn secondary" type="button" id="quit">結束遊戲</button>
      </div>
    </div>`;
  overlay.querySelector('#resume').onclick = resume;
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
    $('panel').querySelector('#go')?.click();
    return;
  }
  if (finishTyping()) return;
  next();
}

$('stage').addEventListener('click', (e) => {
  if (e.target.closest('#panel, #pause')) return;
  advance();
});

document.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
    if (e.target.closest?.('input, textarea, button, a')) return;
    e.preventDefault();
    advance();
  }
  if (e.key === 'Escape') pause();
});

$('btnFullscreen').onclick = () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
};

$('btnPause').onclick = pause;

$('btnRestart').onclick = () => {
  if (confirm('要重新開始嗎？')) restart();
};

function restart() {
  resume();
  state.steps = [{ k: 'title' }, ...STORY, { k: 'ending' }].map((s) => ({ ...s }));
  state.i = 0;
  state.courage = START_COURAGE;
  state.witness = 0;
  state.kind = 0;
  state.flags = {};
  state.days = [];
  state.day = null;
  state.ending = null;
  run();
}

restart();
requestAnimationFrame(loop);
