// 《五年三班大隊接力》劇本：第一人稱，你是阿哲
//
// 設計原則
// - 欺負你的人和旁觀者怎麼做，是固定劇情；你控制不了別人，現實中也是這樣
// - 你的選擇只改變你的感受、你找誰說，不決定你「該不該」被欺負
// - 勇氣太低時，有些選項會被劃掉：不是不想說，是說不出口
//
// 步驟格式
// { speaker, text, inner?, emo?, bg?, chars?, effect? }   一句台詞；inner 是你心裡真正的想法
// { k: 'day', day, title, bg }                            每天開始的標題卡
// { k: 'choice', prompt, options: [...] }                 你的選擇
//   option: { text, need?, effect?, flag?, then: [步驟...] }
// { k: 'if', flag, then: [步驟...] }                       有某個旗標才會發生
// effect: { courage, witness, kind }                      勇氣變化、旁觀沉默的人數、善意的次數

export const PLAYER = 'azhe';

export const CHARACTERS = {
  azhe:    { name: '你' },
  xiaoyu:  { name: '小雨' },
  aming:   { name: '阿明' },
  zhihao:  { name: '志豪' },
  jiajia:  { name: '佳佳' },
  teacher: { name: '林老師' },
  mom:     { name: '媽媽' },
  class:   { name: '同學們' },
  narrator:{ name: '' },
};

export const START_COURAGE = 70;
// 每天早上睡了一覺，勇氣會回來一點點
export const OVERNIGHT = 5;

const CLASS_CHARS = (you = 'neutral', zh = 'neutral') => [
  { id: 'azhe', x: 52, emo: you },
  { id: 'zhihao', x: 140, emo: zh },
];

