// 中英文切換
// - 劇本文字：tr(中文原文) 查 STORY_EN 翻譯表；劇本結構兩種語言共用，機制完全一樣
// - 介面文字：t(key, ...參數) 查下面的 UI 表
// - 語言來源：網址 ?lang=en 優先，其次是上次的選擇（localStorage），預設中文

import { STORY_EN } from './lang/story_en.js?v=dev';

const UI = {
  zh: {
    htmlLang: 'zh-Hant',
    gameTitle: '五年三班大隊接力',
    you: '你',
    energy: '心靈能量',
    energyText: (n) => `${n}（滿分 100）`,
    pause: '❚❚ 暫停',
    pauseLabel: '暫停',
    nextHint: '點一下繼續 ▼',
    sceneDefault: '遊戲畫面',
    scenes: { classroom: '教室', track: '操場', sportsday: '運動會', home: '家裡', title: '操場' },
    sportsBanner: '第 32 屆 運動會',
    listSep: '、',
    labelSep: '：',
    innerPrefix: '心裡想：',
    cont: '繼續 ▶',
    titleKicker: '反霸凌體驗遊戲',
    titleHtml: '五年三班<br>大隊接力',
    titleSub: '運動會前的一個禮拜。<br>選一個同學，過他的一週。',
    titleNotice: '這個故事裡會有同學之間不愉快的事，例如嘲笑和排擠。如果玩的時候覺得不舒服，可以隨時按右上角的「暫停」。',
    start: '開始 ▶',
    switchLang: 'English',
    selectKicker: '選擇角色',
    selectQ: '你想成為誰？',
    choiceKicker: '你的選擇',
    cantSay: '（你現在說不出口）',
    zhihaoKicker: '你可能不知道的事',
    zhihaoTitle: '志豪的內心話',
    weather: { sun: '晴天', cloud: '多雲', overcast: '陰天', rain: '下雨' },
    weekKicker: '這一個禮拜',
    weekTitle: '你心裡的天氣',
    weekAria: '每天心裡的天氣',
    witnessFact: (n) => `有 <b class="num">${n}</b> 人次，看到了，卻沒有說話。`,
    kindFact: (n) => `有 <b class="num">${n}</b> 次，有人對你伸出手。`,
    weekQuiet: '對被欺負的人來說，一句「你還好嗎？」可能就改變了一整天。',
    fallbackActions: (st) => ['問一句：「你還好嗎？」', '不跟著笑', `陪${st.pronoun || '他'}一起走一段路`, '下課去告訴老師'],
    thinkKicker: (n) => `換你想一想・${n} / 3`,
    thinkDayQ: (name) => `如果你是五年三班的同學，你會在哪一天，走過去找${name}？`,
    dayLabel: (day, title) => `${day}　${title}`,
    dayMood: (name, w) => `${name}心裡的天氣：${w}`,
    dayTitle: (day, title) => `${day}・${title}`,
    thinkActQ: '那天，你可以做什麼？',
    otherDay: '← 換一天',
    youChose: (a) => `你選擇：${a}`,
    differentMoment: (name) => `對${name}來說，這可能就是那個禮拜裡，最不一樣的一刻。`,
    youCanToo: '現實中的你，也可以這樣做。',
    closingKicker: '最後',
    closingTitle: '如果你在現實生活中，也遇到類似的事',
    notYourFault: '這不是你的錯。',
    closingTips: [
      '告訴一個你信任的大人：爸爸媽媽、導師、輔導室或學務處的老師都可以。',
      '如果很難說出口，可以先寫下來，交給他們看。',
      '說出來之後，大人需要一點時間了解和處理。如果事情沒有馬上變好，那不是你的錯，可以再說一次，或找另一個大人。',
    ],
    bystanderTip: '如果你看到別人被這樣對待：你不用很勇敢。走過去問一句「你還好嗎？」，就很有用。',
    playAgain: '再玩一次',
    home: '回主畫面',
    pauseMenu: '暫停選單',
    pauseKicker: '暫停',
    pauseTitle: '休息一下',
    pauseText: '如果玩的時候想起不舒服的事，可以先停下來，找身邊信任的大人聊一聊。',
    pauseHelp: (name, num) => `需要幫忙：${name} <b>${num}</b>（24 小時）`,
    resume: '繼續玩',
    restartStory: '重新開始這個故事',
    fullscreen: '全螢幕',
    exitFullscreen: '離開全螢幕',
    quit: '離開遊戲',
  },
  en: {
    htmlLang: 'en',
    gameTitle: 'Class 5-3 Relay',
    you: 'You',
    energy: 'Heart Energy',
    energyText: (n) => `${n} out of 100`,
    pause: '❚❚ Pause',
    pauseLabel: 'Pause',
    nextHint: 'Tap to continue ▼',
    sceneDefault: 'Game screen',
    scenes: { classroom: 'Classroom', track: 'Sports field', sportsday: 'Sports Day', home: 'Home', title: 'Sports field' },
    sportsBanner: '32nd Sports Day',
    listSep: ', ',
    labelSep: ': ',
    innerPrefix: 'Thinking: ',
    cont: 'Continue ▶',
    titleKicker: 'An anti-bullying story game',
    titleHtml: 'Class 5-3<br>Relay',
    titleSub: 'The week before Sports Day.<br>Pick a classmate and live their week.',
    titleNotice: 'This story includes unkind things between classmates, like teasing and leaving someone out. If you feel uncomfortable while playing, you can tap “Pause” in the top right at any time.',
    start: 'Start ▶',
    switchLang: '中文',
    selectKicker: 'Choose a character',
    selectQ: 'Who do you want to be?',
    choiceKicker: 'Your choice',
    cantSay: '(You can’t bring yourself to say it right now)',
    zhihaoKicker: 'Something you might not know',
    zhihaoTitle: 'What Zhihao Was Thinking',
    weather: { sun: 'Sunny', cloud: 'Cloudy', overcast: 'Gray', rain: 'Rainy' },
    weekKicker: 'This week',
    weekTitle: 'The Weather in Your Heart',
    weekAria: 'The weather in your heart each day',
    witnessFact: (n) => `<b class="num">${n}</b> times, someone saw it happen and said nothing.`,
    kindFact: (n) => `<b class="num">${n}</b> times, someone reached out to you.`,
    weekQuiet: 'For someone being bullied, one “Are you okay?” can change a whole day.',
    fallbackActions: (st) => ['Ask: “Are you okay?”', 'Don’t laugh along', `Walk with ${st.pronoun === '她' ? 'her' : 'him'} for a while`, 'Tell the teacher after class'],
    thinkKicker: (n) => `Your turn to think · ${n} / 3`,
    thinkDayQ: (name) => `If you were a classmate in Class 5-3, which day would you go over to ${name}?`,
    dayLabel: (day, title) => `${day}: ${title}`,
    dayMood: (name, w) => `${name}’s heart weather: ${w}`,
    dayTitle: (day, title) => `${day} · ${title}`,
    thinkActQ: 'That day, what could you do?',
    otherDay: '← Pick another day',
    youChose: (a) => `You chose: ${a}`,
    differentMoment: (name) => `For ${name}, that might have been the moment that made the week different.`,
    youCanToo: 'You can do this in real life, too.',
    closingKicker: 'Last page',
    closingTitle: 'If something like this happens to you in real life',
    notYourFault: 'It is not your fault.',
    closingTips: [
      'Tell an adult you trust: a parent, your homeroom teacher, or a teacher in the counseling or student affairs office.',
      'If it’s hard to say out loud, you can write it down and show them.',
      'After you tell them, adults need a little time to understand and help. If things don’t get better right away, that’s not your fault. You can tell them again, or find another adult.',
    ],
    bystanderTip: 'If you see someone being treated like this: you don’t have to be brave. Walking over and asking “Are you okay?” really helps.',
    playAgain: 'Play again',
    home: 'Back to title',
    pauseMenu: 'Pause menu',
    pauseKicker: 'Paused',
    pauseTitle: 'Take a break',
    pauseText: 'If something while playing brings up bad memories, you can stop for a while and talk to an adult you trust.',
    pauseHelp: (name, num) => `Need help? ${name} <b>${num}</b> (24 hours)`,
    resume: 'Keep playing',
    restartStory: 'Restart this story',
    fullscreen: 'Full screen',
    exitFullscreen: 'Exit full screen',
    quit: 'Quit game',
  },
};

function initialLang() {
  if (typeof location === 'undefined') return 'zh'; // 在 node 測試裡執行時
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'zh') return q;
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'zh') return saved;
  } catch { /* 私密瀏覽等情況讀不到，就用預設 */ }
  return 'zh';
}

let lang = initialLang();

export function getLang() { return lang; }

export function setLang(next) {
  lang = next;
  try { localStorage.setItem('lang', next); } catch { /* 存不了也沒關係 */ }
  // 網址上的 ?lang= 也一起改，重新整理時才不會變回原本的語言
  try {
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', next);
      history.replaceState(null, '', url);
    }
  } catch { /* 在沙盒裡改不了網址也沒關係 */ }
}

// 介面文字；值是函式時把參數帶進去
export function t(key, ...args) {
  const v = UI[lang][key];
  return typeof v === 'function' ? v(...args) : v;
}

// 劇本文字：英文版查翻譯表，查不到就顯示中文（測試會確保不會發生）
export function tr(s) {
  if (lang === 'zh' || !s) return s;
  return STORY_EN[s] ?? s;
}

export const UI_KEYS = { zh: Object.keys(UI.zh), en: Object.keys(UI.en) };
