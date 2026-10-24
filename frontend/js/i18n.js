// 中英文切換
// - 劇本文字：tr(中文原文) 查 STORY_EN 翻譯表；劇本結構兩種語言共用，機制完全一樣
// - 介面文字：t(key, ...參數) 查下面的 UI 表
// - 語言來源：網址 ?lang=en 優先，其次是上次的選擇（localStorage），預設中文

import { STORY_EN } from './lang/story_en.js?v=dev';

const UI = {
  zh: {
    htmlLang: 'zh-Hant',
    gameTitle: '五年三班大隊接力',
    energy: '心靈能量',
    energyText: (n) => `${n}（滿分 100）`,
    pause: '❚❚ 暫停',
    pauseLabel: '暫停',
    nextHint: '點一下繼續 ▼',
    seen: (n) => `已讀 ${n}`,
    seenDm: '已讀',
    back: '↶ 上一句',
    backLabel: '看上一句台詞',
    backHint: '重看中・點一下看下一句 ▼',
    reviewBtn: '← 看剛剛的對話',
    sceneDefault: '遊戲畫面',
    scenes: { classroom: '教室', track: '操場', sportsday: '運動會', home: '家裡', title: '操場' },
    sportsBanner: '第 32 屆 運動會',
    listSep: '、',
    labelSep: '：',
    innerPrefix: '心裡想：',
    cont: '繼續 ▶',
    titleKicker: '反霸凌體驗遊戲',
    titleHtml: '<span>五年三班</span><br><span>大隊接力</span>',
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
    // 日記
    diaryKicker: (day) => `${day}・日記`,
    diaryMoodQ: '今天結束了。你的心情在哪一格？',
    diaryAxis: { high: '能量高', low: '能量低', bad: '不舒服', good: '舒服' },
    quads: {
      red: { face: '😣', name: '生氣緊張', hint: '像是生氣、害怕、丟臉', words: ['生氣', '委屈', '緊張', '丟臉', '煩躁', '害怕', '不甘心', '防備'] },
      yellow: { face: '😄', name: '開心有勁', hint: '像是開心、期待、驕傲', words: ['開心', '期待', '興奮', '驕傲', '感動', '有勇氣', '被支持', '躍躍欲試'] },
      blue: { face: '😞', name: '難過低落', hint: '像是難過、孤單、受傷', words: ['難過', '受傷', '孤單', '沮喪', '失落', '無能為力', '想哭', '被冷落'] },
      green: { face: '😌', name: '平靜安心', hint: '像是安心、輕鬆、溫暖', words: ['安心', '溫暖', '輕鬆', '踏實', '鬆了一口氣', '被理解', '滿足', '被接納'] },
    },
    diaryWordQ: '哪一個詞最像你現在的感覺？',
    diaryOwnWord: '或者自己寫一個詞：',
    diaryOwnPlaceholder: '例如：怕被笑',
    diaryNext: '下一步 ▶',
    diaryFeel: (word) => `今天的心情：${word}`,
    diaryPrompts: [
      '今天哪一刻，你心裡最不舒服？那時候你在想什麼？',
      '今天有人看到發生的事嗎？你希望他們怎麼做？',
      '如果可以對今天的某個人說一句話，你想說什麼？',
      '今天晚上，有沒有什麼話你想說，卻沒有說出口？',
      '今天有沒有哪一刻，讓你覺得好一點？是因為誰？',
    ],
    diaryTextPlaceholder: '寫幾句就好，也可以不寫。',
    diaryDone: '寫好了 ▶',
    // 分享
    shareOpen: '📮 分享給朋友',
    shareKicker: '我玩了',
    shareWeather: '我心裡的天氣',
    shareKicker2: '分享給朋友',
    shareTitle: '把這一個禮拜，分享給朋友',
    shareWho: (name) => `我扮演${name}，過了運動會前的一個禮拜。`,
    shareAct: (day, act) => `如果我是五年三班的同學，我會在${day}：${act}`,
    shareInvite: '你也來玩玩看 👉',
    shareText: (name) => `我玩了《五年三班大隊接力》，扮演${name}過了運動會前的一個禮拜。你也來玩玩看：`,
    shareAlt: (name) => `分享圖：我扮演${name}玩了五年三班大隊接力`,
    shareHold: '長按圖片也可以存起來。日記寫的內容不會出現在圖上。',
    shareBtn: '分享',
    shareDownload: '下載圖片',
    shareCopy: '複製連結',
    shareCopied: '已經複製，可以貼給朋友了！',
    shareBack: '← 回到最後一頁',
    diaryWeekTitle: '這個禮拜的日記',
    diaryEmpty: '（這天沒有寫）',
    // 聽完分享，再想一次
    againBtn: '聽完分享，再想一次',
    againKicker: (n) => `聽完分享，再想一次・${n} / 3`,
    firstWas: (day, action) => `你第一次選的是：${day}，${action}`,
    firstLabel: '第一次',
    nowLabel: '聽完分享之後',
    changedNote: '想法改變了也沒關係。聽見別人的想法，本來就可能讓我們看到新的做法。',
    sameNote: '你還是選了一樣的。聽完別人的想法，你更確定自己可以這樣做。',
  },
  en: {
    htmlLang: 'en',
    gameTitle: 'Class 5-3 Relay',
    energy: 'Heart Energy',
    energyText: (n) => `${n} out of 100`,
    pause: '❚❚ Pause',
    pauseLabel: 'Pause',
    nextHint: 'Tap to continue ▼',
    seen: (n) => `Seen by ${n}`,
    seenDm: 'Seen',
    back: '↶ Back',
    backLabel: 'See the previous line',
    backHint: 'Rereading · tap for the next line ▼',
    reviewBtn: '← See what was just said',
    sceneDefault: 'Game screen',
    scenes: { classroom: 'Classroom', track: 'Sports field', sportsday: 'Sports Day', home: 'Home', title: 'Sports field' },
    sportsBanner: '32nd Sports Day',
    listSep: ', ',
    labelSep: ': ',
    innerPrefix: 'Thinking: ',
    cont: 'Continue ▶',
    titleKicker: 'An anti-bullying story game',
    titleHtml: '<span>Class 5-3</span><br><span>Relay</span>',
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
    // Diary
    diaryKicker: (day) => `${day} · Diary`,
    diaryMoodQ: 'The day is over. Which box is your mood in?',
    diaryAxis: { high: 'High energy', low: 'Low energy', bad: 'Unpleasant', good: 'Pleasant' },
    quads: {
      red: { face: '😣', name: 'Mad or tense', hint: 'Like angry, scared, embarrassed', words: ['angry', 'treated unfairly', 'nervous', 'embarrassed', 'irritated', 'scared', 'frustrated', 'on guard'] },
      yellow: { face: '😄', name: 'Happy and lively', hint: 'Like happy, hopeful, proud', words: ['happy', 'hopeful', 'excited', 'proud', 'touched', 'brave', 'supported', 'eager'] },
      blue: { face: '😞', name: 'Sad and low', hint: 'Like sad, lonely, hurt', words: ['sad', 'hurt', 'lonely', 'discouraged', 'let down', 'helpless', 'like crying', 'left out'] },
      green: { face: '😌', name: 'Calm and safe', hint: 'Like safe, relaxed, warm', words: ['safe', 'warm', 'relaxed', 'steady', 'relieved', 'understood', 'content', 'accepted'] },
    },
    diaryWordQ: 'Which word is closest to how you feel right now?',
    diaryOwnWord: 'Or write your own word:',
    diaryOwnPlaceholder: 'e.g. left out',
    diaryNext: 'Next ▶',
    diaryFeel: (word) => `Today’s feeling: ${word}`,
    diaryPrompts: [
      'Which moment today felt the worst inside? What were you thinking then?',
      'Did anyone see what happened today? What did you wish they would do?',
      'If you could say one thing to someone from today, what would it be?',
      'Tonight, was there something you wanted to say but didn’t?',
      'Was there a moment today that made you feel a little better? Who was it because of?',
    ],
    diaryTextPlaceholder: 'Just a few lines. You can also leave it blank.',
    diaryDone: 'Done ▶',
    // Share
    shareOpen: '📮 Share with friends',
    shareKicker: 'I played',
    shareWeather: 'The Weather in My Heart',
    shareKicker2: 'Share with friends',
    shareTitle: 'Share your week with friends',
    shareWho: (name) => `I was ${name} for the week before Sports Day.`,
    shareAct: (day, act) => `If I were a classmate in Class 5-3, on ${day} I would: ${act}`,
    shareInvite: 'Play it too 👉',
    shareText: (name) => `I played Class 5-3 Relay and spent the week before Sports Day as ${name}. Play it too:`,
    shareAlt: (name) => `Share image: I played Class 5-3 Relay as ${name}`,
    shareHold: 'You can also long-press the image to save it. What you wrote in your diary isn’t on it.',
    shareBtn: 'Share',
    shareDownload: 'Download image',
    shareCopy: 'Copy link',
    shareCopied: 'Copied! You can paste it to your friends.',
    shareBack: '← Back to the last page',
    diaryWeekTitle: 'Your Diary This Week',
    diaryEmpty: '(No entry this day)',
    // Think again after sharing
    againBtn: 'After sharing, think again',
    againKicker: (n) => `After sharing, think again · ${n} / 3`,
    firstWas: (day, action) => `Your first choice: ${day}, ${action}`,
    firstLabel: 'First time',
    nowLabel: 'After hearing others',
    changedNote: 'It’s okay to change your mind. Hearing other people’s ideas can show us new things we could do.',
    sameNote: 'You chose the same thing again. After hearing others, you’re even surer you can do this.',
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
