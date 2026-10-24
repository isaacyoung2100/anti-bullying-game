import {
  STORIES, CHARACTERS, START_COURAGE, OVERNIGHT, ZHIHAO_INNER, HELP_LINES,
} from './story.js?v=dev';
import { W, drawScene, drawForeground, drawProps, drawLight, drawChar, drawPortrait, sceneLabels } from './sprites.js?v=dev';
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
  thinkAgain: null,   // 「聽完分享，再想一次」的選擇（分享圖用最後一次的選擇）
  history: [],        // 看過的台詞（和當時的畫面），給「上一句」重看
  back: null,         // 正在重看：{ index, from: 'line' | 'panel' }
  anim: null,         // 場景動作：{ type: 'run' | 'shake' | 'jump' | 'cheer', who, t0 }
  view: { bg: 'title', chars: [], speaker: null, phone: null, props: [] },
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

// 場景動作的長度（毫秒）和跑步的距離
const ANIM_MS = { run: 1300, shake: 500, jump: 1400, cheer: 1200 };
const RUN_DIST = 70;

// 跑步要跑多遠：不跑出照片（直向畫面只看得到 x 約 24–168）；
// 終點有人就停在他旁邊，太近的話從他前面跑過去
const RUN_MAX = 158;
function runDistance(id) {
  const me = state.view.chars.find((c) => c.id === id);
  if (!me) return 0;
  let target = Math.min(me.x + RUN_DIST, RUN_MAX);
  const block = state.view.chars.find((c) => c.id !== id && Math.abs(c.x - target) < 22);
  if (block) {
    target = block.x - 24;
    if (target - me.x < 20) target = Math.min(block.x + 24, RUN_MAX);
  }
  return Math.max(0, target - me.x);
}
const ease = (p) => 1 - (1 - p) * (1 - p);