export const STORY = [
  // ---------------- 週一 ----------------
  { k: 'day', day: '週一', title: '忘記帶的作業本', bg: 'classroom' },
  { bg: 'classroom', chars: [{ id: 'azhe', x: 52, emo: 'happy' }, { id: 'teacher', x: 140, emo: 'neutral' }],
    speaker: 'narrator', text: '你叫阿哲，五年三班。你最喜歡畫畫，最討厭的是……坐著不動。' },
  { speaker: 'teacher', text: '請大家把數學作業本拿出來。' },
  { speaker: 'narrator', emo: 'surprised', text: '你翻遍了書包。\n昨天明明寫完了，放在桌上……然後就忘了放進書包。' },
  { speaker: 'teacher', emo: 'neutral', text: '阿哲，又忘記了嗎？這個禮拜第二次了喔。' },
  { bg: 'classroom', chars: CLASS_CHARS('sad', 'happy'),
    speaker: 'zhihao', text: '（小聲）過動兒又來了。',
    effect: { courage: -10, witness: 4 } },
  { speaker: 'class', text: '（後面有幾個人笑了出來。）' },
  { speaker: 'narrator', text: '你感覺到大家都在看你。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '跟著笑：「對啊，我就是很笨。」',
      effect: { courage: -5 },
      then: [{ speaker: 'azhe', emo: 'happy', text: '哈哈，對啊，我就是很笨。', inner: '為什麼我要說自己笨？我明明有寫完……' }] },
    { text: '低下頭，假裝在找東西。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你一直盯著書包裡面，直到大家不再看你。', inner: '只要不抬頭，就不會看到他們在笑。' }] },
    { text: '轉頭跟志豪說：「不要這樣叫我。」', need: 55,
      flag: 'stoodUp',
      then: [
        { speaker: 'azhe', emo: 'angry', text: '不要這樣叫我。' },
        { speaker: 'zhihao', emo: 'happy', text: '開玩笑也不行喔？這麼兇幹嘛。' },
        { speaker: 'narrator', emo: 'sad', text: '沒有人幫你說話。', inner: '我說出來了……可是好像什麼都沒有改變。' },
      ] },
  ] },

  // ---------------- 週二 ----------------
  { k: 'day', day: '週二', title: '起跑線', bg: 'track' },
  { bg: 'track', chars: [{ id: 'azhe', x: 52, emo: 'happy' }, { id: 'jiajia', x: 140, emo: 'neutral' }],
    speaker: 'jiajia', text: '下禮拜六就是運動會了！今天練大隊接力，每個人都要跑喔。' },
  { speaker: 'azhe', emo: 'happy', text: '（你站上起跑線。你其實很喜歡跑步，跑步的時候不用坐著不動。）' },
  { speaker: 'narrator', emo: 'surprised', text: '「預備——」\n哨聲還沒響，你的腳就自己衝出去了。' },
  { bg: 'track', chars: CLASS_CHARS('surprised', 'angry'),
    speaker: 'zhihao', text: '又是你！比賽的時候犯規，全班都會被取消資格耶！' },
  { speaker: 'zhihao', text: '老師，可以不要讓他跑嗎？他根本是來搗亂的。',
    effect: { courage: -15, witness: 7 } },
  { speaker: 'class', emo: 'happy', text: '（有人笑了。有人說：「對啊，換人啦。」）' },
  { speaker: 'narrator', emo: 'sad', text: '你看向其他人。\n佳佳低頭看著碼錶，小雨看著地上，阿明假裝在綁鞋帶。',
    inner: '沒有人看我。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '說：「那……我不要跑好了。」',
      effect: { courage: -10 }, flag: 'gaveUp',
      then: [{ speaker: 'azhe', emo: 'sad', text: '那……我不要跑好了。', inner: '我其實好想跑。' }] },
    { text: '走到操場角落坐下。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你一個人坐在操場角落，看著大家繼續練習。', inner: '如果我不在，大家會比較開心吧。' }] },
    { text: '跟老師說：「我會再練習，請讓我跑。」', need: 55,
      effect: { courage: 5 }, flag: 'askedToRun',
      then: [
        { speaker: 'azhe', emo: 'neutral', text: '我……我會再練習，請讓我跑。' },
        { speaker: 'narrator', text: '老師點點頭：「好，我們再試試看。」\n志豪翻了一個白眼。', inner: '心跳得好快。可是我說出來了。' },
      ] },
  ] },

  // ---------------- 週三 ----------------
  { k: 'day', day: '週三', title: '加油海報', bg: 'classroom' },
  { bg: 'classroom', chars: [{ id: 'teacher', x: 96, emo: 'happy' }],
    speaker: 'teacher', text: '今天分組做運動會的加油海報！四個人一組，自己找組員。' },
  { bg: 'classroom', chars: [{ id: 'azhe', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '大家很快就湊成一組一組。你站在原地，不知道要去哪裡。',
    effect: { courage: -10, witness: 6 } },
  { speaker: 'narrator', emo: 'sad', text: '最後，老師把你分到志豪那一組。' },
  { bg: 'classroom', chars: CLASS_CHARS('sad', 'neutral'),
    speaker: 'zhihao', text: '好啦好啦。你不要亂畫就好，在旁邊遞彩色筆。' },
  { speaker: 'narrator', text: '你其實是全班最會畫畫的人。你的筆記本裡畫滿了閃電和賽跑的人。',
    inner: '我可以畫一隻超帥的閃電……' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '默默把彩色筆遞給他們。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你遞了一整節課的彩色筆。', inner: '算了，反正他們也不會想用我的畫。' }] },
    { text: '小聲問：「我可以畫閃電嗎？」', need: 40, effect: { courage: 0 },
      then: [
        { speaker: 'azhe', emo: 'neutral', text: '我……我可以畫閃電嗎？' },
        { speaker: 'zhihao', emo: 'happy', text: '你會畫什麼啦。' },
        { speaker: 'narrator', text: '佳佳看了你的筆記本一眼，停了一下，但什麼都沒說。', inner: '她明明看到了。' },
      ] },
    { text: '下課去找老師，說你被排擠。', need: 70, flag: 'toldTeacher',
      effect: { courage: 5 },
      then: [
        { speaker: 'azhe', emo: 'sad', text: '老師……他們都不讓我畫。' },
        { speaker: 'teacher', emo: 'neutral', text: '謝謝你告訴我。這件事老師會處理，你先不要擔心。' },
      ] },
  ] },

  // ---------------- 週四 ----------------
  { k: 'day', day: '週四', title: '晚餐', bg: 'home' },
  { bg: 'home', chars: [{ id: 'azhe', x: 64, emo: 'neutral' }, { id: 'mom', x: 128, emo: 'happy' }],
    speaker: 'mom', text: '今天在學校怎麼樣？運動會快到了吧？' },
  { speaker: 'narrator', text: '你看著碗裡的飯。',
    inner: '星期一、星期二、星期三……' },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「還好啊。」',
      effect: { courage: -5 },
      then: [
        { speaker: 'azhe', emo: 'happy', text: '還好啊。', inner: '不想讓媽媽擔心。' },
        { speaker: 'mom', emo: 'happy', text: '那就好。多吃一點！' },
      ] },
    { text: '「……我可以不要去運動會嗎？」', need: 25,
      then: [
        { speaker: 'azhe', emo: 'sad', text: '……我可以不要去運動會嗎？' },
        { speaker: 'mom', emo: 'surprised', text: '怎麼了？發生什麼事了嗎？' },
        { speaker: 'azhe', emo: 'sad', text: '沒事啦。', inner: '說出來，媽媽會不會覺得是我的問題？' },
        { speaker: 'mom', emo: 'neutral', text: '如果有什麼事，隨時都可以跟媽媽說，好不好？',
          effect: { courage: 5, kind: 1 } },
      ] },
    { text: '把這幾天發生的事告訴媽媽。', need: 40, flag: 'toldMom',
      then: [
        { speaker: 'azhe', emo: 'cry', text: '媽媽……大家都說我是來搗亂的。他們不想讓我跑。' },
        { speaker: 'mom', emo: 'sad', text: '……謝謝你告訴我。這不是你的錯。' },
        { speaker: 'mom', emo: 'neutral', text: '明天媽媽會跟老師聯絡。你不用一個人面對。',
          effect: { courage: 20, kind: 1 } },
      ] },
  ] },

  // ---------------- 週五 ----------------
  { k: 'day', day: '週五', title: '收接力棒', bg: 'track' },
  { k: 'if', flag: 'toldMom', then: [
    { bg: 'classroom', chars: [{ id: 'teacher', x: 96, emo: 'neutral' }],
      speaker: 'teacher', text: '早上，老師在全班面前說：「大隊接力是全班的事，不會有人被換掉。我們一起想辦法。」' },
    { speaker: 'narrator', text: '下課時，你看到老師把志豪叫到走廊上談話。',
      effect: { courage: 5, kind: 1 } },
  ] },
  { k: 'if', flag: 'toldTeacher', then: [
    { bg: 'classroom', chars: [{ id: 'teacher', x: 96, emo: 'neutral' }],
      speaker: 'teacher', text: '早上，老師說：「做海報的時候，每個人都要有工作。阿哲，你負責畫主圖。」',
      effect: { courage: 5, kind: 1 } },
  ] },
  { bg: 'track', chars: [{ id: 'azhe', x: 52, emo: 'sad' }],
    speaker: 'narrator', text: '放學後，大家都走了。你一個人在操場收接力棒。' },
  { bg: 'track', chars: [{ id: 'azhe', x: 52, emo: 'surprised' }, { id: 'aming', x: 140, emo: 'neutral' }],
    speaker: 'aming', text: '……你還好嗎？' },
  { speaker: 'aming', emo: 'happy', text: '我覺得你起跑真的很快耶。只是太早了一點點。',
    effect: { courage: 25, kind: 1 } },
  { speaker: 'narrator', text: '這是這個禮拜，第一次有同學主動跟你說話。' },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「……謝謝。」',
      effect: { courage: 5 },
      then: [{ speaker: 'azhe', emo: 'happy', text: '……謝謝。', inner: '原來有人看到。' }] },
    { text: '「你也會被他們笑嗎？」', need: 20, flag: 'friend',
      effect: { courage: 10 },
      then: [
        { speaker: 'azhe', emo: 'neutral', text: '你也會被他們笑嗎？' },
        { speaker: 'aming', emo: 'sad', text: '會啊。他們學我講話。所以我知道那種感覺。' },
        { speaker: 'aming', emo: 'happy', text: '明天，我會在終點幫你喊加油。' },
      ] },
    { text: '什麼都沒說，點點頭。',
      then: [{ speaker: 'narrator', emo: 'neutral', text: '阿明也沒再說什麼，陪你把接力棒收完。', inner: '有人陪著，好像沒那麼難過了。' }] },
  ] },
];

