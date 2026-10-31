// 這週的你：把一週的選擇整理成一段總結（反思頁、週記單、分享圖都用這一段）
// - 先由程式整理「事實」：只有劇本裡寫好的句子、心裡的天氣、日記從詞表裡選的情緒詞
//   學生自己打的字（日記內容、自己取的情緒詞、座號）一律不放進來，所以可以送給 AI 改寫
// - 有設定 AI_URL 時，請後端用 AI 把事實寫成給孩子看的幾句話
//   沒有設定、太慢、額度用完、內容沒通過檢查，就用程式組的句子，學生不會看到錯誤訊息

import { AI_URL } from './config.js?v=dev';
import { t, tr, getLang } from './i18n.js?v=dev';

// 放進引號裡的句子：裡面的引號換成另一種（「」裡面用『』，“ ” 裡面用 ‘ ’），句尾的標點拿掉
const bare = (s) => s
  .replace(/「/g, '『').replace(/」/g, '』').replace(/“/g, '‘').replace(/”/g, '’')
  .replace(/[。．.！!？?…，,]+(?=[』’]?$)/, '');

// 列出名字：中文用「、」；英文最後兩個用 and（Xiaoyu, Kai and Qing）
const list = (xs) => (getLang() === 'en' && xs.length > 1
  ? `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`
  : xs.join(t('listSep')));

// state：遊戲狀態；nameOf：角色 id 換成名字；weatherWord：能量換成「晴天、下雨」
export function weekFacts({ story, days, picks, diary }, nameOf, weatherWord) {
  const preset = new Set(Object.values(t('quads')).flatMap((q) => q.words));
  return {
    lang: getLang(),
    role: tr(story.name),
    days: days.map((d) => {
      const entry = diary.find((e) => e.day === d.day && !e.skipped);
      const mine = picks.filter((p) => p.day === d.day);
      return {
        day: tr(d.day),
        weather: weatherWord(d.courage),
        // 自己取的情緒詞是學生打的字：不送出去
        feel: entry && preset.has(entry.word) ? entry.word : null,
        chose: mine.filter((p) => !p.who).map((p) => ({ text: tr(p.text), brave: (p.need || 0) > 0, scared: !!p.scared, protect: !!p.protect })),
        noticed: mine.filter((p) => p.who).map((p) => ({ who: nameOf(p.who), text: tr(p.text), did: !p.none })),
      };
    }),
  };
}

// 沒有 AI 時的總結：只用事實組句子，不評分、不貼標籤
// 句子有先後：越前面越重要，放不下就省略後面的（和 AI 的總結一樣不超過字數上限），再照原本的順序排好
export function localSummary(f) {
  const lines = [];  // [重要性, 句子]
  const first = f.days[0];
  const last = f.days[f.days.length - 1];
  if (first && last && first !== last) lines.push([3, t('sumWeather', first.day, first.weather, last.day, last.weather)]);

  const chose = f.days.flatMap((d) => d.chose.map((c) => ({ ...c, day: d.day })));
  // 害怕還是去做的那一次最值得說；沒有的話，說一個需要勇氣的選擇
  const scared = chose.find((c) => c.scared);
  if (scared) lines.push([1, t('sumScared', scared.day, bare(scared.text))]);
  const brave = chose.find((c) => c.brave && c !== scared);
  if (brave) lines.push([2, t('sumBrave', brave.day, bare(brave.text))]);
  // 先把自己顧好的選擇也值得說，不然一路保護自己的學生，總結裡像什麼都沒做
  const protect = chose.find((c) => c.protect);
  if (protect) lines.push([2, t('sumProtect', protect.day, bare(protect.text))]);

  const noticed = f.days.flatMap((d) => d.noticed);
  const did = noticed.filter((n) => n.did);
  const names = (ns) => list([...new Set(ns.map((n) => n.who))]);
  if (did.length) lines.push([0, t('sumReach', names(did), bare(did[0].text))]);
  // 已經說過「先把自己顧好」，這裡就不再重複
  else if (noticed.length) lines.push([0, protect ? t('sumNoticed', names(noticed)) : t('sumNoReach', names(noticed))]);

  const feels = [...new Set(f.days.map((d) => d.feel).filter(Boolean))];
  if (feels.length) lines.push([4, t('sumFeel', list(feels))]);

  const budget = LIMITS[f.lang].text - 20;
  const keep = new Set();
  let used = 0;
  [...lines].sort((a, b) => a[0] - b[0]).forEach((line) => {
    if (used + line[1].length > budget) return;
    keep.add(line);
    used += line[1].length;
  });

  const bold = scared || brave;
  const share = [did.length && t('shareReach', names(did)), bold && t('shareBrave', bare(bold.text)), protect && t('shareProtect'), t('shareFeel')]
    .find((s) => s && s.length <= LIMITS[f.lang].share);
  return { text: lines.filter((l) => keep.has(l)).map((l) => l[1]).join(t('sentSep')), share, ai: false };
}

// AI 寫的內容在畫出來之前再檢查一次（後端也檢查過）：長度、語言、不能有的字眼
const LIMITS = { zh: { text: 220, share: 40 }, en: { text: 900, share: 160 } };
const BANNED = {
  zh: ['冷漠', '懦弱', '膽小', '沒用', '活該', '失敗', '不夠勇敢', '你應該', '分數', '及格', '自殺', '<', 'http'],
  en: ['coward', 'weak', 'useless', 'deserve', 'failure', 'not brave enough', 'you should', 'score', 'suicide', '<', 'http'],
};
export function checkSummary(out, lang) {
  const lim = LIMITS[lang];
  if (!lim || typeof out?.summary !== 'string' || typeof out?.share !== 'string') return false;
  const text = out.summary.trim();
  const share = out.share.trim();
  if (text.length < 20 || text.length > lim.text || share.length < 4 || share.length > lim.share) return false;
  if (lang === 'zh' && !/[一-鿿]/.test(text)) return false;
  const all = `${text} ${share}`.toLowerCase();
  return !BANNED[lang].some((w) => all.includes(w));
}

// 遊戲一開始先叫醒後端（免費主機閒置太久會睡著），玩到反思頁時就醒了
export function wakeAI() {
  if (AI_URL) fetch(`${AI_URL}/health`).catch(() => {});
}

// 請後端寫總結；任何問題都回傳 null，由呼叫的地方改用 localSummary
export async function aiSummary(facts, ms = 9000) {
  if (!AI_URL) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(`${AI_URL}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facts),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const out = await res.json();
    return checkSummary(out, facts.lang) ? { text: out.summary.trim(), share: out.share.trim(), ai: true } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export const aiEnabled = () => !!AI_URL;