function render(time) {
  // 系統設定「減少動態效果」時，線條和角色都不動
  const still = reducedMotion.matches;
  const boil = still ? 0 : Math.floor(time / 380) % 3;
  const k = screen.width / W;
  const anim = still ? null : state.anim;
  const ap = anim ? Math.min(1, (time - anim.t0) / ANIM_MS[anim.type]) : 1;
  // 搖晃：很大的聲音時，整個畫面晃一下
  const shake = anim?.type === 'shake' ? (1 - ap) * 2.4 * Math.sin(time / 22) : 0;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#fbf7ee';
  g.fillRect(0, 0, screen.width, screen.height);
  g.drawImage(backdrop(state.view.bg, boil), shake * k, 0);
  g.setTransform(k, 0, 0, k, shake * k, 0);
  const speaking = state.view.speaker;
  const anySpeaker = speaking && state.view.chars.some((c) => c.id === speaking);
  const sports = state.view.bg === 'sportsday';
  const order = anim?.type === 'run'
    ? [...state.view.chars].sort((a, b) => anim.who.includes(a.id) - anim.who.includes(b.id))
    : state.view.chars;
  order.forEach((c, n) => {
    const talking = c.id === speaking;
    let bob = still ? 0
      : -0.8 * (talking ? (Math.floor(time / 260) % 2) : (Math.floor((time + n * 400) / 900) % 2));
    let { x } = c;
    let stride = 0;
    // 走進來：同一個場景有人加入時，從旁邊走進畫面
    if (c.enter && !still) {
      const p = Math.min(1, (time - c.enter.t0) / 500);
      x += c.enter.dx * (1 - ease(p));
      if (p < 1) stride = Math.sin(time / 60);
      else delete c.enter;
    }
    const mine = anim && anim.who.includes(c.id);
    if (mine && anim.type === 'run') {
      x += anim.dist * ease(ap);
      if (ap < 1) { stride = Math.sin(time / 45); bob = -Math.abs(Math.sin(time / 45)) * 1.6; }
    }
    if (mine && (anim.type === 'jump' || anim.type === 'cheer')) {
      bob = -Math.abs(Math.sin((time - anim.t0) / 120)) * 5 * (1 - ap);
    }
    drawChar(g, c.id, x, FLOOR_Y, c.emo, { bob, dim: anySpeaker && !talking, boil, stride, sports, outfit: c.outfit || [] });
  });
  // 動作做完：跑完的人停在終點
  if (anim && ap >= 1) {
    if (anim.type === 'run') state.view.chars.forEach((c) => { if (anim.who.includes(c.id)) c.x += anim.dist; });
    state.anim = null;
  }
  drawForeground(g, state.view.bg, boil);
  drawProps(g, state.view.props, boil);
  drawLight(g, state.view.bg);
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

// 名字框顯示角色的名字（玩家扮演的角色也一樣，例如「小雨」）；旁白仍用「你」
function nameOf(id) {
  if (id === state.story?.id) return tr(state.story.name);
  return tr((CHARACTERS[id] || CHARACTERS.narrator).name);
}

// ---------- 手機畫面（群組、私訊） ----------
// 台詞可以帶 phone：{ title, sub, msgs, upto, off }，畫面右邊出現一支手機
// msgs 的每一則：{ from, text }、{ from, sticker }、{ from, photo: true, text }（照片和照片上的字）、
// { me: true, text | sticker, seen }、{ system }（群組的系統訊息）、{ toast }（例如截圖已儲存）
// upto：這一句只顯示到第幾則，讓訊息跟著劇情一則一則跳出來

function renderPhone() {
  const el = $('phone');
  const p = state.view.phone;
  if (!p) {
    el.hidden = true;
    el.innerHTML = '';
    el.dataset.title = '';
    return;
  }
  const msgs = p.off ? [] : p.msgs.slice(0, p.upto ?? p.msgs.length);
  // 同一個聊天室，新多出來的訊息才有跳出來的動畫
  const same = el.dataset.title === (p.title || '') && !el.hidden;
  const shown = same ? Number(el.dataset.count || 0) : 0;
  const seen = (m) => (m.seen ? `<span class="meta">${m.seen === true ? t('seenDm') : t('seen', m.seen)}</span>` : '');
  const body = (m) => {
    if (m.sticker) return `<span class="sticker" aria-hidden="true">${m.sticker}</span>`;
    if (m.photo) return `<span class="photo"><span class="photo-pic" aria-hidden="true">🧥</span><span class="photo-cap">${esc(tr(m.text))}</span></span>`;
    return `<span class="bubble">${esc(tr(m.text))}</span>`;
  };
  const html = msgs.map((m, i) => {
    const cls = i >= shown ? ' new' : '';
    if (m.system) return `<p class="sys${cls}">${esc(tr(m.system))}</p>`;
    if (m.toast) return `<p class="toast${cls}">${esc(tr(m.toast))}</p>`;
    if (m.me) return `<div class="msg me${cls}">${seen(m)}${body(m)}</div>`;
    return `<div class="msg${cls}"><span class="avatar" aria-hidden="true"></span><span class="col"><span class="from">${esc(tr(m.from))}</span>${body(m)}</span>${seen(m)}</div>`;
  }).join('');
  el.innerHTML = p.off
    ? '<div class="screen off"></div>'
    : `<div class="screen">
        <div class="bar"><span aria-hidden="true">‹</span><b>${esc(tr(p.title))}</b>${p.sub ? `<small>${esc(tr(p.sub))}</small>` : ''}</div>
        <div class="chat">${html}</div>
      </div>`;
  el.classList.toggle('rise', !same);
  el.hidden = false;
  el.dataset.title = p.title || '';
  el.dataset.count = String(msgs.length);
  const chat = el.querySelector('.chat');
  if (chat) chat.scrollTop = chat.scrollHeight;
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
  const who = state.view.chars.find((c) => c.id === speaker);
  const look = { sports: state.view.bg === 'sportsday', outfit: who?.outfit || [] };
  portrait.classList.toggle('empty', !drawPortrait(portrait, speaker, who?.emo || 'neutral', look));
  const innerEl = $('inner');
  innerEl.textContent = inner ? `${t('innerPrefix')}${inner}` : '';
  innerEl.hidden = true;
  // 打字效果會一直改動文字，所以螢幕閱讀器改念這一行完整的句子
  $('srLine').textContent = [nameOf(speaker), text, inner ? `${t('innerPrefix')}${inner}` : '']
    .filter(Boolean).join(' ');
  describeScene();
  renderPhone();
  const canBack = state.back ? state.back.index > 0 : state.history.length > 1;
  $('btnBack').hidden = !canBack;
  $('dialog').classList.toggle('past', !!state.back);
  $('nextHint').textContent = state.back ? t('backHint') : t('nextHint');
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
  if (state.anim?.type === 'run') {
    // 上一句的跑步還沒跑完就點下一句：直接停在終點
    state.view.chars.forEach((c) => { if (state.anim.who.includes(c.id)) c.x += state.anim.dist; });
  }
  state.anim = null;
  if (step.bg) {
    const before = state.view.bg === step.bg ? new Set(state.view.chars.map((c) => c.id)) : null;
    const outfits = Object.fromEntries(state.view.chars.map((c) => [c.id, c.outfit]));
    state.view.bg = step.bg;
    // 裝扮只在同一個場景裡留著（換場景就換回原本的衣服）
    state.view.chars = (step.chars || []).map((c) => ({ ...c, outfit: before ? outfits[c.id] : undefined }));
    // 同一個場景有新的人加入：讓他從旁邊走進來
    if (before) {
      const now = performance.now();
      state.view.chars.forEach((c) => {
        if (!before.has(c.id)) c.enter = { t0: now, dx: c.x < W / 2 ? -50 : 50 };
      });
    }
  }
  if (step.bg) { state.view.phone = null; state.view.props = []; }
  if ('phone' in step) state.view.phone = step.phone;
  // 場景道具：散落的鉛筆、金色的筆、海報……（換場景就收起來）
  if (step.props) state.view.props = step.props;
  // 劇情裡加上的裝扮，例如戴上耳罩
  if (step.wear) {
    for (const [id, items] of Object.entries(step.wear)) {
      const c = state.view.chars.find((x) => x.id === id);
      if (c) c.outfit = [...(c.outfit || []), ...items];
    }
  }
  if (step.anim) {
    const me = state.story.id;
    const others = state.view.chars.map((c) => c.id).filter((id) => id !== me);
    const who = {
      run: [me],
      shake: [],
      jump: state.view.chars.map((c) => c.id),
      cheer: step.speaker !== 'narrator' && step.speaker !== me && others.includes(step.speaker) ? [step.speaker] : others,
    }[step.anim];
    state.anim = { type: step.anim, who, t0: performance.now(), dist: step.anim === 'run' ? runDistance(me) : 0 };
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
  state.history.push({ step, bg: state.view.bg, phone: state.view.phone, props: state.view.props, chars: state.view.chars.map(({ enter, ...c }) => ({ ...c })) });
  showLine(step);
}

// ---------- 上一句：重看剛剛的台詞 ----------
// 只是重看文字，不會再改變心靈能量，也不能重選；看完往前點，就回到原本的地方

function showPast() {
  const e = state.history[state.back.index];
  state.view.bg = e.bg;
  state.view.phone = e.phone;
  state.view.props = e.props;
  state.view.chars = e.chars.map((c) => ({ ...c }));
  showLine(e.step);
  finishTyping();
}

function goBack() {
  if (state.paused || !state.story) return;
  if (!state.back) {
    // 在選擇題這類卡片上，最後一句就是剛剛的台詞；在台詞上，要看的是前一句
    const k = state.steps[state.i]?.k;
    // 卡片裡只有選擇題可以回去看（標題卡、日記重跑一次會重複加能量或清掉內容）
    if (k && k !== 'choice') return;
    const onPanel = k === 'choice';
    const index = state.history.length - (onPanel ? 1 : 2);
    if (index < 0) return;
    finishTyping();
    state.back = { index, from: onPanel ? 'panel' : 'line' };
  } else {
    if (state.back.index === 0) return;
    state.back.index -= 1;
  }
  showPast();
}

// 重看時往前：看完最後一句就回到原本的台詞或卡片
function goForward() {
  const last = state.history.length - 1;
  state.back.index += 1;
  if (state.back.from === 'line' && state.back.index >= last) {
    state.back = null;
    const e = state.history[last];
    state.view.bg = e.bg;
    state.view.phone = e.phone;
    state.view.props = e.props;
    state.view.chars = e.chars.map((c) => ({ ...c }));
    showLine(e.step);
    finishTyping();
    return;
  }
  if (state.back.from === 'panel' && state.back.index > last) {
    state.back = null;
    run();
    return;
  }
  showPast();
}

function stepTitle() {
  state.view.phone = null;
  renderPhone();
  $('sceneCaption').textContent = '';
  state.view.bg = 'title';
  state.view.props = [];
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
  $('btnBack').textContent = t('back');
  $('btnBack').setAttribute('aria-label', t('backLabel'));
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
  state.view.phone = null;
  renderPhone();
  $('sceneCaption').textContent = t('dayTitle', tr(step.day), tr(step.title));
  state.view.bg = step.bg;
  state.view.chars = [];
  state.view.props = [];
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
    ${state.history.length ? `<button class="text-btn" type="button" id="review">${t('reviewBtn')}</button>` : ''}
  `, 'choice-card');
  card.querySelector('#review')?.addEventListener('click', goBack);
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
// 日記只留在這次遊戲裡，不上傳、不記錄；選心情和情緒詞是必要的，寫字可以留白
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
    nextBtn.onclick = write;
  };

  const write = () => {
    const card = showPanel(`
      ${dateTag}
      <div><span class="picked-feel ${entry.quad}">${quads[entry.quad].face} ${t('diaryFeel', esc(entry.word))}</span></div>
      ${prompts.map((p, i) => `
        <p class="diary-q"><label for="ans${i}">${esc(p)}</label></p>
        <textarea class="diary-text" id="ans${i}" maxlength="300" placeholder="${t('diaryTextPlaceholder')}"></textarea>`).join('')}
      <div class="btn-row">
        <button class="btn" type="button" id="go">${t('diaryDone')}</button>
      </div>
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
        : e.prompts.map((p, i) => `<p class="q">${esc(p)}</p>${e.answers[i] ? `<p>${esc(e.answers[i])}</p>` : ''}`).join('')}
    </div>`).join('');
}

// ---------- 結局與反思 ----------

function stepEnding() {
  // 每個角色只有一個結局：欺負的人和旁觀者的行為固定，前面發生的事只透過旗標加入細節
  insertAfterCurrent([...state.story.ending, { k: 'zhihao' }, { k: 'reflect' }, { k: 'think' }, { k: 'closing' }]);
  next();
}

function stepZhihao() {
  state.view.phone = null;
  renderPhone();
  state.days.push({ day: state.day, courage: state.courage });
  state.view.bg = 'classroom';
  state.view.props = [];
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
  state.view.props = [];
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
      state.thinkAgain = { day, action };
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

// ---------- 分享給朋友 ----------
// 玩完可以把「我玩了這個遊戲」做成一張圖分享出去，讓朋友也來玩
// 只放角色、心裡的天氣和「換你想一想」選的小事；日記內容是自己的，不放進去；什麼都不上傳

const GAME_URL = 'https://isaacyoung2100.github.io/anti-bullying-game/';
const shareUrl = () => (getLang() === 'en' ? `${GAME_URL}?lang=en` : GAME_URL);

// 文字換行：中文一個字一個字斷，英文一個詞一個詞斷
function wrapText(g, text, maxWidth) {
  const tokens = text.match(/[\u3000-\u9fff\uff00-\uffef]|[^\s\u3000-\u9fff\uff00-\uffef]+\s*|\s+/g) || [];
  const lines = [];
  let cur = '';
  for (const tok of tokens) {
    if (cur && g.measureText(cur + tok).width > maxWidth) {
      lines.push(cur.trimEnd());
      cur = tok.trimStart();
    } else {
      cur += tok;
    }
  }
  if (cur.trim()) lines.push(cur.trimEnd());
  return lines;
}

function shareCard() {
  const cv = document.createElement('canvas');
  cv.width = 1080; cv.height = 1350;
  const g = cv.getContext('2d');
  const font = getComputedStyle(document.body).fontFamily;
  const ink = '#3a3140';
  const set = (size, weight = 700, color = ink) => { g.font = `${weight} ${size}px ${font}`; g.fillStyle = color; };

  // 日記本的一頁：橫線、紅色邊線、裝訂孔
  g.fillStyle = '#fbf7ee';
  g.fillRect(0, 0, cv.width, cv.height);
  g.strokeStyle = '#d3e0ec';
  g.lineWidth = 2;
  for (let y = 120; y < cv.height; y += 72) { g.beginPath(); g.moveTo(0, y); g.lineTo(cv.width, y); g.stroke(); }
  g.fillStyle = '#eba3a3';
  g.fillRect(96, 0, 4, cv.height);
  g.fillStyle = '#2b2420';
  for (let y = 70; y < cv.height; y += 130) { g.beginPath(); g.arc(46, y, 15, 0, Math.PI * 2); g.fill(); }

  const left = 150;
  const width = cv.width - left - 80;
  set(40, 700, '#d0463c');
  g.fillText(t('shareKicker'), left, 110);
  // 標題畫上螢光筆
  set(84);
  const title = t('gameTitle');
  g.fillStyle = 'rgba(255, 226, 122, 0.85)';
  g.fillRect(left - 8, 150, Math.min(g.measureText(title).width + 16, width), 44);
  set(84);
  g.fillText(title, left, 200);

  // 角色頭像（圓形貼紙）
  const pc = document.createElement('canvas');
  pc.width = 240; pc.height = 240;
  drawPortrait(pc, state.story.id, 'happy');
  g.save();
  g.fillStyle = '#ffffff';
  g.beginPath(); g.arc(left + 120, 380, 132, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff3d6';
  g.beginPath(); g.arc(left + 120, 380, 118, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(left + 120, 380, 118, 0, Math.PI * 2); g.clip();
  g.drawImage(pc, left, 260, 240, 240);
  g.restore();
  set(46);
  wrapText(g, t('shareWho', tr(state.story.name)), width - 290).forEach((l, i) => g.fillText(l, left + 290, 350 + i * 64));

  // 心裡的天氣
  set(36, 700, '#d0463c');
  g.fillText(t('shareWeather'), left, 600);
  const tile = Math.min(130, (width - 5 * 14) / 6);
  state.days.slice(0, 6).forEach((d, i) => {
    const x = left + i * (tile + 14);
    const w = weatherOf(d.courage);
    g.fillStyle = '#ffffff';
    g.strokeStyle = ink;
    g.lineWidth = 3;
    g.beginPath(); g.roundRect(x, 630, tile, 170, 14); g.fill(); g.stroke();
    g.font = `64px ${font}`;
    g.textAlign = 'center';
    g.fillText(w.icon, x + tile / 2, 715);
    set(30);
    g.textAlign = 'center';
    g.fillText(w.word, x + tile / 2, 758);
    set(26, 400, '#6f6578');
    g.textAlign = 'center';
    g.fillText(shortDay(d.day), x + tile / 2, 790);
    g.textAlign = 'left';
  });

  // 換你想一想選的小事（最後一次的選擇）
  const pick = state.thinkAgain || state.thinkFirst;
  if (pick) {
    set(40);
    const lines = wrapText(g, t('shareAct', tr(pick.day.day), tr(pick.action.text)), width - 60);
    const h = 44 + lines.length * 58;
    g.fillStyle = '#ffffff';
    g.strokeStyle = ink;
    g.lineWidth = 4;
    g.beginPath(); g.roundRect(left, 850, width, h, 18); g.fill(); g.stroke();
    set(40);
    lines.forEach((l, i) => g.fillText(l, left + 30, 910 + i * 58));
  }

  set(40);
  g.fillText(t('shareInvite'), left, 1200);
  set(34, 700, '#3b6fb6');
  g.fillText(shareUrl().replace('https://', ''), left, 1255);
  return cv;
}

function stepShare() {
  const cv = shareCard();
  const png = cv.toDataURL('image/png');
  const text = t('shareText', tr(state.story.name));
  const card = showPanel(`
    <div class="kicker">${t('shareKicker2')}</div>
    <h2>${t('shareTitle')}</h2>
    <img class="share-img" src="${png}" alt="${esc(t('shareAlt', tr(state.story.name)))}">
    <p class="diary-hint">${t('shareHold')}</p>
    <div class="share-btns">
      ${navigator.share ? `<button class="btn" type="button" id="doShare">${t('shareBtn')}</button>` : ''}
      <a class="btn secondary" id="download" href="${png}" download="${esc(t('gameTitle'))}.png">${t('shareDownload')}</a>
      <button class="btn secondary" type="button" id="copy">${t('shareCopy')}</button>
    </div>
    <p class="share-note" id="shareNote" aria-live="polite"></p>
    <div class="btn-row"><button class="btn secondary" type="button" id="go">${t('shareBack')}</button></div>
  `, 'share-card', { page: true });
  const note = card.querySelector('#shareNote');
  card.querySelector('#doShare')?.addEventListener('click', async () => {
    try {
      const blob = await new Promise((r) => cv.toBlob(r, 'image/png'));
      const file = new File([blob], `${t('gameTitle')}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text, url: shareUrl() });
      else await navigator.share({ title: t('gameTitle'), text, url: shareUrl() });
    } catch { /* 使用者取消分享，或瀏覽器不允許 */ }
  });
  card.querySelector('#copy').onclick = async () => {
    try {
      await navigator.clipboard.writeText(`${text} ${shareUrl()}`);
      note.textContent = t('shareCopied');
    } catch {
      note.textContent = `${text} ${shareUrl()}`;
    }
  };
  card.querySelector('#go').onclick = stepClosing;
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
    ${state.story ? `<button class="btn share-btn" type="button" id="share">${t('shareOpen')}</button>` : ''}
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
  card.querySelector('#share')?.addEventListener('click', stepShare);
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
  // 正在重看剛剛的台詞：往前看下一句（從選擇題回來看的也一樣）
  if (state.back) {
    if (!finishTyping()) goForward();
    return;
  }
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
  if (e.target.closest('#panel, #pause, #hud, #btnBack')) return;
  advance();
});

$('btnBack').onclick = (e) => { e.stopPropagation(); goBack(); };

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
  if (e.key === 'ArrowLeft' && !e.target.closest?.('input, textarea')) goBack();
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
  state.thinkAgain = null;
  state.history = [];
  state.back = null;
  state.anim = null;
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
