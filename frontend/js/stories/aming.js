// 阿明的故事：新住民二代，媽媽來自越南，被學口音、取綽號

const WITH_ZHIHAO = (you = 'neutral', zh = 'neutral') => [
  { id: 'aming', x: 52, emo: you },
  { id: 'zhihao', x: 140, emo: zh },
];

const STORY = [
  // ---------------- 週一 ----------------
  { k: 'day', day: '週一', title: '加油口號', bg: 'classroom' },
  { bg: 'classroom', chars: [{ id: 'aming', x: 52, emo: 'happy' }, { id: 'teacher', x: 140, emo: 'happy' }],
    speaker: 'narrator', text: '你叫阿明，五年三班。你數學很好。\n媽媽來自越南，在家裡會跟你說越南話。' },
  { speaker: 'teacher', text: '我們來練運動會的加油口號！每個人輪流帶喊一句。下一個，阿明！' },
  { speaker: 'aming', emo: 'neutral', text: '五、五年三班——衝衝衝！' },
  { bg: 'classroom', chars: WITH_ZHIHAO('surprised', 'happy'),
    speaker: 'zhihao', text: '「衝衝衝～」哈哈，你講話怎麼怪腔怪調的？' },
  { speaker: 'zhihao', text: '以後就叫你「怪腔阿明」好了！大家說好不好？',
    effect: { courage: -10, witness: 8 } },
  { speaker: 'class', text: '（有人開始跟著喊：「怪腔阿明！怪腔阿明！」）' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '跟著大家一起笑。',
      effect: { courage: -5 },
      then: [{ speaker: 'aming', emo: 'happy', text: '哈、哈哈……', inner: '我在笑。可是一點都不好笑。' }] },
    { text: '坐下，決定以後再也不舉手。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你坐下來，把頭低低的。', inner: '只要不開口，就不會被笑。' }] },
    { text: '說：「我叫阿明，不叫怪腔。」', need: 55, flag: 'stoodUp',
      then: [
        { speaker: 'aming', emo: 'angry', text: '我叫阿明，不叫怪腔。' },
        { speaker: 'zhihao', emo: 'happy', text: '「不叫怪腔～」哈哈哈，你聽，又來了！' },
        { speaker: 'narrator', emo: 'sad', text: '笑聲更大了。', inner: '我說出來了……可是好像只會更糟。' },
      ] },
  ] },

  // ---------------- 週二 ----------------
  { k: 'day', day: '週二', title: '便當', bg: 'classroom' },
  { bg: 'classroom', chars: [{ id: 'aming', x: 52, emo: 'happy' }],
    speaker: 'narrator', text: '午餐時間。今天媽媽幫你做了越南春捲，還放了一小盒魚露。是你最喜歡的。' },
  { bg: 'classroom', chars: WITH_ZHIHAO('surprised', 'angry'),
    speaker: 'zhihao', text: '噁，什麼東西好臭喔！是誰的便當？' },
  { speaker: 'narrator', emo: 'sad', text: '有兩個同學把桌子往旁邊拉開。\n有人捏著鼻子看你。',
    effect: { courage: -15, witness: 6 } },
  { speaker: 'narrator', text: '小雨坐在你旁邊，看了你的便當一眼，又低下頭吃自己的。',
    inner: '沒有人說話。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '把便當蓋起來，不吃了。',
      effect: { courage: -10 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你把便當蓋起來，塞回書包。那天下午，你肚子一直在叫。', inner: '對不起，媽媽。' }] },
    { text: '說：「這是我在路邊買的，不是我家的。」',
      effect: { courage: -5 },
      then: [{ speaker: 'aming', emo: 'neutral', text: '這、這是我在路邊買的啦，不是我家的。', inner: '我為什麼要說謊？這是媽媽一大早起來做的。' }] },
    { text: '說：「這是我媽媽做的春捲，很好吃。」', need: 55, flag: 'proud',
      effect: { courage: 5 },
      then: [
        { speaker: 'aming', emo: 'neutral', text: '這是我媽媽做的春捲，很好吃。' },
        { speaker: 'zhihao', emo: 'happy', text: '好吃？聞起來像臭掉的東西。' },
        { speaker: 'narrator', text: '你還是把春捲吃完了。', inner: '媽媽做的，就是很好吃。' },
      ] },
  ] },

  // ---------------- 週三 ----------------
  { k: 'day', day: '週三', title: '我的家鄉', bg: 'classroom' },
  { bg: 'classroom', chars: [{ id: 'teacher', x: 96, emo: 'happy' }],
    speaker: 'teacher', text: '社會課的報告題目是「我的家鄉」。大家可以介紹爸爸媽媽長大的地方喔。' },
  { bg: 'classroom', chars: WITH_ZHIHAO('surprised', 'happy'),
    speaker: 'zhihao', text: '阿明的家鄉在越南啦！他媽媽是外籍新娘！',
    effect: { courage: -10, witness: 6 } },
  { speaker: 'class', text: '（有幾個人笑了。老師說：「志豪，不可以這樣說。」可是笑聲已經傳開了。）' },
  { speaker: 'narrator', emo: 'sad', text: '你想起媽媽說過，她長大的地方在芽莊，那裡的海是全世界最藍的。' },
  { k: 'choice', prompt: '輪到你報告了。你會怎麼說？', options: [
    { text: '「我媽媽是台灣人。我家鄉就在這裡。」',
      effect: { courage: -5 },
      then: [{ speaker: 'aming', emo: 'neutral', text: '我媽媽是台灣人。我的家鄉就在這裡。', inner: '如果媽媽聽到我這樣說，會不會很難過？' }] },
    { text: '隨便講幾句，趕快坐下。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你講了不到一分鐘，就回到座位上。', inner: '趕快結束就好。' }] },
    { text: '介紹媽媽的家鄉：芽莊的海。', need: 40,
      then: [
        { speaker: 'aming', emo: 'neutral', text: '我媽媽來自越南的芽莊。那裡的海是全世界最藍的，她小時候每天都去游泳。' },
        { speaker: 'narrator', text: '有兩、三個同學聽得很認真。志豪在後面打了一個大哈欠。', inner: '有人在聽。' },
      ] },
  ] },

  // ---------------- 週四 ----------------
  { k: 'day', day: '週四', title: '晚餐', bg: 'home' },
  { bg: 'home', chars: [{ id: 'aming', x: 64, emo: 'neutral' }, { id: 'momM', x: 128, emo: 'happy' }],
    speaker: 'momM', text: 'Ăn cơm đi！吃飯囉！禮拜六運動會，媽媽也會去幫你們加油喔！' },
  { speaker: 'narrator', text: '你想到媽媽在觀眾席大聲喊加油的樣子。\n想到大家會聽到她的口音。',
    inner: '怪腔阿明。外籍新娘。' },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「媽媽……運動會你可以不要來嗎？」',
      effect: { courage: -5 },
      then: [
        { speaker: 'aming', emo: 'sad', text: '媽媽……運動會你可以不要來嗎？' },
        { speaker: 'momM', emo: 'sad', text: '……好。媽媽不去。' },
        { speaker: 'narrator', text: '媽媽低頭吃飯，沒有再說話。', inner: '我不是討厭媽媽。我是怕大家笑她。' },
      ] },
    { text: '「嗯。學校很好。」',
      effect: { courage: -5 },
      then: [
        { speaker: 'aming', emo: 'happy', text: '嗯。學校很好。', inner: '不能讓媽媽知道，大家在笑她的口音。' },
        { speaker: 'momM', emo: 'happy', text: '好！多吃一點，才跑得快！' },
      ] },
    { text: '告訴媽媽：大家在學你講話，還笑你的便當。', need: 40, flag: 'toldMom',
      then: [
        { speaker: 'aming', emo: 'cry', text: '媽媽……大家都在學我講話。他們說你做的春捲很臭。' },
        { speaker: 'momM', emo: 'sad', text: '……謝謝你告訴媽媽。這不是你的錯，也不是媽媽的錯。' },
        { speaker: 'momM', emo: 'neutral', text: '會說兩種話，是你的超能力喔。明天媽媽會去找老師談。',
          effect: { courage: 20, kind: 1 } },
      ] },
  ] },

  // ---------------- 週五 ----------------
  { k: 'day', day: '週五', title: '收接力棒', bg: 'track' },
  { k: 'if', flag: 'toldMom', then: [
    { bg: 'classroom', chars: [{ id: 'teacher', x: 96, emo: 'neutral' }],
      speaker: 'teacher', text: '早上，老師說：「從今天開始，班上不可以再叫任何人的綽號。每個人都有自己的名字。」' },
    { speaker: 'teacher', text: '「還有，阿明會說越南話。運動會那天，我們請他教大家用越南話喊加油，好不好？」',
      effect: { courage: 5, kind: 1 } },
  ] },
  { bg: 'track', chars: [{ id: 'aming', x: 52, emo: 'sad' }],
    speaker: 'narrator', text: '放學後，大家都走了。你一個人在操場收接力棒。' },
  { bg: 'track', chars: [{ id: 'aming', x: 52, emo: 'surprised' }, { id: 'xiaoyu', x: 140, emo: 'neutral' }],
    speaker: 'xiaoyu', text: '……阿明。你那天喊口號，其實喊得很大聲。' },
  { speaker: 'xiaoyu', emo: 'happy', text: '我覺得很好聽。',
    effect: { courage: 25, kind: 1 } },
  { speaker: 'narrator', text: '這是這個禮拜，第一次有同學主動跟你說話。' },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「……謝謝。」',
      effect: { courage: 5 },
      then: [{ speaker: 'aming', emo: 'happy', text: '……謝謝。', inner: '原來有人覺得好聽。' }] },
    { text: '「你也會被他們笑嗎？」', need: 20, flag: 'friend',
      effect: { courage: 10 },
      then: [
        { speaker: 'aming', emo: 'neutral', text: '你也會被他們笑嗎？' },
        { speaker: 'xiaoyu', emo: 'sad', text: '會啊。他們笑我的外套。所以我知道那種感覺。' },
        { speaker: 'xiaoyu', emo: 'happy', text: '明天，可以教我用越南話說加油嗎？' },
      ] },
    { text: '什麼都沒說，點點頭。',
      then: [{ speaker: 'narrator', emo: 'neutral', text: '小雨也沒再說什麼，陪你把接力棒收完。', inner: '有人陪著，好像沒那麼難過了。' }] },
  ] },
];

