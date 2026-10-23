// 把遊戲裡的劇本匯出成好讀的文件：docs/劇本.md
// 用法：node tools/export_script.mjs
// 文件直接從 frontend/js/stories/ 產生，改完劇本重新執行即可保持一致

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORIES, CHARACTERS, START_COURAGE, OVERNIGHT, ZHIHAO_INNER, HELP_LINES,
} from '../frontend/js/story.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'docs', '劇本.md');

const FLAG_LABEL = {
  toldMom: '有把事情告訴媽媽', toldTeacher: '有把事情告訴老師', friend: '有問對方「你也會被他們笑嗎？」',
  askedMomAway: '請媽媽不要來運動會', quietWithMom: '跟媽媽說學校很好',
};

function effectNote(effect) {
  if (!effect) return '';
  const parts = [];
  if (effect.courage) parts.push(`心靈能量 ${effect.courage > 0 ? '+' : ''}${effect.courage}`);
  if (effect.witness) parts.push(`看到卻沒說話 +${effect.witness} 人次`);
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
      if (step.recap) rows.push(`> 摘要（「換你想一想」選這天時顯示）：${step.recap}`, '');
      if (step.help) {
        rows.push('> 「換你想一想」這天可以做的小行動 → 結果：');
        for (const h of step.help) rows.push(`> - ${h.text} → ${h.result}`);
        rows.push('');
      }
    } else if (step.k === 'choice') {
      rows.push(`${indent}- 🔸 **你的選擇：${step.prompt}**`);
      step.options.forEach((o, n) => {
        const letter = 'ABC'[n];
        const need = o.need ? `（心靈能量至少 ${o.need} 才能選，不夠時會被劃掉：你現在說不出口${o.fear ? `；心裡想：${o.fear}` : ''}）` : '';
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
  `- **心靈能量**從 ${START_COURAGE} 開始（最高 100）。每天早上睡一覺 +${OVERNIGHT}。`,
  '- 有些選項需要足夠的心靈能量，不夠時會被劃掉，旁邊寫「（你現在說不出口）」，並顯示你心裡具體在怕什麼。',
  '- 欺負你的人和旁觀者怎麼做是固定的；你的選擇只改變你的感受和你找誰說。',
  '- 週五早上，老師一定會發現並私下找你談，不取決於你有沒有說出來；如果你有告訴媽媽，會多一份家人的支持。',
  '- **結局**：每個角色只有一個結局。欺負的人和旁觀者在每條路徑都一樣；前面發生的事只用來加入細節（例如有告訴媽媽，媽媽就在觀眾席喊加油）。結局一定有朋友和老師，並約好下禮拜再聊。',
  '- 每天的劇情結束後寫一篇日記：情緒象限選一格 → 替情緒命名（選詞或自己寫）→ 回答引導問題（可以不寫字，也可以整篇跳過）。',
  '- 結局之後：志豪的內心話 → 一週回顧（心裡的天氣、有人看到卻沒說話的次數、有人伸出手的次數、五篇日記）→ 換你想一想（回到旁觀者的角度）→ 最後一頁（可以「聽完分享，再想一次」）。',
  '- 標記說明：**粗體**是說話的人；*斜體*是旁白；💭 是你心裡真正的想法；〔 〕是這句話對數值的影響。',
  '',
];

for (const st of STORIES) {
  doc.push('---', '', `## ${st.name}的故事`, '', `> ${st.blurb}`);
  doc.push(...steps(st.story, st.id));
  doc.push(...steps(st.ending, st.id));
  doc.push('');
}

doc.push(
  '---', '',
  '## 所有角色共用的結尾', '',
  '### 志豪的內心話', '',
  ...ZHIHAO_INNER.split('\n').map((t) => `> ${t}`), '',
  '### 一週回顧：你心裡的天氣', '',
  '- 每天顯示一個天氣：晴天（能量 75 以上）、多雲（55–74）、陰天（35–54）、下雨（35 以下）。不顯示數字，避免讓孩子覺得心情低落是「分數比較差」。',
  '- 「有＿人次，看到了，卻沒有說話。」（每個事件旁邊有幾個人看到，就算幾人次）',
  '- 「有＿次，有人對你伸出手。」',
  '- 「對被欺負的人來說，一句「你還好嗎？」可能就改變了一整天。」', '',
  '### 換你想一想', '',
  '- 「如果你是五年三班的同學，你會在哪一天，走過去找（角色名字）？」玩家從週一到週五選一天。',
  '- 「那天，你可以做什麼？」選項：問一句「你還好嗎？」／不跟著笑／陪他（她）一起走一段路／下課去告訴老師。',
  '- 選完後顯示：「（那一天），你（做的事）。對（角色）來說，這可能就是那個禮拜裡，最不一樣的一刻。現實中的你，也可以這樣做。」沒有對錯，也不記錄。', '',
  '### 最後一頁', '',
  '**如果你在現實生活中，也遇到類似的事**', '',
  '這不是你的錯。', '',
  '- 告訴一個你信任的大人：爸爸媽媽、導師、輔導室或學務處的老師都可以。',
  '- 如果很難說出口，可以先寫下來，交給他們看。',
  '- 說出來之後，大人需要一點時間了解和處理。如果事情沒有馬上變好，那不是你的錯，可以再說一次，或找另一個大人。', '',
  ...HELP_LINES.map((h) => `- **${h.name} ${h.number}**：${h.note}`), '',
  '如果你看到別人被這樣對待：你不用很勇敢。走過去問一句「你還好嗎？」，就很有用。', '',
  '---', '',
  '## 開場與暫停', '',
  '**開場副標**：運動會前的一個禮拜。選一個同學，過他的一週。', '',
  '**開場提醒**：這個故事裡會有同學之間不愉快的事，例如嘲笑和排擠。如果玩的時候覺得不舒服，可以隨時按右上角的「暫停」。', '',
  '**暫停選單**：休息一下。如果玩的時候想起不舒服的事，可以先停下來，找身邊信任的大人聊一聊。需要幫忙：教育部防制校園霸凌專線 1953（24 小時）。（繼續玩／重新開始這個故事／回主畫面／全螢幕／離開遊戲）', '',
);

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, doc.join('\n'), 'utf8');
console.log(`wrote docs/劇本.md (${doc.length} lines)`);

// 給協作 AI 的單一檔案：角色擴充簡報（手寫）＋ 由來與完整劇本（自動產生）
// 由來.md 是寫給評估者的，合併時只留「背景」和「目前的設計與數值」：
// 拿掉給評估者的段落，免得協作 AI 寫成審查報告；
// 拿掉「設計演變」和「已知限制」，裡面詳細記錄了已經修正的舊問題，AI 容易當成現在的狀態
const brief = readFileSync(join(root, 'docs', '角色擴充簡報.md'), 'utf8').trim();
const originLF = origin.replace(/\r\n/g, '\n');
const section = (title) => {
  const m = originLF.match(new RegExp(`^## ${title}[^\\n]*\\n[\\s\\S]*?(?=\\n---\\n|(?![\\s\\S]))`, 'm'));
  if (!m) throw new Error(`docs/由來.md 找不到「${title}」這一節，標題是否改過？`);
  return m[0].trim();
};
const background = [
  section('一、背景').replace(/^## 一、/, '## 一、'),
  section('三、目前的設計與數值').replace(/^## 三、/, '## 二、'),
].join('\n\n---\n\n');
for (const word of ['評估者', '外籍新娘', '兩種結局']) {
  if (background.includes(word)) throw new Error(`合併檔的背景資料裡出現「${word}」，請檢查 docs/由來.md`);
}
const backgroundDoc = doc.join('\n').replace(origin, background).replace(
  /^# 五年三班大隊接力｜遊戲由來與完整劇本\n\n> .*\n/,
  '# 背景資料：遊戲背景、目前的設計與完整劇本\n\n> 以下只是背景資料，**不需要評估或寫審查報告**，你的任務只有文件最前面「這份文件要請你做什麼」列出的那些。這裡描述的就是遊戲現在的樣子，完整劇本是目前的最新版本。\n',
);
const combined = `${brief}\n\n---\n\n${backgroundDoc}`;
writeFileSync(join(root, 'docs', '給協作AI_角色擴充與完整劇本.md'), combined, 'utf8');
console.log('wrote docs/給協作AI_角色擴充與完整劇本.md');
