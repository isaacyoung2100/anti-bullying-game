// 像素美術：全部用程式繪製，不使用圖片檔
// 畫布邏輯解析度 192×108，顯示時放大（保持像素銳利）

export const W = 192;
export const H = 108;

const OUTLINE = '#2b2030';

// ---------- 角色 ----------

// 16×24 角色身體模板
// O 外框 S 皮膚 C 上衣 D 上衣陰影 P 褲子 W 襪子 K 鞋子
const BODY = [
  '................',
  '....OOOOOOOO....',
  '...OSSSSSSSSO...',
  '..OSSSSSSSSSSO..',
  '..OSSSSSSSSSSO..',
  '..OSSSSSSSSSSO..',
  '..OSSSSSSSSSSO..',
  '..OSSSSSSSSSSO..',
  '..OSSSSSSSSSSO..',
  '..OSSSSSSSSSSO..',
  '...OSSSSSSSSO...',
  '....OOSSSSOO....',
  '.....OOSSOO.....',
  '....OCCCCCCO....',
  '...OCCCCCCCCO...',
  '..OCCOCCCCOCCO..',
  '..OCCOCCCCOCCO..',
  '..OSSOCCCCOSSO..',
  '...OOODDDDOOO...',
  '....OPPPPPPO....',
  '....OPPOOPPO....',
  '....OSSOOSSO....',
  '....OWWOOWWO....',
  '...OKKKOOKKKO...',
];

// 髮型覆蓋層（從第 0 列開始，"." 表示不變）H 頭髮 h 頭髮亮部 A 髮飾
const HAIR = {
  messy: [
    '...OO.OOO.OO....',
    '..OHHOHHHOHHO...',
    '..OHHHHHhHHHHO..',
    '..OHHHHHHHHHHO..',
    '..OHSHHSHHSHHO..',
    '..OHSSSSSSSSHO..',
    '...H........H...',
  ],
  spiky: [
    '...O.O..O.O.....',
    '..OHOHOOHOHOO...',
    '..OHHHHHHHHHHO..',
    '..OHhHHHHHHHHO..',
    '..OHHHHHHHHHHO..',
    '..OHSSSSSSSSHO..',
  ],
  neat: [
    '....OOOOOOOO....',
    '...OHHHHHHHHO...',
    '..OHHHHHHhHHHO..',
    '..OHHHHHHHHHHO..',
    '..OHHHHHHSSSHO..',
    '..OHSSSSSSSSSO..',
    '...H............',
  ],
  ponytail: [
    '....OOOOOOOO....',
    '...OHHHHHHHHO...',
    '..OHHhHHHHHHHOO.',
    '..OHHHHHHHHHHOHO',
    '..OHHHSSHHHHHOHO',
    '..OHSSSSSSSSHOHO',
    '...H........HOHO',
    '...H........HOHO',
    '.............OHO',
    '..............O.',
  ],
  bob: [
    '....OOOOOOOO....',
    '...OHHHHHHHHO...',
    '..OHHHHHHHAhHO..',
    '..OHHHHHHHHHHO..',
    '..OHHHHHHHHHHO..',
    '..OHSSSSSSSSHO..',
    '..OH........HO..',
    '..OH........HO..',
    '..OH........HO..',
    '..OHH......HHO..',
    '...OO......OO...',
  ],
  bun: [
    '......OOOO......',
    '.....OHHHHO.....',
    '...OOHHHHHHOO...',
    '..OHHHHHHHHHHO..',
    '..OHHHHHSSSHHO..',
    '..OHSSSSSSSSHO..',
    '...H........H...',
  ],
};

const SKIN_LIGHT = '#f6cfa8';

const PALETTES = {
  azhe:    { hair: 'messy',    H: '#4a3326', h: '#6e4c37', S: SKIN_LIGHT, C: '#f08a3c', D: '#c96a24', P: '#2f3e6e' },
  xiaoyu:  { hair: 'ponytail', H: '#1f1a24', h: '#3d3548', S: SKIN_LIGHT, C: '#8fa3b8', D: '#6f8399', P: '#2f3e6e' },
  aming:   { hair: 'neat',     H: '#1f1a24', h: '#3d3548', S: '#d9a273', C: '#4caf6d', D: '#358a52', P: '#2f3e6e' },
  zhihao:  { hair: 'spiky',    H: '#7a4a2a', h: '#a5683f', S: SKIN_LIGHT, C: '#e04b4b', D: '#b23636', P: '#2f3e6e' },
  jiajia:  { hair: 'bob',      H: '#2a2230', h: '#4a3e55', S: SKIN_LIGHT, C: '#9b7be0', D: '#7a5cc0', P: '#2f3e6e', A: '#ff7aa8' },
  teacher: { hair: 'bun',      H: '#3b2b25', h: '#5c4338', S: SKIN_LIGHT, C: '#e8d9b5', D: '#c7b48c', P: '#5a4a3a', glasses: true },
};

