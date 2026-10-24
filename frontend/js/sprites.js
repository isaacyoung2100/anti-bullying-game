// 日記本塗鴉風：全部用程式繪製，不使用圖片檔
// 像孩子用色鉛筆畫在日記本上的圖：線條會微微抖動、上色有斜線筆觸、顏色會稍微畫出線外
// 座標以 192×108 為單位（邏輯座標），由 game.js 依畫布大小放大；線條是向量，放大不會糊

export const W = 192;
export const H = 108;

const INK = '#3a3140';
const PAPER = '#fbf7ee';

// ---------- 手繪工具 ----------

// 固定種子的亂數：同一張圖每次畫出來一樣，不會一直閃動；
// boil（0–2）換種子，讓線條像手繪動畫一樣輕輕「呼吸」
let seedState = 1;
function seed(n) { seedState = (n >>> 0) || 1; }
function rnd() {
  seedState = (seedState + 0x6d2b79f5) >>> 0;
  let t = seedState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const jit = (a) => (rnd() - 0.5) * 2 * a;
const hash = (s) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);

// 把折線切成小段並加上抖動，看起來像手畫的
function wobble(pts, close, amp = 0.3) {
  const out = [];
  const list = close ? [...pts, pts[0]] : pts;
  for (let i = 0; i < list.length - 1; i++) {
    const [x1, y1] = list[i], [x2, y2] = list[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 4));
    for (let j = 0; j < n; j++) {
      const f = j / n;
      out.push([x1 + (x2 - x1) * f + jit(amp), y1 + (y2 - y1) * f + jit(amp)]);
    }
  }
  if (!close) out.push(list[list.length - 1]);
  return out;
}

function trace(g, pts, close) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  if (close) g.closePath();
}

// 色鉛筆的斜線筆觸，只畫在形狀裡面
function hatch(g, pts, color, gap = 1.5) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  g.save();
  trace(g, pts, true);
  g.clip();
  g.strokeStyle = color;
  g.lineWidth = 0.4;
  g.globalAlpha *= 0.55;
  g.beginPath();
  for (let d = x0 - (y1 - y0); d < x1; d += gap) {
    g.moveTo(d + jit(0.3), y1 + 0.5);
    g.lineTo(d + (y1 - y0) + jit(0.3), y0 - 0.5);
  }
  g.stroke();
  g.restore();
}

// 畫一個手繪形狀：fill 底色（稍微偏移，像塗出線外）、shade 斜線筆觸、stroke 鉛筆外框
function shape(g, pts, { fill, shade, stroke = INK, width = 0.55, close = true, amp = 0.3 } = {}) {
  const p = wobble(pts, close, amp);
  if (fill) {
    g.save();
    g.translate(0.35, 0.3);
    g.fillStyle = fill;
    trace(g, p, true);
    g.fill();
    g.restore();
  }
  if (shade) hatch(g, p, shade);
  if (stroke) {
    g.strokeStyle = stroke;
    g.lineWidth = width;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    trace(g, p, close);
    g.stroke();
    // 第二筆稍微錯開，像鉛筆來回描
    g.globalAlpha *= 0.45;
    trace(g, wobble(pts, close, amp), close);
    g.stroke();
    g.globalAlpha /= 0.45;
  }
}

function rectPts(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }

function ellipsePts(cx, cy, rx, ry, n = 16, from = 0, to = Math.PI * 2) {
  const pts = [];
  const full = to - from >= Math.PI * 2 - 1e-6;
  const steps = full ? n : n + 1;
  for (let i = 0; i < steps; i++) {
    const a = from + ((to - from) * i) / n;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}

const box = (g, x, y, w, h, o) => shape(g, rectPts(x, y, w, h), o);
const oval = (g, cx, cy, rx, ry, o) => shape(g, ellipsePts(cx, cy, rx, ry), o);
const line = (g, pts, color = INK, width = 0.55) => shape(g, pts, { stroke: color, width, close: false });

// ---------- 角色 ----------

const SKIN = '#f8d4b0';
const SKIN_TAN = '#e2ae82';

// 每個角色的配色與髮型。C 上衣、D 上衣筆觸、P 褲子、H 頭髮
const PALETTES = {
  azhe:    { hair: 'messy',    H: '#5a3a28', S: SKIN,     C: '#f39a4c', D: '#d0702a', P: '#4a5a8a' },
  xiaoyu:  { hair: 'ponytail', H: '#2a2430', S: SKIN,     C: '#9db2c6', D: '#71879c', P: '#4a5a8a' },
  aming:   { hair: 'neat',     H: '#2a2430', S: SKIN_TAN, C: '#62b77e', D: '#3e8f58', P: '#4a5a8a' },
  zhihao:  { hair: 'spiky',    H: '#8a5532', S: SKIN,     C: '#e86060', D: '#bb3e3e', P: '#4a5a8a' },
  jiajia:  { hair: 'bob',      H: '#35293c', S: SKIN,     C: '#a98be6', D: '#7d60c4', P: '#4a5a8a', clip: '#ff7aa8' },
  teacher: { hair: 'bun',      H: '#4a3329', S: SKIN,     C: '#eadbb8', D: '#c9b282', P: '#6a5a48', glasses: true, adult: true },
  mom:     { hair: 'long',     H: '#5a3a28', S: SKIN,     C: '#e08478', D: '#bb5d52', P: '#6a5a48', adult: true },
  momX:    { hair: 'bun',      H: '#35293c', S: SKIN,     C: '#5f8a8b', D: '#3f6667', P: '#4e4a5a', adult: true },
  momM:    { hair: 'long',     H: '#2a2430', S: SKIN_TAN, C: '#efc35a', D: '#c99a30', P: '#6a5a48', adult: true },
  kai:     { hair: 'neat',     H: '#6b4a34', S: SKIN,     C: '#4fb3b0', D: '#2f8a87', P: '#4a5a8a' },
  qing:    { hair: 'bangs',    H: '#2a2430', S: SKIN,     C: '#f2a7b8', D: '#d47b92', P: '#4a5a8a' },
  pinyu:   { hair: 'twin',     H: '#4a3329', S: SKIN,     C: '#f6d36b', D: '#d9ad3a', P: '#4a5a8a', ties: '#e86060' },
  guanyu:  { hair: 'neat',     H: '#2a2430', S: SKIN,     C: '#b5b9c4', D: '#8a8fa0', P: '#4a5a8a', glasses: true },
  xinyi:   { hair: 'ponytail', H: '#5a3a28', S: SKIN,     C: '#ff9fc8', D: '#e070a0', P: '#4a5a8a' },
  grandma: { hair: 'bun',      H: '#c9c3cc', S: SKIN,     C: '#c98bd0', D: '#a061aa', P: '#5a4a5a', adult: true },
  dadQ:    { hair: 'neat',     H: '#2a2430', S: SKIN,     C: '#f2e6a8', D: '#cdbd6a', P: '#3e4a5a', adult: true },
  sister:  { hair: 'long',     H: '#35293c', S: SKIN,     C: '#7d8fd8', D: '#5a6ab8', P: '#3e3a4a', adult: true },
};

// 頭髮：後面的頭髮先畫（在臉後面），瀏海後畫（蓋在額頭上）
function hairBack(g, pal, hx, hy) {
  const o = { fill: pal.H, shade: '#00000055' };
  if (pal.hair === 'bob') shape(g, [...ellipsePts(hx, hy - 1, 10.5, 10, 14, Math.PI, Math.PI * 2), [hx + 10.5, hy + 7], [hx - 10.5, hy + 7]], o);
  if (pal.hair === 'long') shape(g, [...ellipsePts(hx, hy - 1, 10.5, 10, 14, Math.PI, Math.PI * 2), [hx + 10.5, hy + 11], [hx - 10.5, hy + 11]], o);
  if (pal.hair === 'ponytail') shape(g, ellipsePts(hx + 9.5, hy + 2, 3.2, 6.5), o);
  if (pal.hair === 'bun') oval(g, hx, hy - 10.5, 4.2, 3.6, o);
  // 齊瀏海短髮：兩側直直垂到下巴
  if (pal.hair === 'bangs') shape(g, [...ellipsePts(hx, hy - 1, 10.4, 10, 14, Math.PI, Math.PI * 2), [hx + 10.4, hy + 8.5], [hx - 10.4, hy + 8.5]], o);
  // 雙馬尾
  if (pal.hair === 'twin') for (const s of [-1, 1]) shape(g, ellipsePts(hx + s * 10.5, hy + 3.5, 2.8, 5.5), o);
}

function fringe(g, pal, hx, hy) {
  const o = { fill: pal.H, shade: '#00000044' };
  const top = ellipsePts(hx, hy, 9.6, 9.8, 12, Math.PI * 1.02, Math.PI * 1.98);
  if (pal.hair === 'messy' || pal.hair === 'spiky') {
    // 頭頂翹起來的頭髮
    const spike = pal.hair === 'spiky' ? 3.6 : 2;
    const tips = ellipsePts(hx, hy, 9.6, 9.8, 12, Math.PI * 1.02, Math.PI * 1.98)
      .map(([x, y], i) => (i % 2 ? [x + (x - hx) * 0.12, y - spike] : [x, y]));
    shape(g, [...tips, [hx + 9, hy - 2], [hx + 4, hy - 4.5], [hx + 1, hy - 2.5], [hx - 3, hy - 4.5], [hx - 9, hy - 2]], o);
    return;
  }
  if (pal.hair === 'bangs') {
    // 齊瀏海：剪得平平的
    shape(g, [...top, [hx + 9.4, hy - 2.6], [hx - 9.4, hy - 2.6]], o);
  } else {
    // 整齊的瀏海：一側分線
    shape(g, [...top, [hx + 9.4, hy - 1], [hx + 3, hy - 4.6], [hx - 2, hy - 3.6], [hx - 9.4, hy - 1.5]], o);
  }
  if (pal.clip) box(g, hx + 4, hy - 6.5, 3.2, 1.6, { fill: pal.clip, width: 0.4 });
  if (pal.ties) for (const s of [-1, 1]) oval(g, hx + s * 10.2, hy - 1.2, 1.4, 1.2, { fill: pal.ties, width: 0.35 });
}

function face(g, emo, hx, hy, glasses) {
  const ex = 3.3, ey = hy + 0.8;
  const dot = (x, y, r = 0.95) => { g.fillStyle = INK; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
  const blush = () => {
    g.fillStyle = 'rgba(240, 120, 110, 0.35)';
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(hx + s * 5.4, hy + 3.2, 1.7, 1, 0, 0, Math.PI * 2); g.fill(); }
  };
  const mouth = (pts) => line(g, pts, '#8a3b3b', 0.55);
  switch (emo) {
    case 'happy':
      for (const s of [-1, 1]) line(g, [[hx + s * ex - 1.3, ey + 0.4], [hx + s * ex, ey - 0.9], [hx + s * ex + 1.3, ey + 0.4]]);
      blush();
      mouth(ellipsePts(hx, hy + 3.6, 2.6, 2, 6, 0.15, Math.PI - 0.15));
      break;
    case 'sad':
    case 'cry':
      dot(hx - ex, ey + 0.4); dot(hx + ex, ey + 0.4);
      line(g, [[hx - ex - 1.6, ey - 2.2], [hx - ex + 1.2, ey - 2.8]], INK, 0.45);
      line(g, [[hx + ex + 1.6, ey - 2.2], [hx + ex - 1.2, ey - 2.8]], INK, 0.45);
      mouth(ellipsePts(hx, hy + 6.2, 2.2, 1.6, 6, Math.PI + 0.3, Math.PI * 2 - 0.3));
      if (emo === 'cry') {
        g.fillStyle = '#7cc4f2';
        for (const s of [-1, 1]) { g.beginPath(); g.ellipse(hx + s * ex, ey + 2.6, 0.7, 1.3, 0, 0, Math.PI * 2); g.fill(); }
      }
      break;
    case 'surprised':
      for (const s of [-1, 1]) oval(g, hx + s * ex, ey, 1.2, 1.4, { fill: '#ffffff', width: 0.45 });
      dot(hx - ex, ey, 0.6); dot(hx + ex, ey, 0.6);
      oval(g, hx, hy + 5, 1.2, 1.5, { fill: '#8a3b3b', stroke: '#8a3b3b', width: 0.4 });
      break;
    case 'angry':
      dot(hx - ex, ey); dot(hx + ex, ey);
      line(g, [[hx - ex - 1.6, ey - 2.8], [hx - ex + 1.4, ey - 1.6]], INK, 0.5);
      line(g, [[hx + ex + 1.6, ey - 2.8], [hx + ex - 1.4, ey - 1.6]], INK, 0.5);
      mouth([[hx - 1.8, hy + 4.8], [hx + 1.8, hy + 4.8]]);
      break;
    default:
      dot(hx - ex, ey); dot(hx + ex, ey);
      mouth(ellipsePts(hx, hy + 3.8, 1.8, 1.2, 5, 0.3, Math.PI - 0.3));
  }
  if (glasses) {
    for (const s of [-1, 1]) oval(g, hx + s * ex, ey, 2.3, 2, { stroke: '#5b4a6a', width: 0.4 });
    line(g, [[hx - ex + 2.3, ey], [hx + ex - 2.3, ey]], '#5b4a6a', 0.4);
  }
}

let dimCanvas = null;
function dimLayer(target) {
  if (!dimCanvas) dimCanvas = document.createElement('canvas');
  if (dimCanvas.width !== target.width || dimCanvas.height !== target.height) {
    dimCanvas.width = target.width;
    dimCanvas.height = target.height;
  }
  return dimCanvas;
}

// 畫角色：x 為中心，y 為腳底（約 48 單位高）
// 運動會的號碼布：大隊接力的棒次
const BIB = { azhe: 1, zhihao: 2, xiaoyu: 3, qing: 4, kai: 5, pinyu: 6, guanyu: 7, aming: 8, jiajia: 9, xinyi: 10 };

// 裝扮：stride 是跑步、走路時手腳擺動（-1 到 1）；sports 是運動會那天；outfit 是劇情裡加上的東西
export function drawChar(g, id, x, y, emo = 'neutral', { bob = 0, dim = false, boil = 0, shadow = true, stride = 0, sports = false, outfit = [] } = {}) {
  const pal = PALETTES[id];
  if (!pal) return;
  // 沒在說話的人畫淡一點：先畫在另一層再整層變淡，
  // 不然各部位各自半透明，後面的頭髮會透過臉看得到
  if (dim) {
    const layer = dimLayer(g.canvas);
    const lg = layer.getContext('2d');
    lg.setTransform(1, 0, 0, 1, 0, 0);
    lg.clearRect(0, 0, layer.width, layer.height);
    lg.setTransform(g.getTransform());
    drawChar(lg, id, x, y, emo, { bob, boil, shadow, stride, sports, outfit });
    // 蓋一層紙的顏色：看起來褪色，但不會透出後面的桌子
    lg.setTransform(1, 0, 0, 1, 0, 0);
    lg.globalCompositeOperation = 'source-atop';
    lg.fillStyle = 'rgba(251, 247, 238, 0.5)';
    lg.fillRect(0, 0, layer.width, layer.height);
    lg.globalCompositeOperation = 'source-over';
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(layer, 0, 0);
    g.restore();
    return;
  }
  seed(hash(id) + boil * 7919);
  g.save();
  // 大人畫得高一點
  if (pal.adult) { g.translate(x, y); g.scale(1.12, 1.12); g.translate(-x, -y); }
  y += bob;
  if (shadow) {
    g.fillStyle = 'rgba(58, 49, 64, 0.12)';
    g.beginPath(); g.ellipse(x, y - bob, 9, 1.6, 0, 0, Math.PI * 2); g.fill();
  }
  // 運動會那天，同學都穿一樣的班服
  const kid = !pal.adult;
  const shirt = sports && kid ? { C: '#7fc8e8', D: '#4f9fc4' } : { C: pal.C, D: pal.D };
  // 腳和鞋子：跑步時一前一後
  const lift = Math.abs(stride) * 2;
  box(g, x - 5 + stride * 2.5, y - 14, 4, 12 - (stride > 0 ? lift : 0), { fill: pal.P, shade: '#00000040' });
  box(g, x + 1 - stride * 2.5, y - 14, 4, 12 - (stride < 0 ? lift : 0), { fill: pal.P, shade: '#00000040' });
  oval(g, x - 3.6 + stride * 2.5, y - 1.4 - (stride > 0 ? lift : 0), 3, 1.5, { fill: '#ffffff', width: 0.45 });
  oval(g, x + 3.6 - stride * 2.5, y - 1.4 - (stride < 0 ? lift : 0), 3, 1.5, { fill: '#ffffff', width: 0.45 });
  // 手臂（在身體後面）：跑步時前後擺
  for (const s of [-1, 1]) {
    const hand = [x + s * 9.5 - s * stride * 3.5, y - 15.5 - Math.abs(stride) * 2];
    line(g, [[x + s * 6, y - 25], hand], shirt.C, 2.8);
    line(g, [[x + s * 6, y - 25], hand], INK, 0.35);
    oval(g, hand[0] + s * 0.2, hand[1] + 0.9, 1.5, 1.5, { fill: pal.S, width: 0.4 });
  }
  // 上衣
  shape(g, [[x - 7, y - 27], [x + 7, y - 27], [x + 8.5, y - 13], [x - 8.5, y - 13]], { fill: shirt.C, shade: shirt.D });
  // 號碼布：小雨的上面是阿哲畫的金色閃電
  if (sports && kid && BIB[id]) {
    box(g, x - 4, y - 24, 8, 7, { fill: '#ffffff', width: 0.4 });
    if (id === 'xiaoyu') {
      shape(g, [[x + 0.8, y - 23.4], [x - 1.8, y - 20.2], [x + 0.2, y - 20.2], [x - 1, y - 17.6], [x + 2.2, y - 21.2], [x + 0.2, y - 21.2], [x + 1.6, y - 23.4]], { fill: '#ffd166', stroke: '#c99a30', width: 0.3 });
    } else {
      g.fillStyle = INK;
      g.font = '700 5px sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(String(BIB[id]), x, y - 20.3);
    }
  }
  // 阿凱：阿嬤用金線縫的花環
  if (sports && id === 'kai') {
    oval(g, x, y - 27.5, 6.5, 2.2, { stroke: '#e8b23c', width: 1.2 });
    for (const dx of [-5, -1.5, 2, 5.5]) oval(g, x + dx, y - 26.8, 0.9, 0.9, { fill: '#ff8fab', stroke: null });
  }
  // 頭
  const hx = x, hy = y - 36.5;
  hairBack(g, pal, hx, hy);
  oval(g, hx, hy, 8.6, 9, { fill: pal.S, shade: '#e9a98033' });
  face(g, emo, hx, hy, pal.glasses);
  fringe(g, pal, hx, hy);
  // 小晴的耳罩
  if (outfit.includes('earmuffs')) {
    line(g, ellipsePts(hx, hy - 1, 10.2, 11, 10, Math.PI * 1.05, Math.PI * 1.95), '#e070a0', 1.1);
    for (const s of [-1, 1]) oval(g, hx + s * 9.6, hy + 1, 2.4, 3.2, { fill: '#ff9fc8', shade: '#e070a0' });
  }
  // 帽子（阿明的媽媽戴著帽子站在最後面）
  if (outfit.includes('hat')) {
    oval(g, hx, hy - 6.5, 13, 2.6, { fill: '#e8d9b5', shade: '#c9b282' });
    shape(g, [...ellipsePts(hx, hy - 7, 8.5, 6.5, 10, Math.PI, Math.PI * 2)], { fill: '#e8d9b5', shade: '#c9b282' });
  }
  g.restore();
}

// 頭像（對話框、選角色用）：畫到肩膀為止，畫布底色由 CSS 決定
export function drawPortrait(canvas, id, emo, look = {}) {
  const g = canvas.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, canvas.width, canvas.height);
  if (!PALETTES[id]) return false;
  const s = canvas.width / 26;
  g.setTransform(s, 0, 0, s, 0, 0);
  // 大人畫得比較高，腳底往下移，頭才會在頭像中間
  drawChar(g, id, 13, PALETTES[id].adult ? 55.5 : 51, emo, { shadow: false, ...look });
  g.setTransform(1, 0, 0, 1, 0, 0);
  return true;
}