// 運動會：勇氣足夠時你站上起跑線；不夠時也還是會跑，只是心情不一樣
// 兩種結局都不是懲罰：被欺負的人怎麼撐過去，都不是他的錯
export const ENDINGS = {
  brave: [
    { k: 'day', day: '週六', title: '運動會', bg: 'sportsday' },
    { bg: 'sportsday', chars: [{ id: 'azhe', x: 52, emo: 'neutral' }, { id: 'aming', x: 140, emo: 'happy' }],
      speaker: 'narrator', text: '你站上起跑線。腿有一點抖。' },
    { speaker: 'narrator', text: '「預備——」\n你在心裡數：等「砰」，再數一。' },
    { speaker: 'narrator', emo: 'happy', text: '「砰！」\n你衝了出去。風從耳朵旁邊呼呼吹過。' },
    { speaker: 'aming', emo: 'happy', text: '阿哲——衝啊！' },
    { speaker: 'narrator', emo: 'happy', text: '你把接力棒交到下一個人手上。沒有犯規。',
      inner: '我做到了。' },
  ],
  heavy: [
    { k: 'day', day: '週六', title: '運動會', bg: 'sportsday' },
    { bg: 'sportsday', chars: [{ id: 'azhe', x: 52, emo: 'sad' }],
      speaker: 'narrator', text: '你站在隊伍最後面。你很想回家。' },
    { speaker: 'narrator', text: '輪到你的時候，你聽到後面有人小聲說：「拜託不要又犯規。」',
      inner: '不要看我。不要看我。' },
    { speaker: 'narrator', emo: 'sad', text: '「砰！」\n你跑完了你的那一棒。很快，可是你一點都不開心。' },
    { bg: 'sportsday', chars: [{ id: 'azhe', x: 52, emo: 'sad' }, { id: 'aming', x: 140, emo: 'neutral' }],
      speaker: 'aming', text: '你跑得很好。真的。',
      inner: '如果這個禮拜，早一點有人這樣跟我說就好了。' },
  ],
};

// 結局後揭露：帶頭的人也可能在害怕
export const ZHIHAO_INNER = '其實……四年級的時候，被大家笑的人是我。\n我發現只要大家在笑別人，就不會有人笑我了。';

export const BRAVE_THRESHOLD = 70;
