import {
  CHARACTERS, TYPE_EFFECT, PROLOGUE, CHAPTERS, ZHIHAO_INNER, ENDINGS, FALLBACK_DEBRIEF,
} from './story.js';
import { W, H, SCENES, drawChar, drawPortrait, sceneLabels } from './sprites.js';

const $ = (id) => document.getElementById(id);
const screen = $('screen');
const g = screen.getContext('2d');
const low = document.createElement('canvas');
low.width = W; low.height = H;
const lg = low.getContext('2d');

// 角色腳底的高度：要高於對話框，角色才不會被擋住
const FLOOR_Y = 77;
const TARGETS = ['azhe', 'xiaoyu', 'aming'];
const KIDS = ['azhe', 'xiaoyu', 'aming', 'zhihao', 'jiajia'];
const TYPE_COLOR = { side: 'var(--opt-a)', silent: 'var(--opt-b)', defend: 'var(--opt-c)', help: 'var(--opt-d)' };

const state = {
  steps: [],
  i: 0,
  mood: 50,
  trust: { azhe: 50, xiaoyu: 50, aming: 50 },
  choices: [],
  view: { bg: 'title', chars: [], speaker: null },
  room: null,           // { code, token }
  tablet: false,        // true：學生用平板投票；false：舉手計票
  codeRequired: false,  // 伺服器是否要求老師通行碼
  ai: 'unknown',        // 'on' | 'off' | 'unknown'
  session: Math.random().toString(36).slice(2, 10),
  typing: null,
  lanBase: null,
};

// ---------- API ----------