// ---------- 場景 ----------
// 直向畫面只看得到中間（x 約 24–168），重要的東西放在這個範圍

function paper(g) {
  g.fillStyle = PAPER;
  g.fillRect(0, 0, W, H);
}

function cloud(g, x, y) {
  const o = { fill: '#ffffff', stroke: '#9fb3c4', width: 0.45 };
  oval(g, x, y, 5, 3, o);
  oval(g, x + 5, y - 1.5, 5, 3.6, o);
  oval(g, x + 10, y, 4.5, 3, o);
}

function tree(g, x, y) {
  box(g, x - 1.2, y - 2, 2.4, 10, { fill: '#9a6a40', shade: '#6d4626' });
  oval(g, x, y - 7, 8, 7.5, { fill: '#8fcf78', shade: '#4f9a45' });
}

function runner(g, x, y, c) {
  oval(g, x, y, 1.4, 1.4, { stroke: c, width: 0.45 });
  line(g, [[x, y + 1.4], [x - 0.6, y + 5]], c, 0.45);
  line(g, [[x - 0.6, y + 5], [x - 2.4, y + 8]], c, 0.45);
  line(g, [[x - 0.6, y + 5], [x + 1.6, y + 7.6]], c, 0.45);
  line(g, [[x - 2, y + 3.4], [x + 2, y + 2.4]], c, 0.45);
}

