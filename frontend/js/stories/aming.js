// 阿明的故事：新住民二代，媽媽來自越南。他在台灣長大，國語沒有口音；
// 被嘲笑的是他不小心說出口的越南話，以及媽媽的口音和家裡的食物
//
// 描寫原則：老師在場時一定制止歧視用語；不使用「外籍新娘」等歧視詞
// 不把阿明當成多元文化的展示品：要不要教大家越南話，由他自己決定

const WITH_ZHIHAO = (you = 'neutral', zh = 'neutral') => [
  { id: 'aming', x: 52, emo: you },
  { id: 'zhihao', x: 140, emo: zh },
];

const STORY = [
  // ---------------- 週一 ----------------
  { k: 'day', day: '週一', title: '加油口號', bg: 'classroom',
    recap: '阿明帶喊口號時，不小心說出越南話「Cố lên」（加油）。志豪叫他「外星阿明」，下課後走廊上還有人這樣叫。' },
  { bg: 'classroom', chars: [{ id: 'aming', x: 52, emo: 'happy' }, { id: 'teacher', x: 140, emo: 'happy' }],
    speaker: 'narrator', text: '你叫阿明，五年三班。你數學很好。\n媽媽來自越南，在家裡你們會說越南話。每次你考完試，媽媽都會說「Cố lên」，意思是「加油」。' },
  { speaker: 'teacher', text: '我們來練運動會的加油口號！每個人輪流帶喊一句。下一個，阿明！' },
  { speaker: 'aming', emo: 'neutral', text: '五年三班——Cố lên！' },
  { speaker: 'narrator', emo: 'surprised', text: '你一喊完就愣住了。太習慣了，越南話就這樣跑出來了。' },
  { bg: 'classroom', chars: WITH_ZHIHAO('surprised', 'happy'),
    speaker: 'zhihao', text: '「勾雷」？哈哈哈，那是什麼外星話啦！以後就叫你「外星阿明」！',
    effect: { courage: -10, witness: 8 } },
  { bg: 'classroom', chars: [{ id: 'aming', x: 52, emo: 'sad' }, { id: 'teacher', x: 140, emo: 'angry' }],
    speaker: 'teacher', text: '志豪，取綽號是不尊重人。阿明喊得很有精神，大家再一次！' },
  { speaker: 'narrator', text: '教室安靜了。\n可是下課的時候，你聽到走廊上有人小聲說：「外星阿明。」然後一陣笑聲。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '跟著大家一起笑。',
      effect: { courage: -5 },
      then: [{ speaker: 'aming', emo: 'happy', text: '哈、哈哈……', inner: '我在笑。可是一點都不好笑。' }] },
    { text: '回到座位，決定以後再也不舉手。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你坐下來，把頭低低的。', inner: '只要不開口，就不會被笑。' }] },
    { text: '走過去說：「我叫阿明，不是外星人。」', need: 55, flag: 'stoodUp',
      fear: '如果我開口，他們又會笑我講越南話。',
      then: [
        { speaker: 'aming', emo: 'angry', text: '我叫阿明，不是外星人。' },
        { speaker: 'zhihao', emo: 'happy', text: '「勾雷～」哈哈哈，外星人生氣了！' },
        { speaker: 'narrator', emo: 'sad', text: '笑聲更大了。', inner: '我說出來了。就算他們還在笑，我也說出來了。' },
      ] },
  ] },

  // ---------------- 週二 ----------------
  { k: 'day', day: '週二', title: '便當', bg: 'classroom',
    recap: '午餐時，阿明帶了媽媽做的越南春捲。志豪說好臭，有兩個同學把桌子拉開。' },
  { bg: 'classroom', chars: [{ id: 'aming', x: 52, emo: 'happy' }],
    speaker: 'narrator', text: '午餐時間。今天媽媽幫你做了越南春捲，用米紙包著生菜和薄荷葉，還放了一小盒沾醬。是你最喜歡的。' },
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
    { text: '說：「這是我媽媽做的春捲，很好吃。」', need: 35, flag: 'proud',
      fear: '如果說是媽媽做的，他們會不會連媽媽一起笑？',
      effect: { courage: 5 },
      then: [
        { speaker: 'aming', emo: 'neutral', text: '這是我媽媽做的春捲，很好吃。' },
        { speaker: 'zhihao', emo: 'happy', text: '好吃？聞起來超怪的啦。' },
        { speaker: 'narrator', text: '你還是把春捲吃完了。', inner: '媽媽做的，就是很好吃。' },
      ] },
  ] },
  { speaker: 'narrator', emo: 'surprised', text: '收餐盒的時候，前面的同學轉過頭，小聲問你：' },
  { speaker: 'class', text: '那是越南春捲嗎？跟河粉店賣的一樣嗎？……看起來好像滿好吃的。',
    effect: { courage: 5, kind: 1 } },

  // ---------------- 週三 ----------------
  { k: 'day', day: '週三', title: '我的家鄉', bg: 'classroom',
    recap: '社會課報告「我的家鄉」，志豪說阿明的媽媽「是外國人，講話都怪怪的」，後面有人在偷笑。' },
  { bg: 'classroom', chars: [{ id: 'teacher', x: 96, emo: 'happy' }],
    speaker: 'teacher', text: '社會課的報告題目是「我的家鄉」。大家可以介紹爸爸媽媽長大的地方喔。' },
  { bg: 'classroom', chars: WITH_ZHIHAO('surprised', 'happy'),
    speaker: 'zhihao', text: '阿明的家鄉在越南啦！他媽媽是外國人，講話都怪怪的！',
    effect: { courage: -10, witness: 6 } },
  { bg: 'classroom', chars: [{ id: 'aming', x: 52, emo: 'sad' }, { id: 'teacher', x: 140, emo: 'angry' }],
    speaker: 'teacher', text: '志豪，請注意你的用語。阿明的媽媽是新住民，班上很多同學的家人，都來自不同的地方。' },
  { speaker: 'class', text: '（志豪不說話了。可是後面還是有兩個人在偷笑。）' },
  { speaker: 'narrator', emo: 'sad', text: '你想起媽媽說過，她長大的地方在芽莊，那裡的海是全世界最藍的。' },
  { k: 'choice', prompt: '輪到你報告了。你會怎麼說？', options: [
    { text: '「我媽媽是台灣人。我家鄉就在這裡。」',
      effect: { courage: -5 },
      then: [{ speaker: 'aming', emo: 'neutral', text: '我媽媽是台灣人。我的家鄉就在這裡。', inner: '如果媽媽聽到我這樣說，會不會很難過？' }] },
    { text: '隨便講幾句，趕快坐下。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你講了不到一分鐘，就回到座位上。', inner: '趕快結束就好。' }] },
    { text: '介紹媽媽的家鄉：芽莊的海。', need: 35,
      fear: '如果我講媽媽的家鄉，大家會不會更覺得我們很奇怪？',
      then: [
        { speaker: 'aming', emo: 'neutral', text: '我媽媽來自越南的芽莊。那裡的海是全世界最藍的，她小時候每天都去游泳。' },
        { speaker: 'narrator', text: '有兩、三個同學聽得很認真。志豪在後面打了一個大哈欠。', inner: '有人在聽。' },
      ] },
  ] },

  // ---------------- 週四 ----------------
  { k: 'day', day: '週四', title: '晚餐', bg: 'home',
    recap: '晚上媽媽說運動會要去加油。阿明想到「外星阿明」，擔心大家也會笑媽媽的口音。' },
  { bg: 'home', chars: [{ id: 'aming', x: 64, emo: 'neutral' }, { id: 'momM', x: 128, emo: 'happy' }],
    speaker: 'momM', text: 'Ăn cơm đi！吃飯囉！禮拜六運動會，媽媽也會去幫你們加油喔！' },
  { speaker: 'narrator', text: '你想到媽媽在觀眾席大聲喊加油的樣子。\n想到大家會聽到她的口音。',
    inner: '外星阿明。他媽媽講話怪怪的。' },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「媽媽……運動會你可以不要來嗎？」',
      effect: { courage: -5 }, flag: 'askedMomAway',
      then: [
        { speaker: 'aming', emo: 'sad', text: '媽媽……運動會你可以不要來嗎？' },
        { speaker: 'momM', emo: 'sad', text: '……好。媽媽不去。' },
        { speaker: 'narrator', text: '媽媽低頭吃飯，沒有再說話。', inner: '我不是討厭媽媽。我是怕大家笑她。' },
      ] },
    { text: '「嗯。學校很好。」',
      effect: { courage: -5 }, flag: 'quietWithMom',
      then: [
        { speaker: 'aming', emo: 'happy', text: '嗯。學校很好。', inner: '不能讓媽媽知道，大家在笑她的口音。' },
        { speaker: 'momM', emo: 'happy', text: '好！多吃一點，才跑得快！' },
      ] },
    { text: '告訴媽媽：大家在學你講話，還笑你的便當。', need: 30, flag: 'toldMom',
      fear: '媽媽知道大家笑她做的菜，會不會很難過？',
      then: [
        { speaker: 'aming', emo: 'cry', text: '媽媽……我不小心說了越南話，大家就叫我外星阿明。他們還說你做的春捲很臭。' },
        { speaker: 'momM', emo: 'sad', text: '……謝謝你告訴媽媽。這不是你的錯，也不是媽媽的錯。' },
        { speaker: 'momM', emo: 'neutral', text: '會說兩種話，是你的超能力喔。明天媽媽會去找老師談。',
          effect: { courage: 15, kind: 1 } },
      ] },
  ] },

  // ---------------- 週五 ----------------
  { k: 'day', day: '週五', title: '收接力棒', bg: 'classroom',
    recap: '放學後，大家都走了，阿明一個人留在操場收接力棒。' },
  { bg: 'classroom', chars: [{ id: 'aming', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'neutral' }],
    speaker: 'narrator', text: '早自習的時候，林老師把你叫到走廊上。' },
  { speaker: 'teacher', text: '阿明，老師這幾天有注意到，有同學一直叫你綽號，還笑你的便當。' },
  { k: 'if', flag: 'toldMom', then: [
    { speaker: 'teacher', text: '媽媽昨天也來學校找老師了。謝謝你願意告訴媽媽。' },
  ] },
  { speaker: 'teacher', emo: 'neutral', text: '這不是你的錯。老師會跟全班說清楚，也不會讓大家知道是你說的。',
    effect: { courage: 10, kind: 1 } },
  { speaker: 'teacher', emo: 'happy', text: '還有……如果你願意，運動會可以教大家用越南話喊加油。不想也完全沒關係，你自己決定。' },
  { speaker: 'narrator', text: '第一節課，老師沒有點任何人的名字，只對全班說：\n「從今天開始，不可以叫任何人的綽號。笑別人說的語言、笑別人家裡的食物，都是霸凌。」' },
  { k: 'if', flag: 'toldMom', then: [
    { speaker: 'narrator', emo: 'happy', text: '你想起昨天晚上，媽媽摸摸你的頭說：「超能力。」',
      effect: { courage: 5 } },
  ] },
  { bg: 'track', chars: [{ id: 'aming', x: 52, emo: 'sad' }],
    speaker: 'narrator', text: '放學後，大家都走了。你一個人在操場收接力棒。' },
  { bg: 'track', chars: [{ id: 'aming', x: 52, emo: 'surprised' }, { id: 'xiaoyu', x: 140, emo: 'neutral' }],
    speaker: 'xiaoyu', text: '……阿明。你那天喊的那句越南話，是什麼意思？' },
  { speaker: 'aming', emo: 'neutral', text: '……是「加油」。' },
  { speaker: 'xiaoyu', emo: 'happy', text: '我覺得很好聽。',
    effect: { courage: 20, kind: 1 } },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「……謝謝。」',
      effect: { courage: 5 },
      then: [{ speaker: 'aming', emo: 'happy', text: '……謝謝。', inner: '原來有人覺得好聽。' }] },
    { text: '「你也會被他們笑嗎？」', need: 20, flag: 'friend',
      fear: '問了，她會不會也不想理我？',
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

// 運動會：只有一個結局。欺負的人和旁觀者在每條路徑都一樣
// 媽媽週四說會來；如果你請她不要來，她還是戴著帽子站在最後面
const ENDING = [
  { k: 'day', day: '週六', title: '運動會', bg: 'sportsday' },
  { bg: 'sportsday', chars: [{ id: 'aming', x: 52, emo: 'neutral' }, { id: 'xiaoyu', x: 140, emo: 'happy' }],
    speaker: 'narrator', text: '比賽前，你、小雨、阿哲，還有幾個同學圍在一起。你深吸一口氣。' },
  { speaker: 'aming', emo: 'happy', text: 'Cố lên！五年三班！' },
  { speaker: 'class', text: '「Cố lên！五年三班！」\n（幾個人跟著你喊，發音都怪怪的，大家都笑了。志豪沒有跟著喊，但這一次，他也沒有笑你。）' },
  { k: 'if', flag: 'askedMomAway', then: [
    { bg: 'sportsday', chars: [{ id: 'aming', x: 52, emo: 'surprised' }, { id: 'momM', x: 140, emo: 'neutral' }],
      speaker: 'narrator', text: '你看向觀眾席。最後面，有一個戴著帽子的人。是媽媽。她還是來了。' },
    { speaker: 'aming', emo: 'happy', text: '（你用力對她揮手。）', inner: '媽媽，對不起。謝謝你來。' },
  ] },
  { k: 'if', flag: 'toldMom', then: [
    { bg: 'sportsday', chars: [{ id: 'aming', x: 52, emo: 'happy' }, { id: 'momM', x: 140, emo: 'happy' }],
      speaker: 'momM', text: 'Cố lên！阿明——！', inner: '那是我媽媽的聲音。' },
  ] },
  { k: 'if', flag: 'quietWithMom', then: [
    { bg: 'sportsday', chars: [{ id: 'aming', x: 52, emo: 'neutral' }, { id: 'momM', x: 140, emo: 'happy' }],
      speaker: 'narrator', text: '你看向觀眾席，找到了媽媽。她正在對你揮手。' },
  ] },
  { speaker: 'narrator', emo: 'happy', text: '「砰！」\n你跑完了你的那一棒，把接力棒穩穩地交出去。' },
  { bg: 'sportsday', chars: [{ id: 'aming', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'happy' }],
    speaker: 'teacher', text: '阿明，下禮拜社會課，如果你想，可以再跟大家說說芽莊的海。老師很想聽。',
    inner: '這個禮拜很難。可是好像……有人想聽我說話。' },
];

export default {
  id: 'aming',
  name: '阿明',
  blurb: '數學很好。媽媽來自越南，在家會說越南話。',
  story: STORY,
  ending: ENDING,
};