const FIXED = { O: OUTLINE, W: '#ffffff', K: '#f2f2f2' };

const FACE = {
  eye: OUTLINE,
  mouth: '#9a3b3b',
  blush: '#f3968f',
  tear: '#8fd3ff',
};

// 依表情回傳臉部像素 [x, y, color]
function facePixels(emo) {
  const e = FACE.eye, m = FACE.mouth;
  const eyesOpen = [[5, 6, e], [5, 7, e], [10, 6, e], [10, 7, e]];
  switch (emo) {
    case 'happy':
      return [
        [4, 7, e], [5, 6, e], [6, 7, e], [9, 7, e], [10, 6, e], [11, 7, e],
        [4, 8, FACE.blush], [11, 8, FACE.blush],
        [6, 9, m], [7, 10, m], [8, 10, m], [9, 9, m],
      ];
    case 'sad':
      return [
        [5, 7, e], [10, 7, e], [6, 5, e], [9, 5, e],
        [6, 10, m], [7, 9, m], [8, 9, m], [9, 10, m],
      ];
    case 'cry':
      return [
        [5, 7, e], [10, 7, e], [6, 5, e], [9, 5, e],
        [5, 8, FACE.tear], [5, 9, FACE.tear], [10, 8, FACE.tear], [10, 9, FACE.tear],
        [6, 10, m], [7, 9, m], [8, 9, m], [9, 10, m],
      ];
    case 'surprised':
      return [...eyesOpen, [7, 9, m], [8, 9, m], [7, 10, m], [8, 10, m]];
    case 'angry':
      return [
        ...eyesOpen, [4, 4, e], [5, 5, e], [11, 4, e], [10, 5, e],
        [6, 9, m], [7, 9, m], [8, 9, m], [9, 9, m],
      ];
    default:
      return [...eyesOpen, [7, 9, m], [8, 9, m]];
  }
}

const GLASSES = [
  [4, 6], [6, 6], [4, 7], [6, 7], [4, 5], [5, 5], [6, 5],
  [9, 6], [11, 6], [9, 7], [11, 7], [9, 5], [10, 5], [11, 5],
  [7, 6], [8, 6],
];

const spriteCache = new Map();

// 把一個角色的一種表情畫成 16×24 的小畫布（快取起來重複使用）
function buildSprite(id, emo) {
  const key = `${id}:${emo}`;
  if (spriteCache.has(key)) return spriteCache.get(key);
  const pal = PALETTES[id];
  const grid = BODY.map((row) => row.split(''));
  HAIR[pal.hair].forEach((row, y) => {
    row.split('').forEach((ch, x) => { if (ch !== '.') grid[y][x] = ch; });
  });
  const cv = document.createElement('canvas');
  cv.width = 16; cv.height = 24;
  const g = cv.getContext('2d');
  grid.forEach((row, y) => row.forEach((ch, x) => {
    if (ch === '.') return;
    g.fillStyle = FIXED[ch] || pal[ch] || OUTLINE;
    g.fillRect(x, y, 1, 1);
  }));
  for (const [x, y, c] of facePixels(emo)) { g.fillStyle = c; g.fillRect(x, y, 1, 1); }
  if (pal.glasses) {
    g.fillStyle = '#5b4a6a';
    for (const [x, y] of GLASSES) g.fillRect(x, y, 1, 1);
  }
  spriteCache.set(key, cv);
  return cv;
}

// 畫角色：x 為中心，y 為腳底；scale 2 = 32×48
export function drawChar(g, id, x, y, emo = 'neutral', { scale = 2, bob = 0, dim = false, flip = false } = {}) {
  if (!PALETTES[id]) return;
  const sp = buildSprite(id, emo);
  const w = 16 * scale, h = 24 * scale;
  g.save();
  // 影子
  g.fillStyle = 'rgba(40, 20, 30, 0.25)';
  g.fillRect(Math.round(x - w * 0.32), y - 1, Math.round(w * 0.64), 2);
  if (dim) g.filter = 'brightness(0.7) saturate(0.7)';
  const left = Math.round(x - w / 2), top = Math.round(y - h + bob);
  if (flip) {
    g.translate(left + w, top);
    g.scale(-1, 1);
    g.drawImage(sp, 0, 0, w, h);
  } else {
    g.drawImage(sp, left, top, w, h);
  }
  g.restore();
}