function classroom(g) {
  paper(g);
  box(g, -2, -2, W + 4, 68, { fill: '#f6ead0', shade: '#e6d4ae', stroke: null });
  box(g, -2, 66, W + 4, 44, { fill: '#e0bd92', shade: '#c49a6c' });
  for (let y = 76; y < H; y += 9) line(g, [[0, y], [W, y]], '#b48a5e', 0.35);
  // 窗戶
  for (const wx of [24, 146]) {
    box(g, wx, 12, 22, 32, { fill: '#d6edf9', shade: '#9fcfee' });
    line(g, [[wx + 11, 12], [wx + 11, 44]]);
    line(g, [[wx, 28], [wx + 22, 28]]);
  }
  cloud(g, 27, 19);
  // 黑板與粉筆畫的跑步小人
  box(g, 54, 9, 84, 37, { fill: '#46705c', shade: '#335a48', width: 0.8 });
  box(g, 52, 46, 88, 2.4, { fill: '#9a6a40' });
  line(g, [[60, 36], [132, 36]], '#eef4ea', 0.4);
  [64, 84, 104, 124].forEach((rx, i) => {
    runner(g, rx, 24, '#eef4ea');
    if (i < 3) line(g, [[rx + 4, 29], [rx + 13, 29], [rx + 11, 27.6]], '#f7d26a', 0.45);
  });
  box(g, 60, 13, 14, 6, { fill: '#f7b6c2', width: 0.4 });
  // 時鐘
  oval(g, 96, 4.5, 3.4, 3.4, { fill: '#ffffff', width: 0.5 });
  line(g, [[96, 4.5], [96, 2.4]], INK, 0.4);
  line(g, [[96, 4.5], [97.6, 4.5]], INK, 0.4);
  // 後排課桌
  for (const dx of [30, 72, 112, 146]) {
    box(g, dx, 61, 22, 3, { fill: '#e8bf7e', shade: '#c79a55' });
    line(g, [[dx + 2, 64], [dx + 2, 72]], INK, 0.5);
    line(g, [[dx + 20, 64], [dx + 20, 72]], INK, 0.5);
  }
}