const ENDINGS = {
  brave: [
    { k: 'day', day: '週六', title: '運動會', bg: 'sportsday' },
    { bg: 'sportsday', chars: [{ id: 'aming', x: 52, emo: 'neutral' }, { id: 'momM', x: 140, emo: 'happy' }],
      speaker: 'narrator', text: '比賽前，全班圍成一圈。你深吸一口氣。' },
    { speaker: 'aming', emo: 'happy', text: 'Cố lên！五年三班！' },
    { speaker: 'class', text: '「Cố lên！五年三班！」\n（全班跟著你喊。發音都怪怪的，大家都笑了。）' },
    { speaker: 'momM', emo: 'happy', text: 'Cố lên！阿明——！',
      inner: '那是我媽媽的聲音。全場最大聲的那個。' },
  ],
  heavy: [
    { k: 'day', day: '週六', title: '運動會', bg: 'sportsday' },
    { bg: 'sportsday', chars: [{ id: 'aming', x: 52, emo: 'sad' }],
      speaker: 'narrator', text: '帶喊加油口號的時候，你躲在隊伍最後面，嘴巴動了動，沒有發出聲音。' },
    { speaker: 'narrator', text: '你看向觀眾席。很多爸爸媽媽在揮手。',
      inner: '媽媽有沒有來？我希望她來嗎？' },
    { speaker: 'narrator', emo: 'sad', text: '「砰！」\n你跑完了你的那一棒。' },
    { bg: 'sportsday', chars: [{ id: 'aming', x: 52, emo: 'sad' }, { id: 'xiaoyu', x: 140, emo: 'neutral' }],
      speaker: 'xiaoyu', text: '你跑得很好。真的。',
      inner: '如果這個禮拜，早一點有人這樣跟我說就好了。' },
  ],
};

export default {
  id: 'aming',
  name: '阿明',
  blurb: '數學很好。媽媽來自越南，會說兩種語言。',
  story: STORY,
  endings: ENDINGS,
};