// 頭像（對話框用）：只取頭部
export function drawPortrait(canvas, id, emo) {
  const g = canvas.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, canvas.width, canvas.height);
  if (!PALETTES[id]) return false;
  const sp = buildSprite(id, emo);
  const s = Math.floor(canvas.width / 16);
  g.drawImage(sp, 0, 0, 16, 13, 0, Math.round((canvas.height - 13 * s) / 2), 16 * s, 13 * s);
  return true;
}

// ---------- 場景 ----------

function rect(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }

function cloud(g, x, y) {
  x = Math.round(x);
  rect(g, x + 2, y, 10, 2, '#ffffff');
  rect(g, x, y + 2, 16, 3, '#ffffff');
  rect(g, x + 1, y + 5, 14, 1, '#e3f1fa');
}

function tree(g, x, y) {
  rect(g, x + 5, y + 12, 3, 8, '#7a5230');
  rect(g, x + 2, y + 2, 10, 10, '#3f9a4a');
  rect(g, x, y + 5, 14, 6, '#3f9a4a');
  rect(g, x + 4, y, 6, 3, '#3f9a4a');
  rect(g, x + 3, y + 3, 3, 2, '#5cbf62');
  rect(g, x + 2, y + 10, 10, 2, '#2f7d3a');
}

function classroom(g, t) {
  // 牆壁與地板
  rect(g, 0, 0, W, 70, '#f3e6c8');
  rect(g, 0, 60, W, 10, '#d9c39a');
  rect(g, 0, 59, W, 1, '#bfa57a');
  rect(g, 0, 70, W, 38, '#c08b5c');
  for (let y = 74; y < H; y += 7) rect(g, 0, y, W, 1, '#a8744a');
  for (let y = 70, i = 0; y < H; y += 7, i++) {
    for (let x = (i % 2) * 16; x < W; x += 32) rect(g, x, y, 1, 7, '#a8744a');
  }
  // 窗戶
  for (const wx of [6, 160]) {
    rect(g, wx, 12, 26, 36, '#f7f7f2');
    rect(g, wx + 2, 14, 10, 32, '#9fd6f5');
    rect(g, wx + 14, 14, 10, 32, '#9fd6f5');
    rect(g, wx + 2, 38, 22, 8, '#bfe6f9');
    rect(g, wx + 3, 15, 1, 6, '#e6f6ff');
    rect(g, wx + 15, 15, 1, 6, '#e6f6ff');
    rect(g, wx - 1, 48, 28, 2, '#e2d6bb');
  }
  cloud(g, 8 + ((t / 400) % 14), 18);
  // 黑板
  rect(g, 44, 8, 104, 42, '#7a5230');
  rect(g, 46, 10, 100, 36, '#2f5d4a');
  rect(g, 46, 46, 100, 2, '#5c3d24');
  rect(g, 60, 45, 6, 1, '#f2f2f2');
  rect(g, 70, 45, 4, 1, '#f7d26a');
  // 黑板上的粉筆畫：跑道與接力棒
  const chalk = '#e8f0e6';
  rect(g, 54, 34, 84, 1, chalk);
  rect(g, 54, 40, 84, 1, chalk);
  for (let i = 0; i < 4; i++) {
    const sx = 60 + i * 20;
    rect(g, sx + 1, 24, 2, 2, chalk);          // 頭
    rect(g, sx + 1, 26, 1, 4, chalk);          // 身體
    rect(g, sx, 27, 1, 1, chalk); rect(g, sx + 3, 27, 1, 1, chalk);
    rect(g, sx, 30, 1, 2, chalk); rect(g, sx + 2, 30, 1, 2, chalk);
    if (i < 3) rect(g, sx + 6, 28, 8, 1, '#f7d26a'); // 箭頭
    if (i < 3) rect(g, sx + 12, 27, 1, 3, '#f7d26a');
  }
  rect(g, 54, 14, 10, 1, chalk); rect(g, 54, 17, 16, 1, chalk);
  rect(g, 126, 14, 12, 8, '#f5a3b5'); // 黑板上貼的紙
  // 時鐘
  rect(g, 93, 1, 6, 6, '#ffffff');
  rect(g, 92, 2, 8, 4, '#ffffff');
  rect(g, 95, 2, 1, 2, OUTLINE); rect(g, 96, 4, 2, 1, OUTLINE);
  // 後排課桌
  for (const dx of [8, 52, 112, 156]) {
    rect(g, dx, 64, 26, 3, '#e0b070');
    rect(g, dx + 1, 67, 24, 5, '#b98a50');
    rect(g, dx + 2, 72, 2, 6, '#6d5a4a');
    rect(g, dx + 22, 72, 2, 6, '#6d5a4a');
  }
}