function sky(g) {
  box(g, -2, -2, W + 4, 44, { fill: '#dff0fa', shade: '#a9d6f2', stroke: null });
  oval(g, 150, 11, 5, 5, { fill: '#ffd76a', shade: '#f2b13c', stroke: '#d9962e' });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    line(g, [[150 + Math.cos(a) * 7, 11 + Math.sin(a) * 7], [150 + Math.cos(a) * 9.5, 11 + Math.sin(a) * 9.5]], '#e0a030', 0.5);
  }
  cloud(g, 40, 9);
  cloud(g, 104, 6);
}

function schoolAndField(g) {
  box(g, 42, 17, 108, 25, { fill: '#f6e6c8', shade: '#e2cba0' });
  shape(g, [[38, 18], [96, 9], [154, 18]], { fill: '#e07a5f', shade: '#b8553c' });
  oval(g, 96, 22, 3.2, 3.2, { fill: '#ffffff', width: 0.45 });
  for (let r = 0; r < 2; r++) {
    for (let x = 48; x < 146; x += 11) if (Math.abs(x + 3 - 96) > 6) box(g, x, 27 + r * 8, 6, 4.5, { fill: '#a9d6f2', width: 0.4 });
  }
  tree(g, 30, 40); tree(g, 162, 40);
  box(g, -2, 42, W + 4, 28, { fill: '#cfe9b4', shade: '#8fc970', stroke: null });
}