async function api(path, { method = 'GET', body, token, timeout = 8000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(path, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        // 老師端的請求都帶上房間憑證；AI 與紀錄只接受有房間的老師端
        ...(state.room ? { 'X-Room': state.room.code, 'X-Teacher-Token': state.room.token } : {}),
        ...(token ? { 'X-Teacher-Token': token } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function log(kind, payload) {
  api('/api/log', { method: 'POST', body: { session: state.session, kind, payload } }).catch(() => {});
}

// ---------- 繪圖 ----------

function render(t) {
  const scene = SCENES[state.view.bg] || SCENES.classroom;
  lg.imageSmoothingEnabled = false;
  scene(lg, t);
  const speaking = state.view.speaker;
  const anySpeaker = speaking && state.view.chars.some((c) => c.id === speaking);
  state.view.chars.forEach((c, n) => {
    const talking = c.id === speaking;
    const bob = talking ? (Math.floor(t / 260) % 2) : (Math.floor((t + n * 400) / 900) % 2);
    drawChar(lg, c.id, c.x, c.y ?? FLOOR_Y, c.emo, {
      scale: c.scale ?? 2, bob: -bob, dim: anySpeaker && !talking, flip: c.flip,
    });
  });
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

// ---------- HUD ----------

function updateHud(delta) {
  $('hud').hidden = false;
  const fill = $('moodFill');
  fill.style.width = `${state.mood}%`;
  fill.style.background = state.mood >= 60 ? 'var(--good)' : state.mood >= 40 ? 'var(--gold)' : 'var(--bad)';
  const d = $('moodDelta');
  if (delta) {
    d.textContent = delta > 0 ? `+${delta}` : `${delta}`;
    d.className = `mood-delta ${delta > 0 ? 'up' : 'down'}`;
    setTimeout(() => { d.textContent = ''; }, 3000);
  }
  const room = $('roomChip');
  room.hidden = !state.tablet;
  if (state.tablet) room.textContent = `房間 ${state.room.code}`;
  const ai = $('aiChip');
  ai.hidden = state.ai === 'unknown';
  ai.textContent = state.ai === 'on' ? 'AI 角色反應' : '預設劇情';
  ai.classList.toggle('offline', state.ai !== 'on');
}

// ---------- 對話 ----------

function showLine({ speaker, text }) {
  hidePanel();
  const dlg = $('dialog');
  dlg.hidden = false;
  const who = CHARACTERS[speaker] || CHARACTERS.narrator;
  $('speaker').textContent = who.name;
  state.view.speaker = speaker;
  const portrait = $('portrait');
  const emo = state.view.chars.find((c) => c.id === speaker)?.emo || 'neutral';
  portrait.classList.toggle('empty', !drawPortrait(portrait, speaker, emo));
  typeText(text);
}

function typeText(text) {
  const el = $('line');
  const hint = $('nextHint');
  clearInterval(state.typing?.timer);
  let n = 0;
  el.textContent = '';
  hint.classList.add('hide');
  const timer = setInterval(() => {
    n += 1;
    el.textContent = text.slice(0, n);
    if (n >= text.length) finishTyping();
  }, 35);
  state.typing = { timer, text };
}

function finishTyping() {
  if (!state.typing) return false;
  clearInterval(state.typing.timer);
  $('line').textContent = state.typing.text;
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
  return panel.firstElementChild;
}

function hidePanel() {
  $('panel').hidden = true;
  $('panel').innerHTML = '';
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// ---------- 流程 ----------

function buildSteps() {
  const steps = [{ k: 'title' }];
  PROLOGUE.forEach((l) => steps.push({ k: 'line', ...l }));
  CHAPTERS.forEach((ch) => {
    steps.push({ k: 'chapter', ch });
    ch.scenes.forEach((l) => steps.push({ k: 'line', ...l }));
    steps.push({ k: 'vote', ch });
    steps.push({ k: 'react', ch });
    steps.push({ k: 'inner', ch, data: ch.inner });
    steps.push({ k: 'info', ch });
  });
  steps.push({ k: 'inner', data: ZHIHAO_INNER, zhihao: true });
  steps.push({ k: 'ending' });
  return steps;
}

function next() {
  state.i += 1;
  run();
}

function insertAfterCurrent(newSteps) {
  state.steps.splice(state.i + 1, 0, ...newSteps);
}

function setView(bg, chars) {
  state.view.bg = bg;
  state.view.chars = chars.map((c) => ({ ...c }));
}

function setEmotion(id, emo) {
  const c = state.view.chars.find((x) => x.id === id);
  if (c && emo) c.emo = emo;
}

function run() {
  const step = state.steps[state.i];
  if (!step) return;
  ({
    title: stepTitle,
    line: stepLine,
    chapter: stepChapter,
    vote: stepVote,
    react: stepReact,
    inner: stepInner,
    info: stepInfo,
    ending: stepEnding,
    endingCard: stepEndingCard,
    debrief: stepDebrief,
  })[step.k](step);
}

function stepLine(step) {
  if (step.bg) setView(step.bg, step.chars || state.view.chars);
  if (step.emo && step.speaker) {
    if (!state.view.chars.some((c) => c.id === step.speaker) && CHARACTERS[step.speaker] && KIDS.includes(step.speaker)) {
      const used = state.view.chars.map((c) => c.x);
      const x = [150, 40, 96].find((p) => !used.includes(p)) ?? 150;
      state.view.chars.push({ id: step.speaker, x, emo: step.emo });
    }
    setEmotion(step.speaker, step.emo);
  }
  showLine(step);
}

function stepTitle() {
  setView('title', [
    { id: 'azhe', x: 40, emo: 'happy' },
    { id: 'xiaoyu', x: 68, emo: 'neutral' },
    { id: 'jiajia', x: 96, emo: 'happy' },
    { id: 'aming', x: 124, emo: 'neutral' },
    { id: 'zhihao', x: 152, emo: 'happy' },
  ]);
  state.view.speaker = null;
  $('hud').hidden = true;
  const card = showPanel(`
    <div class="kicker">反霸凌課堂遊戲・國小高年級</div>
    <h1>五年三班大隊接力</h1>
    <p class="sub">全班一起決定：看到有人被欺負的時候，我們要怎麼做？</p>
    ${state.codeRequired ? `
      <div class="teacher-code">
        <label for="teacherCode">老師通行碼</label>
        <input id="teacherCode" type="password" autocomplete="off">
      </div>` : ''}
    <div class="btn-row">
      <button class="btn" id="btnRoom" type="button">建立投票房間（學生用平板）</button>
      <button class="btn secondary" id="btnHands" type="button">不用平板，舉手計票</button>
    </div>
    <div class="error" id="titleError"></div>
  `, 'title-card');
  const err = card.querySelector('#titleError');
  const codeInput = card.querySelector('#teacherCode');
  if (codeInput) codeInput.oninput = () => { err.textContent = ''; };
  card.addEventListener('click', (e) => e.stopPropagation());

  // 兩種模式都要開房間：房間是老師端使用 AI 與紀錄的憑證，舉手模式只是不顯示 QR code
  const start = async (tablet) => {
    const teacherCode = codeInput ? codeInput.value.trim() : '';
    if (codeInput && !teacherCode) {
      err.textContent = '請先輸入老師通行碼。';
      return;
    }
    state.room = null;
    try {
      state.room = await api('/api/rooms', { method: 'POST', body: { teacher_code: teacherCode } });
    } catch (ex) {
      if (ex.message === '403') {
        err.textContent = '老師通行碼不正確。';
        return;
      }
      if (tablet) {
        err.textContent = '無法建立房間（伺服器沒有啟動？）。可以先用舉手計票。';
        return;
      }
      // 舉手模式連不到伺服器也能玩，只是沒有 AI 和紀錄
    }
    state.tablet = tablet;
    log('start', { mode: tablet ? 'tablet' : 'hands' });
    next();
  };
  card.querySelector('#btnRoom').onclick = () => start(true);
  card.querySelector('#btnHands').onclick = () => start(false);
}

function stepChapter({ ch }) {
  setView(ch.scenes[0].bg, []);
  updateHud();
  $('chapterChip').textContent = ch.title.replace('　', ' ');
  showPanel(`
    <div class="kicker">${esc(ch.subtitle)}</div>
    <h1>${esc(ch.title)}</h1>
    <div class="btn-row" style="justify-content:center"><button class="btn" type="button" id="go">開始 ▶</button></div>
  `, 'chapter-card').querySelector('#go').onclick = (e) => { e.stopPropagation(); next(); };
}

// ----- 投票 -----

function stepVote({ ch }) {
  state.view.speaker = null;
  const v = ch.vote;
  const manual = Object.fromEntries(v.options.map((o) => [o.id, 0]));
  let roomCounts = Object.fromEntries(v.options.map((o) => [o.id, 0]));
  let poller = null;
  let phase = 'ready';

  const joinUrl = state.tablet ? `${state.lanBase || location.origin}/vote?room=${state.room.code}` : '';
  const card = showPanel(`
    <div class="kicker">全班投票</div>
    <h2>${esc(v.question)}</h2>
    <div class="vote-grid">
      ${v.options.map((o) => `
        <div class="opt" data-id="${o.id}">
          <span class="letter">${o.id.toUpperCase()}</span>
          <span class="opt-text">${esc(o.text)}</span>
          <span class="tally">
            <button type="button" data-minus="${o.id}" aria-label="減一票">−</button>
            <span class="count" data-count="${o.id}">0</span>
            <button type="button" data-plus="${o.id}" aria-label="加一票">+</button>
          </span>
          <span class="bar" data-bar="${o.id}"></span>
        </div>`).join('')}
    </div>
    <div class="vote-footer">
      ${state.tablet ? `
        <div class="join">
          <div class="qr" id="qr"></div>
          <div>平板掃描或開啟<br><span class="url">${esc(joinUrl.replace(/\?.*/, ''))}</span><br>房間碼 <span class="code">${state.room.code}</span></div>
        </div>` : '<div class="join">用舉手計票：按 + / − 輸入每個選項的票數</div>'}
      <div class="btn-row" style="margin-top:0">
        ${state.tablet ? '<button class="btn secondary" type="button" id="btnOpen">開放平板投票</button>' : ''}
        <button class="btn" type="button" id="btnReveal">公布結果</button>
      </div>
    </div>
    <div class="error" id="voteError"></div>
    <div class="result-line" id="resultLine"></div>
  `, 'vote-card');

  if (state.tablet && window.QRCode) {
    new window.QRCode(card.querySelector('#qr'), { text: joinUrl, width: 160, height: 160 });
  }

  const totals = () => Object.fromEntries(v.options.map((o) => [o.id, manual[o.id] + (roomCounts[o.id] || 0)]));

  const paint = () => {
    const t = totals();
    const sum = Object.values(t).reduce((a, b) => a + b, 0);
    v.options.forEach((o) => {
      card.querySelector(`[data-count="${o.id}"]`).textContent = t[o.id];
      card.querySelector(`[data-bar="${o.id}"]`).style.width = sum ? `${(t[o.id] / sum) * 100}%` : '0';
    });
    if (sum) card.querySelector('#voteError').textContent = '';
  };

  card.addEventListener('click', (e) => {
    e.stopPropagation();
    const plus = e.target.closest('[data-plus]');
    const minus = e.target.closest('[data-minus]');
    if (phase === 'done') return;
    if (plus) { manual[plus.dataset.plus] += 1; paint(); }
    if (minus) { manual[minus.dataset.minus] = Math.max(0, manual[minus.dataset.minus] - 1); paint(); }
  });

  const openBtn = card.querySelector('#btnOpen');
  if (openBtn) {
    openBtn.onclick = async () => {
      try {
        await api(`/api/rooms/${state.room.code}/open`, {
          method: 'POST', token: state.room.token,
          body: { qid: ch.id, question: v.question, options: v.options.map(({ id, text }) => ({ id, text })) },
        });
        openBtn.textContent = '投票中…';
        openBtn.disabled = true;
        phase = 'open';
        poller = setInterval(async () => {
          try {
            const s = await api(`/api/rooms/${state.room.code}`);
            if (s.qid === ch.id) { roomCounts = s.counts; paint(); }
          } catch { /* 下一輪再試 */ }
        }, 1000);
      } catch {
        card.querySelector('#voteError').textContent = '無法開放投票，請改用舉手計票。';
      }
    };
  }

  card.querySelector('#btnReveal').onclick = async () => {
    if (phase === 'done') { next(); return; }
    if (poller) clearInterval(poller);
    if (state.tablet && phase === 'open') {
      try {
        const s = await api(`/api/rooms/${state.room.code}/close`, { method: 'POST', token: state.room.token });
        if (s.qid === ch.id) roomCounts = s.counts;
      } catch { /* 用目前的票數 */ }
    }
    paint();
    const t = totals();
    const sum = Object.values(t).reduce((a, b) => a + b, 0);
    if (!sum) {
      card.querySelector('#voteError').textContent = '還沒有任何票。請先投票或輸入舉手的人數。';
      return;
    }
    phase = 'done';
    const max = Math.max(...Object.values(t));
    const tied = v.options.filter((o) => t[o.id] === max);
    const winner = tied[Math.floor(Math.random() * tied.length)];
    applyVote(ch, winner, t, sum, card);
  };

  paint();
}

function applyVote(ch, winner, counts, sum, card) {
  const dist = {};
  let moodDelta = 0;
  let trustDelta = 0;
  ch.vote.options.forEach((o) => {
    const p = counts[o.id] / sum;
    dist[o.id] = Math.round(p * 100);
    moodDelta += p * TYPE_EFFECT[o.type].mood;
    trustDelta += p * TYPE_EFFECT[o.type].trust;
  });
  moodDelta = Math.round(moodDelta);
  trustDelta = Math.round(trustDelta);
  state.mood = clamp(state.mood + moodDelta);
  state.trust[ch.target] = clamp(state.trust[ch.target] + trustDelta);

  ch.vote.options.forEach((o) => {
    const el = card.querySelector(`.opt[data-id="${o.id}"]`);
    el.classList.add(o.id === winner.id ? 'winner' : 'loser');
  });
  const pctOf = (types) => ch.vote.options.filter((o) => types.includes(o.type))
    .reduce((a, o) => a + dist[o.id], 0);
  const passive = pctOf(['silent', 'side']);
  const active = pctOf(['defend', 'help']);
  let note;
  if (winner.type === 'defend' || winner.type === 'help') {
    note = passive ? `也有 ${passive}% 的人選擇了沉默或附和。` : '沒有人選擇沉默或附和。';
  } else {
    note = active ? `有 ${active}% 的人想站出來或想辦法。` : '沒有人選擇站出來。';
  }
  card.querySelector('#resultLine').innerHTML =
    `全班選擇 <b>${winner.id.toUpperCase()}</b>（${dist[winner.id]}%）。${note}`;
  card.querySelector('#btnReveal').textContent = '看看會發生什麼 ▶';
  const open = card.querySelector('#btnOpen');
  if (open) open.remove();
  updateHud(moodDelta);

  const choice = {
    chapter: ch.id, title: ch.subtitle, target: ch.target,
    winner: winner.id, type: winner.type, text: winner.text,
    counts, dist, moodDelta, mood: state.mood, trust: state.trust[ch.target],
  };
  state.choices.push(choice);
  log('vote', choice);
}

function clamp(n) { return Math.max(0, Math.min(100, n)); }

// ----- 角色反應（AI 或預設） -----

async function stepReact({ ch }) {
  const choice = state.choices.find((c) => c.chapter === ch.id);
  const last = ch.scenes[ch.scenes.length - 1];
  setView(last.bg, last.chars);
  state.view.speaker = null;
  hidePanel();
  $('dialog').hidden = false;
  $('speaker').textContent = '';
  $('portrait').classList.add('empty');
  typeText('……');
  state.busy = true;

  const typeLabel = (o) => TYPE_EFFECT[o.type].label;
  let lines = null;
  try {
    const res = await api('/api/react', {
      method: 'POST',
      timeout: 30000,
      body: {
        chapter: `${ch.title}（${ch.subtitle}）`,
        target: ch.target,
        situation: ch.scenes.map((s) => `${CHARACTERS[s.speaker]?.name || '旁白'}：${s.text}`),
        question: ch.vote.question,
        chosen: choice.text,
        chosen_type: choice.type,
        distribution: Object.fromEntries(ch.vote.options.map((o) => [`${o.id.toUpperCase()} ${typeLabel(o)}`, choice.dist[o.id]])),
        mood: state.mood,
      },
    });
    lines = res.lines.map((l) => ({ speaker: l.speaker, emo: l.emotion, text: l.text }));
    state.ai = 'on';
  } catch {
    lines = ch.reactions[choice.type];
    state.ai = 'off';
  }
  state.busy = false;
  updateHud();
  log('react', { chapter: ch.id, source: state.ai, lines });
  insertAfterCurrent(lines.map((l) => ({ k: 'line', ...l })));
  next();
}

// ----- 內心話與小知識 -----

function stepInner({ data, zhihao }) {
  state.view.speaker = null;
  if (zhihao) {
    setView('classroom', [{ id: 'zhihao', x: 96, emo: 'sad' }]);
    $('chapterChip').textContent = '最後';
  }
  const who = CHARACTERS[data.speaker];
  const card = showPanel(`
    <canvas class="portrait-lg" width="128" height="128"></canvas>
    <div>
      <div class="kicker">${zhihao ? '你可能不知道的事' : '沒有說出口的話'}</div>
      <h2>${esc(who.name)}的內心話</h2>
      <p>${esc(data.text)}</p>
      <div class="btn-row"><button class="btn" type="button" id="go">繼續 ▶</button></div>
    </div>
  `, 'inner-card');
  drawPortrait(card.querySelector('canvas'), data.speaker, zhihao ? 'sad' : 'sad');
  card.querySelector('#go').onclick = (e) => { e.stopPropagation(); next(); };
}

function stepInfo({ ch }) {
  state.view.speaker = null;
  showPanel(`
    <div class="kicker">想一想</div>
    <h2>${esc(CHARACTERS[ch.target].name)}不是故意的，也不是他的錯</h2>
    <p>${esc(ch.info)}</p>
    <div class="btn-row"><button class="btn" type="button" id="go">下一章 ▶</button></div>
  `, 'info-card').querySelector('#go').onclick = (e) => { e.stopPropagation(); next(); };
  if (ch.target === 'xiaoyu') document.querySelector('.info-card h2').textContent = '家裡的狀況，不是小雨能選擇的';
  if (ch.target === 'aming') document.querySelector('.info-card h2').textContent = '不一樣，不代表奇怪';
}

// ----- 結局 -----

function decideEnding() {
  const lowest = TARGETS.reduce((a, b) => (state.trust[a] <= state.trust[b] ? a : b));
  if (state.trust[lowest] <= 35) return { key: 'absent', who: lowest };
  if (state.mood >= 70 && state.trust[lowest] >= 50) return { key: 'good', who: null };
  return { key: 'mixed', who: lowest };
}

function stepEnding() {
  const end = decideEnding();
  state.ending = end;
  const name = end.who ? CHARACTERS[end.who].name : '';
  const xs = { azhe: 40, xiaoyu: 68, jiajia: 96, aming: 124, zhihao: 152 };
  const chars = KIDS
    .filter((id) => !(end.key === 'absent' && id === end.who))
    .map((id) => {
      let emo = end.key === 'good' ? 'happy' : end.key === 'absent' ? 'surprised' : 'neutral';
      if (end.key === 'mixed' && id === end.who) emo = 'sad';
      return { id, x: xs[id], emo };
    });
  if (end.key === 'mixed') {
    const c = chars.find((x) => x.id === end.who);
    if (c) c.x = 178;
  }
  $('chapterChip').textContent = '運動會';
  const lines = ENDINGS[end.key].lines.map((l) => ({
    k: 'line', ...l, text: l.text.replaceAll('{name}', name), chars,
  }));
  insertAfterCurrent([...lines, { k: 'endingCard' }, { k: 'debrief' }]);
  log('ending', { ending: end.key, who: end.who, mood: state.mood, trust: state.trust });
  next();
}

function hearts(n) {
  const full = Math.round(n / 20);
  return '♥'.repeat(full) + '♡'.repeat(5 - full);
}

function stepEndingCard() {
  state.view.speaker = null;
  const end = state.ending;
  const title = {
    good: '結局：沒有人被丟下',
    mixed: '結局：跑完了，但是……',
    absent: `結局：${CHARACTERS[end.who]?.name}沒有來`,
  }[end.key];
  const card = showPanel(`
    <div class="kicker">五年三班的結局</div>
    <h1>${esc(title)}</h1>
    <p>班級氛圍：${state.mood} / 100</p>
    <div class="trust-row">
      ${TARGETS.map((id) => `
        <div class="trust">
          <canvas width="64" height="64" data-p="${id}"></canvas>
          <span>${CHARACTERS[id].name}</span>
          <span class="hearts">${hearts(state.trust[id])}</span>
        </div>`).join('')}
    </div>
    <p style="font-size:1.5cqw;color:var(--muted)">愛心代表他們有多相信「班上有人會站在我這邊」。</p>
    <div class="btn-row" style="justify-content:center"><button class="btn" type="button" id="go">和全班一起討論 ▶</button></div>
  `, 'ending-card');
  TARGETS.forEach((id) => {
    const emo = state.trust[id] >= 60 ? 'happy' : state.trust[id] <= 35 ? 'cry' : 'neutral';
    drawPortrait(card.querySelector(`[data-p="${id}"]`), id, emo);
  });
  card.querySelector('#go').onclick = (e) => { e.stopPropagation(); next(); };
}

async function stepDebrief() {
  state.view.speaker = null;
  const legend = Object.entries(TYPE_EFFECT)
    .map(([k, v]) => `<span><i style="background:${TYPE_COLOR[k]}"></i>${v.label}</span>`).join('');
  const recap = state.choices.map((c) => {
    const ch = CHAPTERS.find((x) => x.id === c.chapter);
    const segs = ch.vote.options
      .filter((o) => c.dist[o.id] > 0)
      .map((o) => `<span style="width:${c.dist[o.id]}%;background:${TYPE_COLOR[o.type]}"></span>`).join('');
    return `<div class="recap-item"><span class="t">${esc(c.title)}</span>：全班選 ${c.winner.toUpperCase()}「${esc(c.text)}」<div class="dist">${segs}</div></div>`;
  }).join('');
  const card = showPanel(`
    <div class="kicker">課後討論</div>
    <h2>我們這次的選擇</h2>
    <div class="debrief-grid">
      <div class="recap">${recap}<div class="legend">${legend}</div></div>
      <div class="questions">
        <h3>想一想、說一說</h3>
        <p class="loading" id="dbSummary">正在整理討論問題……</p>
        <ol id="dbQuestions"></ol>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn" type="button" id="again">再玩一次</button>
      <button class="btn secondary small" type="button" id="export">匯出研究紀錄（CSV）</button>
      <span class="error" id="exportError"></span>
    </div>
  `, 'debrief-card');
  card.querySelector('#again').onclick = (e) => { e.stopPropagation(); restart(); };
  card.querySelector('#export').onclick = () => exportCsv(card.querySelector('#exportError'));
  card.addEventListener('click', (e) => e.stopPropagation());

  let questions = FALLBACK_DEBRIEF;
  let summary = '';
  try {
    const res = await api('/api/debrief', {
      method: 'POST', timeout: 30000,
      body: {
        choices: state.choices.map(({ title, text, type, dist }) => ({ title, chosen: text, type, dist })),
        mood: state.mood,
        ending: state.ending.key,
      },
    });
    questions = res.questions;
    summary = res.summary;
  } catch { /* 用預設問題 */ }
  const s = card.querySelector('#dbSummary');
  s.textContent = summary;
  s.classList.remove('loading');
  card.querySelector('#dbQuestions').innerHTML = questions.map((q) => `<li>${esc(q)}</li>`).join('');
}

// 研究紀錄要管理密碼才能下載（在伺服器那台電腦上開啟則不用）
async function exportCsv(errEl) {
  errEl.textContent = '';
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  const headers = {};
  if (!local) {
    const key = prompt('請輸入管理密碼');
    if (!key) return;
    headers['X-Admin-Key'] = key;
  }
  try {
    const res = await fetch('/api/export', { headers });
    if (!res.ok) throw new Error(`${res.status}`);
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (ex) {
    errEl.textContent = ex.message === '403' ? '管理密碼不正確。' : '匯出失敗。';
  }
}

// ---------- 操作 ----------

function advance() {
  if (state.busy) return;
  const step = state.steps[state.i];
  if (!step) return;
  // 卡片上的「繼續」也可以用空白鍵或簡報筆按
  if (step.k !== 'line') {
    $('panel').querySelector('#go')?.click();
    return;
  }
  if (finishTyping()) return;
  next();
}

$('stage').addEventListener('click', (e) => {
  if (e.target.closest('#panel')) return;
  advance();
});

document.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
    if (e.target.closest?.('input, textarea, button, a')) return;
    e.preventDefault();
    advance();
  }
});

$('btnFullscreen').onclick = () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
};

$('btnRestart').onclick = () => {
  if (confirm('要重新開始嗎？目前的進度會清除。')) restart();
};

function restart() {
  state.steps = buildSteps();
  state.i = 0;
  state.mood = 50;
  state.trust = { azhe: 50, xiaoyu: 50, aming: 50 };
  state.choices = [];
  state.session = Math.random().toString(36).slice(2, 10);
  run();
}

// 用 localhost 開啟時，學生的平板連不到，改顯示區網位址
api('/api/health').then((h) => {
  if (['localhost', '127.0.0.1'].includes(location.hostname) && h.lan_base) state.lanBase = h.lan_base;
  state.codeRequired = h.teacher_code_required;
  if (state.codeRequired && state.steps[state.i]?.k === 'title') run();
}).catch(() => {});

restart();
requestAnimationFrame(loop);
