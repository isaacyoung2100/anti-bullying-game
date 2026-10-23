// 《五年三班大隊接力》劇本資料
// 每一章：情境台詞 → 全班投票 → 角色反應（AI 或預設）→ 內心話 → 小知識
// 選項的 type 對應旁觀者角色：side（附和）/ silent（沉默旁觀）/ defend（保護）/ help（找方法、求助）

export const CHARACTERS = {
  azhe:    { name: '阿哲', role: '愛畫畫、坐不住的男生' },
  xiaoyu:  { name: '小雨', role: '跑得很快、話不多的女生' },
  aming:   { name: '阿明', role: '數學很好、媽媽來自越南' },
  zhihao:  { name: '志豪', role: '班上很會帶氣氛的人' },
  jiajia:  { name: '佳佳', role: '班長' },
  teacher: { name: '林老師', role: '導師' },
  class:   { name: '同學們', role: '' },
  narrator:{ name: '', role: '' },
};

// 選項類型對班級氛圍與當事人信任的影響
export const TYPE_EFFECT = {
  side:   { mood: -15, trust: -30, label: '跟著起鬨' },
  silent: { mood: -8,  trust: -15, label: '沉默旁觀' },
  defend: { mood: +12, trust: +25, label: '挺身而出' },
  help:   { mood: +10, trust: +20, label: '想辦法、找幫手' },
};

export const PROLOGUE = [
  { bg: 'classroom', chars: [{ id: 'teacher', x: 96, emo: 'happy' }],
    speaker: 'teacher', text: '各位，三週後就是運動會了！今年我們五年三班要參加大隊接力。' },
  { bg: 'classroom', chars: [{ id: 'teacher', x: 96, emo: 'happy' }],
    speaker: 'teacher', text: '大隊接力的規則是：全班每個人都要跑，一個都不能少。' },
  { bg: 'classroom', chars: [{ id: 'zhihao', x: 60, emo: 'happy' }, { id: 'jiajia', x: 130, emo: 'happy' }],
    speaker: 'zhihao', text: '耶！今年我們一定要拿第一！' },
  { bg: 'classroom', chars: [{ id: 'zhihao', x: 60, emo: 'happy' }, { id: 'jiajia', x: 130, emo: 'neutral' }],
    speaker: 'narrator', text: '接下來三週，你們——五年三班的每一個人——會一起做很多決定。\n你們的選擇，會決定運動會那天會發生什麼事。' },
];