function trackGround(g) {
  box(g, -2, 70, W + 4, 40, { fill: '#eaa184', shade: '#cf6c4c' });
  for (const y of [72, 83, 94, 105]) line(g, [[0, y], [W, y]], '#fffaf0', 0.8);
}

function track(g) {
  paper(g);
  sky(g);
  schoolAndField(g);
  trackGround(g);
}

const BUNTING = ['#ff7b7b', '#ffd166', '#5fd0c4', '#8d9cff', '#ffa6e8'];
const CROWD = ['#e86060', '#62b77e', '#8d9cff', '#ffd166', '#f39a4c', '#a98be6'];

function sportsday(g, boil) {
  track(g);
  // 觀眾席
  box(g, -2, 46, W + 4, 22, { fill: '#f1e7d2', shade: '#d9c7a2' });
  for (let i = 0; i < 26; i++) {
    const x = 22 + i * 6, y = 55 + (i % 2) * 5;
    const jump = (boil + i) % 4 === 0 ? -1 : 0;
    shape(g, ellipsePts(x, y + 4.5 + jump, 2.8, 2.6, 8, Math.PI, Math.PI * 2), { fill: CROWD[i % CROWD.length], width: 0.4 });
    oval(g, x, y + jump, 1.8, 1.8, { fill: SKIN, width: 0.4 });
  }
  // 彩旗
  const sag = (x) => 4 + Math.sin((x / W) * Math.PI) * 4;
  line(g, Array.from({ length: 13 }, (_, i) => [i * 16, sag(i * 16)]), '#8a7a6a', 0.45);
  for (let i = 0; i < 24; i++) {
    const x = i * 8 + 1;
    shape(g, [[x, sag(x)], [x + 6, sag(x + 6)], [x + 3, sag(x + 3) + 5]], { fill: BUNTING[i % BUNTING.length], width: 0.4 });
  }
  // 布條（字由 sceneLabels 疊上去）
  box(g, 60, 10, 72, 12, { fill: '#e05a50', shade: '#b53a33', width: 0.6 });
  line(g, [[59, 9], [59, 25]], '#7a5230', 0.9);
  line(g, [[133, 9], [133, 25]], '#7a5230', 0.9);
}