function sky(g, t) {
  rect(g, 0, 0, W, 34, '#8fd0f5');
  rect(g, 0, 34, W, 14, '#b5e2f8');
  cloud(g, (t / 300) % (W + 20) - 20, 8);
  cloud(g, ((t / 450) + 110) % (W + 20) - 20, 18);
}

function schoolAndField(g) {
  // 遠方校舍
  rect(g, 30, 22, 132, 26, '#f1e3c8');
  rect(g, 30, 20, 132, 3, '#c0583f');
  rect(g, 86, 12, 20, 10, '#f1e3c8');
  rect(g, 84, 10, 24, 3, '#c0583f');
  rect(g, 93, 14, 6, 6, '#ffffff');
  rect(g, 95, 15, 1, 3, OUTLINE);
  for (let r = 0; r < 2; r++) {
    for (let x = 36; x < 158; x += 10) rect(g, x, 26 + r * 10, 6, 5, '#7cc3ea');
  }
  tree(g, 4, 28); tree(g, 18, 32); tree(g, 164, 30); tree(g, 176, 28);
  // 圍牆與草地
  rect(g, 0, 48, W, 4, '#d8d0c0');
  for (let x = 2; x < W; x += 8) rect(g, x, 47, 2, 5, '#bdb3a0');
  rect(g, 0, 52, W, 20, '#6cbf5a');
  for (let x = 4; x < W; x += 12) rect(g, x, 56 + (x % 3), 2, 1, '#5aa84a');
}

function trackGround(g) {
  rect(g, 0, 70, W, 38, '#d35d3f');
  rect(g, 0, 70, W, 2, '#f7efe6');
  for (const y of [80, 91, 102]) rect(g, 0, y, W, 1, '#f7efe6');
  rect(g, 26, 72, 2, 36, '#f7efe6');
  for (let x = 0; x < W; x += 9) rect(g, x, 76, 1, 1, '#c24f33');
}

function track(g, t) {
  sky(g, t);
  schoolAndField(g);
  trackGround(g);
}

const BUNTING = ['#ff6b6b', '#ffd166', '#4ecdc4', '#7a8cff', '#ff9ff3'];
const CROWD = ['#e04b4b', '#4caf6d', '#7a8cff', '#ffd166', '#f08a3c', '#9b7be0'];

function sportsday(g, t) {
  sky(g, t);
  schoolAndField(g);
  // 觀眾席
  rect(g, 0, 52, W, 14, '#e9e1d0');
  for (let i = 0; i < 32; i++) {
    const x = 3 + i * 6, y = 55 + (i % 2) * 4;
    const jump = (Math.floor(t / 250) + i) % 5 === 0 ? 1 : 0;
    rect(g, x, y - jump, 4, 4, SKIN_LIGHT);
    rect(g, x, y - jump, 4, 1, '#2a2230');
    rect(g, x - 1, y + 4 - jump, 6, 4, CROWD[i % CROWD.length]);
  }
  trackGround(g);
  // 彩旗
  for (let i = 0; i < 24; i++) {
    const x = i * 8;
    const y = 4 + Math.round(Math.sin(i / 3) * 2);
    rect(g, x, y, 8, 1, '#8a7a6a');
    g.fillStyle = BUNTING[i % BUNTING.length];
    g.beginPath();
    g.moveTo(x + 1, y + 1); g.lineTo(x + 7, y + 1); g.lineTo(x + 4, y + 6);
    g.fill();
  }
  // 布條
  rect(g, 56, 10, 80, 12, '#c0392b');
  rect(g, 56, 10, 80, 1, '#e8584a');
  rect(g, 54, 10, 2, 14, '#7a5230');
  rect(g, 136, 10, 2, 14, '#7a5230');
}

function title(g, t) {
  track(g, t);
}

export const SCENES = { classroom, track, sportsday, title };

// 布條文字（以高解析度疊在場景上）
export function sceneLabels(bg) {
  if (bg === 'sportsday') return [{ text: '第 32 屆 運動會', x: 96, y: 16, size: 7, color: '#fff7e0' }];
  return [];
}