export const CHAPTERS = [
  {
    id: 'ch1',
    title: '第一章　起跑線',
    subtitle: '阿哲的故事',
    target: 'azhe',
    scenes: [
      { bg: 'track', chars: [{ id: 'azhe', x: 70, emo: 'happy' }, { id: 'zhihao', x: 120, emo: 'neutral' }],
        speaker: 'narrator', text: '放學後，全班在操場練習交棒。' },
      { bg: 'track', chars: [{ id: 'azhe', x: 70, emo: 'surprised' }, { id: 'zhihao', x: 120, emo: 'neutral' }],
        speaker: 'narrator', text: '「預備——」\n哨聲還沒響，阿哲就衝出去了。' },
      { bg: 'track', chars: [{ id: 'azhe', x: 70, emo: 'sad' }, { id: 'zhihao', x: 120, emo: 'angry' }],
        speaker: 'zhihao', text: '又是阿哲！這已經是第三次了！比賽的時候犯規，我們全班都會被取消資格耶！' },
      { bg: 'track', chars: [{ id: 'azhe', x: 70, emo: 'sad' }, { id: 'zhihao', x: 120, emo: 'angry' }],
        speaker: 'zhihao', text: '老師，可以不要讓他跑嗎？他根本是來搗亂的。' },
      { bg: 'track', chars: [{ id: 'azhe', x: 70, emo: 'sad' }, { id: 'zhihao', x: 120, emo: 'happy' }],
        speaker: 'class', text: '（有幾個人笑了出來。）' },
    ],
    vote: {
      question: '阿哲低著頭站在旁邊。你們會怎麼做？',
      options: [
        { id: 'a', type: 'side',   text: '跟著說：「對啊，換別人跑啦。」' },
        { id: 'b', type: 'silent', text: '不說話，繼續練自己的。' },
        { id: 'c', type: 'defend', text: '走過去跟阿哲說：「沒關係，我陪你練起跑。」' },
        { id: 'd', type: 'help',   text: '提議：「我們一起想辦法，例如等『砰』之後再數一下才跑。」' },
      ],
    },
    // AI 無法使用時的預設反應
    reactions: {
      side:   [{ speaker: 'azhe', emo: 'sad', text: '……喔。那我不要跑好了。' },
               { speaker: 'zhihao', emo: 'happy', text: '早該這樣了嘛。' }],
      silent: [{ speaker: 'azhe', emo: 'sad', text: '（阿哲看了看大家，沒有人看他。他默默走到操場角落坐下。）' }],
      defend: [{ speaker: 'azhe', emo: 'surprised', text: '真、真的嗎？你不覺得我很煩嗎？' },
               { speaker: 'azhe', emo: 'happy', text: '那……我們再練一次！' }],
      help:   [{ speaker: 'jiajia', emo: 'happy', text: '好主意！我們幫阿哲數拍子，大家一起喊「砰、一」再跑！' },
               { speaker: 'azhe', emo: 'happy', text: '這樣我好像比較不會衝出去了！' }],
    },
    inner: {
      speaker: 'azhe',
      text: '我真的有聽到「預備」。可是我的腳就是會自己衝出去，好像有一個煞車壞掉了。\n我不是故意的。我其實……很想跟大家一起跑。',
    },
    info: '有些人的大腦比較難「踩煞車」，容易衝動、坐不住、忘東忘西，例如有注意力不足過動特質的人。\n他們不是故意的，也不是不努力。給一點提醒和方法，常常就能做得很好。',
  },
  {
    id: 'ch2',
    title: '第二章　班服',
    subtitle: '小雨的故事',
    target: 'xiaoyu',
    scenes: [
      { bg: 'classroom', chars: [{ id: 'jiajia', x: 96, emo: 'happy' }],
        speaker: 'jiajia', text: '大家注意！運動會要穿一樣的班服，一件 350 元，這禮拜五前要交錢喔！' },
      { bg: 'classroom', chars: [{ id: 'xiaoyu', x: 70, emo: 'sad' }, { id: 'jiajia', x: 120, emo: 'neutral' }],
        speaker: 'xiaoyu', text: '那個……我可以不要買嗎？' },
      { bg: 'classroom', chars: [{ id: 'xiaoyu', x: 70, emo: 'sad' }, { id: 'zhihao', x: 120, emo: 'happy' }],
        speaker: 'zhihao', text: '不買？那你要穿那件洗到變色的外套跑喔？哈哈，好窮酸喔。' },
      { bg: 'classroom', chars: [{ id: 'xiaoyu', x: 70, emo: 'cry' }, { id: 'zhihao', x: 120, emo: 'happy' }],
        speaker: 'class', text: '（有人在後面小聲說：「她家好像很窮。」）' },
    ],
    vote: {
      question: '小雨的臉漲紅了。你們會怎麼做？',
      options: [
        { id: 'a', type: 'side',   text: '跟著笑：「哈哈，真的有點舊耶。」' },
        { id: 'b', type: 'silent', text: '假裝沒聽到，低頭寫自己的東西。' },
        { id: 'c', type: 'defend', text: '跟志豪說：「這樣說很過分，每個人家裡狀況不一樣。」' },
        { id: 'd', type: 'help',   text: '提議：「不一定要買班服，我們可以一起做一樣的號碼布！」' },
      ],
    },
    reactions: {
      side:   [{ speaker: 'xiaoyu', emo: 'cry', text: '（小雨把外套拉鍊拉到最上面，整節課都沒有再抬頭。）' }],
      silent: [{ speaker: 'xiaoyu', emo: 'sad', text: '……算了，當我沒說。' }],
      defend: [{ speaker: 'zhihao', emo: 'surprised', text: '……我、我只是開玩笑的啦。' },
               { speaker: 'xiaoyu', emo: 'neutral', text: '（小雨偷偷看了你們一眼，小聲說：「謝謝。」）' }],
      help:   [{ speaker: 'azhe', emo: 'happy', text: '號碼布我來畫！我可以畫一隻超帥的閃電！' },
               { speaker: 'xiaoyu', emo: 'happy', text: '那……我可以幫忙剪布。' }],
    },
    inner: {
      speaker: 'xiaoyu',
      text: '媽媽一個人上班，還要付弟弟的安親班。上次繳畢業旅行的錢，我看到她在廚房算了好久。\n我不想讓她為難。我也不想讓大家知道。',
    },
    info: '每個家庭的樣子都不一樣：有單親家庭、隔代教養，也有經濟比較辛苦的家庭。\n家裡的狀況不是孩子能選擇的，更不應該成為被嘲笑的理由。',
  },
  {
    id: 'ch3',
    title: '第三章　加油口號',
    subtitle: '阿明的故事',
    target: 'aming',
    scenes: [
      { bg: 'classroom', chars: [{ id: 'teacher', x: 96, emo: 'happy' }],
        speaker: 'teacher', text: '我們來練加油口號！每個人輪流帶喊一句。下一個，阿明！' },
      { bg: 'classroom', chars: [{ id: 'aming', x: 96, emo: 'neutral' }],
        speaker: 'aming', text: '五、五年三班——衝衝衝！' },
      { bg: 'classroom', chars: [{ id: 'aming', x: 70, emo: 'surprised' }, { id: 'zhihao', x: 120, emo: 'happy' }],
        speaker: 'zhihao', text: '「衝衝衝～」哈哈，你講話怎麼怪腔怪調的？' },
      { bg: 'classroom', chars: [{ id: 'aming', x: 70, emo: 'sad' }, { id: 'zhihao', x: 120, emo: 'happy' }],
        speaker: 'zhihao', text: '以後就叫你「怪腔阿明」好了！大家說好不好？' },
    ],
    vote: {
      question: '有人開始跟著喊「怪腔阿明」。你們會怎麼做？',
      options: [
        { id: 'a', type: 'side',   text: '跟著喊：「怪腔阿明！怪腔阿明！」' },
        { id: 'b', type: 'silent', text: '覺得不太好，但不想被說掃興，所以不出聲。' },
        { id: 'c', type: 'defend', text: '說：「不要這樣叫他，他有自己的名字。」' },
        { id: 'd', type: 'help',   text: '問阿明：「你會說越南話嗎？可以教我們用越南話喊加油嗎？」' },
      ],
    },
    reactions: {
      side:   [{ speaker: 'aming', emo: 'cry', text: '（阿明之後再也沒有舉手帶喊過口號。）' }],
      silent: [{ speaker: 'aming', emo: 'sad', text: '（阿明笑了一下，好像沒事。但他之後講話都變得很小聲。）' }],
      defend: [{ speaker: 'zhihao', emo: 'neutral', text: '好啦好啦，不叫就不叫。' },
               { speaker: 'aming', emo: 'happy', text: '（阿明鬆了一口氣。）' }],
      help:   [{ speaker: 'aming', emo: 'surprised', text: '越南話的加油是「Cố lên」！' },
               { speaker: 'class', emo: 'happy', text: '「Cố lên！五年三班！」（全班一起喊，大家都笑了。）' }],
    },
    inner: {
      speaker: 'aming',
      text: '媽媽說越南話的時候，聲音好溫柔。可是在學校，我好怕開口。\n只要我一說話，大家就會想起來：我跟他們不一樣。',
    },
    info: '台灣有很多新住民家庭，爸爸或媽媽來自不同的國家。\n會說兩種語言是一種能力，不是奇怪的事。取綽號、學別人的口音，對被取笑的人來說，一點都不好笑。',
  },
];