function home(g, boil) {
  paper(g);
  box(g, -2, -2, W + 4, 74, { fill: '#f8e6cc', shade: '#ecd0aa', stroke: null });
  box(g, -2, 72, W + 4, 38, { fill: '#d4a978', shade: '#b48a5e' });
  // 夜晚的窗戶：月亮和星星
  box(g, 28, 12, 40, 30, { fill: '#46598a', shade: '#2c3d63', width: 0.7 });
  line(g, [[48, 12], [48, 42]], '#f8e6cc', 1);
  oval(g, 60, 20, 3.6, 3.6, { fill: '#ffe9a0', stroke: '#e0c060', width: 0.4 });
  g.fillStyle = '#46598a';
  g.beginPath(); g.arc(61.8, 18.8, 3, 0, Math.PI * 2); g.fill();
  for (const [sx, sy] of [[33, 18], [40, 31], [54, 35], [36, 37]]) {
    if ((boil + sx) % 3 === 0) continue;
    line(g, [[sx - 1, sy], [sx + 1, sy]], '#fff6d0', 0.4);
    line(g, [[sx, sy - 1], [sx, sy + 1]], '#fff6d0', 0.4);
  }
  // 吊燈
  line(g, [[96, -1], [96, 8]], INK, 0.45);
  shape(g, [[90, 14], [102, 14], [99, 8], [93, 8]], { fill: '#ffd98a', shade: '#e8b44a' });
  // 牆上的畫（阿哲畫的閃電）
  box(g, 112, 14, 24, 20, { fill: '#ffffff', width: 0.7 });
  shape(g, [[125, 16], [119, 25], [124, 25], [121, 32], [129, 22], [124, 22], [127, 16]], { fill: '#ffd166', shade: '#e8a92e', width: 0.4 });
  // 冰箱
  box(g, 146, 28, 20, 44, { fill: '#eef3f6', shade: '#c8d4dc' });
  line(g, [[146, 46], [166, 46]], INK, 0.45);
  line(g, [[162, 34], [162, 42]], INK, 0.6);
}

