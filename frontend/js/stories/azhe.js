// 阿哲的故事：愛畫畫、坐不住，被叫「過動兒」
//
// 劃掉的選項要寫 fear：說不出口時心裡具體在怕什麼
// 週五老師一定會介入（老師自己察覺），不取決於你有沒有說；說了，會多一份家人的支持

const CLASS_CHARS = (you = 'neutral', zh = 'neutral') => [
  { id: 'azhe', x: 52, emo: you },
  { id: 'zhihao', x: 140, emo: zh },
];

const STORY = [
  // ---------------- 週一 ----------------
  { k: 'day', day: '週一', title: '忘記帶的作業本', bg: 'classroom' },
  { bg: 'classroom', chars: [{ id: 'azhe', x: 52, emo: 'happy' }, { id: 'teacher', x: 140, emo: 'neutral' }],
    speaker: 'narrator', text: '你叫阿哲，五年三班。你最喜歡畫畫，最討厭的是……坐著不動。' },
  { speaker: 'teacher', text: '請大家把數學作業本拿出來。' },
  { speaker: 'narrator', emo: 'surprised', text: '你翻遍了書包。\n昨天明明寫完了，放在桌上……然後就忘了放進書包。' },
  { speaker: 'teacher', emo: 'neutral', text: '阿哲，沒關係，下課拿聯絡簿來找老師，我們一起想辦法記得帶。' },
  { bg: 'classroom', chars: CLASS_CHARS('sad', 'happy'),
    speaker: 'zhihao', text: '（小聲）過動兒又來了。',
    effect: { courage: -10, witness: 4 } },
  { bg: 'classroom', chars: [{ id: 'azhe', x: 52, emo: 'sad' }, { id: 'teacher', x: 140, emo: 'angry' }],
    speaker: 'teacher', text: '志豪，用這種話說同學是不對的。上課專心。' },
  { speaker: 'class', text: '（教室安靜下來。可是後面還是有人在偷笑。）' },
  { speaker: 'narrator', text: '你感覺到大家都在看你。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '跟著笑：「對啊，我就是很笨。」',
      effect: { courage: -5 },
      then: [{ speaker: 'azhe', emo: 'happy', text: '哈哈，對啊，我就是很笨。', inner: '我只是希望大家快點不要看我……可是為什麼心裡這麼酸？' }] },
    { text: '低下頭，假裝在找東西。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你一直盯著書包裡面，直到大家不再看你。', inner: '只要不抬頭，就不會看到他們在笑。' }] },
    { text: '下課後跟志豪說：「不要這樣叫我。」', need: 55, flag: 'stoodUp',
      fear: '如果我說了，他們會不會笑得更大聲？',
      then: [
        { speaker: 'azhe', emo: 'angry', text: '不要那樣叫我。' },
        { speaker: 'zhihao', emo: 'happy', text: '開玩笑而已啦，幹嘛那麼兇。' },
        { speaker: 'narrator', emo: 'sad', text: '他聳聳肩走開了。', inner: '我說出來了。就算他沒有道歉，我也說出來了。' },
      ] },
  ] },

  // ---------------- 週二 ----------------
  { k: 'day', day: '週二', title: '起跑線', bg: 'track' },
  { bg: 'track', chars: [{ id: 'azhe', x: 52, emo: 'happy' }, { id: 'jiajia', x: 140, emo: 'neutral' }],
    speaker: 'jiajia', text: '這禮拜六就是運動會了！今天練大隊接力，每個人都要跑喔。' },
  { speaker: 'azhe', emo: 'happy', text: '（你站上起跑線。你其實很喜歡跑步，跑步的時候不用坐著不動。）' },
  { speaker: 'narrator', emo: 'surprised', text: '「預備——」\n哨聲還沒響，你的腳就自己衝出去了。' },
  { bg: 'track', chars: CLASS_CHARS('surprised', 'angry'),
    speaker: 'zhihao', text: '吼，又要重來！每次都是你，很熱耶！' },
  { speaker: 'teacher', text: '練習本來就是要抓起跑的節奏。大家各就各位，再一次。' },
  { speaker: 'zhihao', text: '（小聲）跟他同一隊真的很倒楣。',
    effect: { courage: -15, witness: 7 } },
  { speaker: 'class', emo: 'sad', text: '（有人笑了。有人小聲說：「真的。」）' },
  { speaker: 'narrator', emo: 'sad', text: '你看向其他人。\n佳佳低頭看著碼錶，小雨看著地上，阿明假裝在綁鞋帶。',
    inner: '沒有人看我。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '說：「那……我不要跑好了。」',
      effect: { courage: -10 }, flag: 'gaveUp',
      then: [{ speaker: 'azhe', emo: 'sad', text: '那……我不要跑好了。', inner: '我其實好想跑。' }] },
    { text: '走到操場角落坐下。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你一個人坐在操場角落，看著大家繼續練習。', inner: '如果我不在，大家會比較開心吧。' }] },
    { text: '跟老師說：「我想再練一次起跑。」', need: 35, flag: 'askedToRun',
      fear: '老師會不會也覺得我很麻煩？',
      effect: { courage: 5 },
      then: [
        { speaker: 'azhe', emo: 'neutral', text: '老師……我想再練一次起跑。' },
        { speaker: 'teacher', emo: 'happy', text: '好啊！你先聽「砰」，在心裡數一，再出發。' },
        { speaker: 'narrator', text: '這一次，你沒有犯規。', inner: '心跳得好快。可是我說出來了。' },
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
    { text: '小聲問：「我可以畫閃電嗎？」', need: 30,
      fear: '如果他們說不要，我會更丟臉。',
      then: [
        { speaker: 'azhe', emo: 'neutral', text: '我……我可以畫閃電嗎？' },
        { speaker: 'zhihao', emo: 'happy', text: '你喔？不要啦，畫壞了怎麼辦。' },
        { speaker: 'narrator', text: '佳佳看了你的筆記本一眼，停了一下，但什麼都沒說。', inner: '她明明看到了。' },
      ] },
    { text: '下課去找老師，說你被排擠。', need: 25, flag: 'toldTeacher',
      fear: '如果被他們知道我去找老師，會不會說我愛告狀？',
      effect: { courage: 5 },
      then: [
        { speaker: 'azhe', emo: 'sad', text: '老師……他們都不讓我畫。' },
        { speaker: 'teacher', emo: 'neutral', text: '謝謝你來告訴老師。你不用自己扛，老師會處理，也不會讓他們知道是你說的。' },
      ] },
  ] },
  { bg: 'classroom', chars: [{ id: 'azhe', x: 52, emo: 'surprised' }],
    speaker: 'narrator', text: '下課前，坐你隔壁組的同學偷偷把一支金色的筆推到你桌上。' },
  { speaker: 'class', text: '（小聲）給你。我看過你畫的閃電，超帥的。',
    effect: { courage: 5, kind: 1 } },

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
    { text: '「……我可以不要去運動會嗎？」', need: 20,
      fear: '媽媽會不會覺得我在找藉口？',
      then: [
        { speaker: 'azhe', emo: 'sad', text: '……我可以不要去運動會嗎？' },
        { speaker: 'mom', emo: 'surprised', text: '怎麼了？發生什麼事了嗎？' },
        { speaker: 'azhe', emo: 'sad', text: '沒事啦。', inner: '說出來，媽媽會不會覺得是我的問題？' },
        { speaker: 'mom', emo: 'neutral', text: '如果有什麼事，隨時都可以跟媽媽說，好不好？',
          effect: { courage: 5, kind: 1 } },
      ] },
    { text: '把這幾天發生的事告訴媽媽。', need: 30, flag: 'toldMom',
      fear: '說出來，媽媽會不會覺得是我的問題？',
      then: [
        { speaker: 'azhe', emo: 'cry', text: '媽媽……大家都說跟我同一隊很倒楣。他們不讓我畫畫。' },
        { speaker: 'mom', emo: 'sad', text: '……謝謝你告訴我。這不是你的錯。' },
        { speaker: 'mom', emo: 'neutral', text: '明天媽媽會跟老師聯絡。你不用一個人面對。',
          effect: { courage: 15, kind: 1 } },
      ] },
  ] },

  // ---------------- 週五 ----------------
  { k: 'day', day: '週五', title: '收接力棒', bg: 'classroom' },
  { bg: 'classroom', chars: [{ id: 'azhe', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'neutral' }],
    speaker: 'narrator', text: '早自習的時候，林老師把你叫到走廊上。' },
  { speaker: 'teacher', text: '阿哲，老師這幾天有注意到，練跑和分組的時候，你好像很不開心。' },
  { k: 'if', flag: 'toldMom', then: [
    { speaker: 'teacher', text: '媽媽昨天也打電話給老師了。謝謝你願意告訴媽媽。' },
  ] },
  { k: 'if', flag: 'toldTeacher', then: [
    { speaker: 'teacher', text: '也謝謝你前天來找老師。' },
  ] },
  { speaker: 'teacher', emo: 'neutral', text: '這不是你的錯。老師會處理，也不會讓大家知道是你說的。',
    effect: { courage: 10, kind: 1 } },
  { speaker: 'narrator', text: '第一節課，老師沒有點任何人的名字，只對全班說：\n「大隊接力是全班一起跑，沒有人會被換掉。拿別人的毛病取笑人，就是霸凌。」' },
  { k: 'if', flag: 'toldMom', then: [
    { speaker: 'narrator', emo: 'happy', text: '你想起昨天晚上，媽媽抱著你的樣子。',
      effect: { courage: 5 } },
  ] },
  { bg: 'track', chars: [{ id: 'azhe', x: 52, emo: 'sad' }],
    speaker: 'narrator', text: '放學後，大家都走了。你一個人在操場收接力棒。' },
  { bg: 'track', chars: [{ id: 'azhe', x: 52, emo: 'surprised' }, { id: 'aming', x: 140, emo: 'neutral' }],
    speaker: 'aming', text: '……你還好嗎？' },
  { speaker: 'aming', emo: 'happy', text: '我覺得你起跑真的很快耶。只是太早了一點點。',
    effect: { courage: 20, kind: 1 } },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「……謝謝。」',
      effect: { courage: 5 },
      then: [{ speaker: 'azhe', emo: 'happy', text: '……謝謝。', inner: '原來有人看到。' }] },
    { text: '「你也會被他們笑嗎？」', need: 20, flag: 'friend',
      fear: '問了，他會不會也不想理我？',
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

// 運動會的兩種結局都不是懲罰：被欺負的人心裡還很重，從來都不是他的錯
// 「慢慢來」結局一定要有希望：有大人和朋友在，下禮拜還有人可以聊
const ENDINGS = {
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
      speaker: 'narrator', text: '你站在隊伍後面，心跳得很快。' },
    { speaker: 'narrator', text: '後面有人小聲說：「拜託不要又犯規。」',
      inner: '不要看我。不要看我。' },
    { speaker: 'narrator', emo: 'neutral', text: '「砰！」\n你等了一下才出發，把你的那一棒跑完了。' },
    { bg: 'sportsday', chars: [{ id: 'azhe', x: 52, emo: 'neutral' }, { id: 'aming', x: 140, emo: 'happy' }],
      speaker: 'aming', text: '你跑得很好。真的。' },
    { bg: 'sportsday', chars: [{ id: 'azhe', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'happy' }],
      speaker: 'teacher', text: '阿哲，下禮拜一午休，要不要來找老師聊聊？可以帶你的畫冊來。',
      inner: '心裡還是很重。可是好像……沒有那麼孤單了。' },
  ],
};

export default {
  id: 'azhe',
  name: '阿哲',
  blurb: '愛畫畫，坐不住。常常忘東忘西。',
  story: STORY,
  endings: ENDINGS,
};