// 志豪的內心話：在結局前揭露，說明帶頭的人也有自己的害怕
export const ZHIHAO_INNER = {
  speaker: 'zhihao',
  text: '其實……四年級的時候，被大家笑的人是我。\n我發現只要大家在笑別人，就不會有人笑我了。',
};

// 結局：依班級氛圍與每個角色的信任值決定
export const ENDINGS = {
  good: {
    title: '運動會當天',
    lines: [
      { bg: 'sportsday', speaker: 'narrator', text: '運動會當天，五年三班全員到齊。' },
      { bg: 'sportsday', speaker: 'narrator', text: '阿哲在「砰」之後才起跑，小雨一口氣超過了兩個人，阿明帶著全班用越南話喊：「Cố lên！」' },
      { bg: 'sportsday', speaker: 'teacher', text: '不管名次如何，你們今天沒有丟下任何一個人。這是我看過最棒的一場接力。' },
    ],
  },
  mixed: {
    title: '運動會當天',
    lines: [
      { bg: 'sportsday', speaker: 'narrator', text: '運動會當天，五年三班跑完了大隊接力。' },
      { bg: 'sportsday', speaker: 'narrator', text: '可是有人一直站在隊伍最後面，一句話都沒說。' },
      { bg: 'sportsday', speaker: 'teacher', text: '我們跑完了。可是，我們真的是「全班一起」嗎？' },
    ],
  },
  absent: {
    title: '運動會當天',
    // {name} 會換成信任值最低的角色
    lines: [
      { bg: 'sportsday', speaker: 'narrator', text: '運動會當天，點名的時候——' },
      { bg: 'sportsday', speaker: 'teacher', text: '{name}？{name}有來嗎？' },
      { bg: 'sportsday', speaker: 'narrator', text: '{name}沒有來。\n少了一個人，五年三班不能參加大隊接力了。' },
      { bg: 'sportsday', speaker: 'narrator', text: '如果時間可以倒流，你們會做不一樣的選擇嗎？' },
    ],
  },
};

export const FALLBACK_DEBRIEF = [
  '在這三個故事裡，哪一個時刻你最想做點什麼，但是沒有做？為什麼？',
  '志豪為什麼會帶頭笑別人？知道他的內心話之後，你對他的看法有改變嗎？',
  '如果明天在班上看到類似的事，你可以做的一件「小事」是什麼？',
];