// 前景：畫在角色前面的東西（餐桌讓角色看起來坐著）
function homeFront(g) {
  box(g, 30, 82, 132, 5, { fill: '#c98f5a', shade: '#a8744a' });
  box(g, 34, 87, 124, 11, { fill: '#b07a48', shade: '#8a5a32' });
  line(g, [[40, 98], [40, 108]], INK, 1);
  line(g, [[152, 98], [152, 108]], INK, 1);
  for (const bx of [64, 128]) shape(g, ellipsePts(bx, 79, 6, 4, 8, 0, Math.PI), { fill: '#ffffff', width: 0.45 });
  oval(g, 96, 80, 9, 2.4, { fill: '#ffffff', width: 0.45 });
  oval(g, 96, 78.8, 6, 1.8, { fill: '#8fcf78', shade: '#4f9a45', width: 0.4 });
}

function title(g) { track(g); }

export const SCENES = { classroom, track, sportsday, home, title };
export const FOREGROUNDS = { home: homeFront };

// 換一張背景前，先設好種子（同一個場景每次畫出來都一樣）
export function drawScene(g, bg, boil = 0) {
  seed(hash(bg) + boil * 104729);
  (SCENES[bg] || SCENES.classroom)(g, boil);
}

export function drawForeground(g, bg, boil = 0) {
  if (!FOREGROUNDS[bg]) return;
  seed(hash(bg) * 3 + boil);
  FOREGROUNDS[bg](g, boil);
}

// 布條文字（以高解析度疊在場景上）；key 對應 i18n 的介面文字
export function sceneLabels(bg) {
  if (bg === 'sportsday') return [{ key: 'sportsBanner', x: 96, y: 16.5, size: 6.5, color: '#fffaf0' }];
  return [];
}
