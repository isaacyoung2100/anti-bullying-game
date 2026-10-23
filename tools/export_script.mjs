// 把遊戲裡的劇本匯出成好讀的文件：docs/劇本.md
// 用法：node tools/export_script.mjs
// 文件直接從 frontend/js/stories/ 產生，改完劇本重新執行即可保持一致

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORIES, CHARACTERS, START_COURAGE, OVERNIGHT, BRAVE_THRESHOLD, ZHIHAO_INNER,
} from '../frontend/js/story.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'docs', '劇本.md');

const FLAG_LABEL = { toldMom: '有把事情告訴媽媽', toldTeacher: '有把事情告訴老師' };

function effectNote(effect) {
  if (!effect) return '';
  const parts = [];
  if (effect.courage) parts.push(`勇氣 ${effect.courage > 0 ? '+' : ''}${effect.courage}`);
  if (effect.witness) parts.push(`看到卻沒說話 +${effect.witness}`);
  if (effect.kind) parts.push(`有人伸出手 +${effect.kind}`);
  return parts.length ? ` 〔${parts.join('｜')}〕` : '';
}

function line(step, player, indent) {
  const who = step.speaker === player ? '你' : (CHARACTERS[step.speaker]?.name || '');
  const text = step.text.replace(/\n/g, ' ');
  const head = who ? `**${who}**：${text}` : `*${text}*`;
  const inner = step.inner ? `　💭 心裡想：${step.inner}` : '';
  return `${indent}- ${head}${inner}${effectNote(step.effect)}`;
}

function steps(list, player, depth = 0) {
  const indent = '  '.repeat(depth);
  const rows = [];
  for (const step of list) {
    if (step.k === 'day') {
      rows.push('', `### ${step.day}｜${step.title}`, '');
    } else if (step.k === 'choice') {
      rows.push(`${indent}- 🔸 **你的選擇：${step.prompt}**`);
      step.options.forEach((o, n) => {
        const letter = 'ABC'[n];
        const need = o.need ? `（勇氣至少 ${o.need} 才能選，不夠時會被劃掉：你現在說不出口）` : '';
        rows.push(`${indent}  - **${letter}. ${o.text}**${need}${effectNote(o.effect)}`);
        rows.push(...steps(o.then, player, depth + 2));
      });
    } else if (step.k === 'if') {
      rows.push(`${indent}- 🔹 **只有在「${FLAG_LABEL[step.flag] || step.flag}」時才會發生：**`);
      rows.push(...steps(step.then, player, depth + 1));
    } else {
      rows.push(line(step, player, indent));
    }
  }
  return rows;
}

// 遊戲由來是手寫的，放在 docs/由來.md；劇本部分自動產生
const origin = readFileSync(join(root, 'docs', '由來.md'), 'utf8').trim();

const doc = [
  '# 五年三班大隊接力｜遊戲由來與完整劇本',
  '',
  '> 「由來」一節由 `docs/由來.md` 手寫維護；劇本部分由遊戲的劇本檔（`frontend/js/stories/`）自動產生。改完後執行 `node tools/export_script.mjs` 重新產生。',
  '',
  origin,
  '',
  '---',
  '',
  '# 完整劇本',
  '',
  '## 遊戲規則',
  '',
  `- 玩家選一個角色，以第一人稱「你」度過運動會前的一個禮拜（週一到週五，週六是運動會）。`,
  `- **勇氣值**從 ${START_COURAGE} 開始（最高 100）。每天早上睡一覺 +${OVERNIGHT}。`,
  '- 有些選項需要足夠的勇氣，不夠時會被劃掉，旁邊寫「（你現在說不出口）」。',
  '- 欺負你的人和旁觀者怎麼做是固定的；你的選擇只改變你的感受和你找誰說。',
  `- **結局**：運動會前勇氣 ≥ ${BRAVE_THRESHOLD} 走「勇敢」結局，否則走「沉重」結局。兩種都不是懲罰。`,
  '- 結局之後：志豪的內心話 → 一週回顧（每天的勇氣、有人看到卻沒說話的次數、有人伸出手的次數）→ 最後一頁。',
  '- 標記說明：**粗體**是說話的人；*斜體*是旁白；💭 是你心裡真正的想法；〔 〕是這句話對數值的影響。',
  '',
];

for (const st of STORIES) {
  doc.push('---', '', `## ${st.name}的故事`, '', `> ${st.blurb}`);
  doc.push(...steps(st.story, st.id));
  doc.push('', '### 週六｜運動會（勇敢結局）', '');
  doc.push(...steps(st.endings.brave.filter((s) => s.k !== 'day'), st.id));
  doc.push('', '### 週六｜運動會（沉重結局）', '');
  doc.push(...steps(st.endings.heavy.filter((s) => s.k !== 'day'), st.id));
  doc.push('');
}

doc.push(
  '---', '',
  '## 所有角色共用的結尾', '',
  '### 志豪的內心話', '',
  ...ZHIHAO_INNER.split('\n').map((t) => `> ${t}`), '',
  '### 一週回顧', '',
  '- 長條圖：每天結束時的勇氣。',
  '- 「＿次，有人看到了，卻沒有說話。」',
  '- 「＿次，有人對你伸出手。」',
  '- 「對被欺負的人來說，一句「你還好嗎？」可能就改變了一整天。」', '',
  '### 最後一頁', '',
  '**如果你在現實生活中，也遇到類似的事**', '',
  '這不是你的錯。', '',
  '- 告訴一個你信任的大人：爸爸媽媽、老師、輔導老師都可以。',
  '- 如果很難說出口，可以先寫下來，交給他們看。',
  '- 安心專線 1925（24 小時）、保護專線 113。', '',
  '如果你看到別人被這樣對待：你不用很勇敢。走過去問一句「你還好嗎？」，就很有用。', '',
  '---', '',
  '## 開場與暫停', '',
  '**開場副標**：運動會前的一個禮拜。選一個同學，過他的一週。', '',
  '**開場提醒**：這個故事裡會有同學之間不愉快的事，例如嘲笑和排擠。如果玩的時候覺得不舒服，可以隨時按右上角的「暫停」。', '',
  '**暫停選單**：休息一下。如果玩的時候想起不舒服的事，可以先停下來，找身邊信任的大人聊一聊。（繼續玩／重新開始這個故事／回主畫面／全螢幕／離開遊戲）', '',
);

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, doc.join('\n'), 'utf8');
console.log(`wrote docs/劇本.md (${doc.length} lines)`);
