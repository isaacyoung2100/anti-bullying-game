// 小雨的故事：單親家庭、家裡經濟辛苦，被笑「窮酸」

const WITH_ZHIHAO = (you = 'neutral', zh = 'neutral') => [
  { id: 'xiaoyu', x: 52, emo: you },
  { id: 'zhihao', x: 140, emo: zh },
];

const STORY = [
  // ---------------- 週一 ----------------
  { k: 'day', day: '週一', title: '班服', bg: 'classroom' },
  { bg: 'classroom', chars: [{ id: 'xiaoyu', x: 52, emo: 'neutral' }, { id: 'jiajia', x: 140, emo: 'happy' }],
    speaker: 'narrator', text: '你叫小雨，五年三班。你跑步很快，話不多。\n家裡只有你、媽媽和讀幼兒園的弟弟。' },
  { speaker: 'jiajia', text: '大家注意！運動會要穿一樣的班服，一件 350 元，這禮拜五前要交錢喔！' },
  { speaker: 'narrator', emo: 'sad', text: '350 元。你想起媽媽上個月在廚房算帳，算了好久。' },
  { speaker: 'xiaoyu', emo: 'sad', text: '那個……我可以不要買嗎？' },
  { bg: 'classroom', chars: WITH_ZHIHAO('sad', 'happy'),
    speaker: 'zhihao', text: '不買？那你要穿那件洗到變色的外套跑喔？哈哈，好窮酸喔。',
    effect: { courage: -10, witness: 5 } },
  { speaker: 'class', text: '（後面有人小聲說：「她家好像很窮。」）' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '說：「我只是不喜歡那個顏色。」',
      effect: { courage: -5 },
      then: [{ speaker: 'xiaoyu', emo: 'neutral', text: '我只是不喜歡那個顏色而已。', inner: '其實那個顏色很好看。' }] },
    { text: '把外套拉鍊拉到最上面，不說話。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你把外套拉鍊拉到下巴，整節課都沒有再抬頭。', inner: '只要不說話，就不會被注意到。' }] },
    { text: '小聲跟佳佳說：「我家最近不方便，可以晚一點交嗎？」', need: 55, flag: 'askedLater',
      then: [
        { speaker: 'xiaoyu', emo: 'neutral', text: '我家最近不方便……可以晚一點交嗎？' },
        { speaker: 'jiajia', emo: 'neutral', text: '……喔，好，我幫你跟老師說。' },
        { speaker: 'narrator', text: '志豪在旁邊「噗」地笑了一聲。', inner: '至少佳佳沒有笑。' },
      ] },
  ] },

  // ---------------- 週二 ----------------
  { k: 'day', day: '週二', title: '班級群組', bg: 'home' },
  { bg: 'home', chars: [{ id: 'xiaoyu', x: 96, emo: 'neutral' }],
    speaker: 'narrator', text: '晚上九點。媽媽還在上班，弟弟已經睡了。你一個人在餐桌寫功課。' },
  { speaker: 'narrator', emo: 'surprised', text: '手機震了一下。是班級群組。\n有人傳了一張照片：你那件變色的外套，旁邊加了一行字——「復古風女王」。' },
  { speaker: 'narrator', emo: 'cry', text: '底下有好幾個「哈哈哈」的貼圖。\n照片旁邊寫著：已讀 24。',
    effect: { courage: -15, witness: 24 } },
  { speaker: 'narrator', text: '24 個人看到了。沒有一個人說「不要這樣」。',
    inner: '佳佳也看到了吧。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '傳一個「哈哈」貼圖，假裝不在意。',
      effect: { courage: -10 },
      then: [{ speaker: 'narrator', emo: 'happy', text: '你傳了一個大笑的貼圖。', inner: '我在笑。為什麼我在笑？' }] },
    { text: '把手機蓋起來，退出群組。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你退出了群組。房間突然變得好安靜。', inner: '明天他們會不會說我玻璃心？' }] },
    { text: '把照片截圖下來，等媽媽回家給她看。', need: 55, flag: 'savedProof',
      effect: { courage: 5 },
      then: [{ speaker: 'narrator', emo: 'neutral', text: '你把照片存了下來。', inner: '我要讓大人知道。可是……要怎麼開口？' }] },
  ] },

  // ---------------- 週三 ----------------
  { k: 'day', day: '週三', title: '生日邀請卡', bg: 'classroom' },
  { bg: 'classroom', chars: [{ id: 'xiaoyu', x: 52, emo: 'neutral' }, { id: 'jiajia', x: 140, emo: 'happy' }],
    speaker: 'narrator', text: '下課時，佳佳拿著一疊粉紅色的卡片走過每個座位。是她禮拜天的生日派對邀請卡。' },
  { speaker: 'narrator', text: '她走到你的座位。停了一秒。然後走向下一個人。',
    effect: { courage: -10, witness: 6 } },
  { bg: 'classroom', chars: WITH_ZHIHAO('sad', 'happy'),
    speaker: 'zhihao', text: '邀她幹嘛，她又買不起禮物。' },
  { speaker: 'class', text: '（有人笑了。佳佳沒有說話。）' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '假裝在看課本。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '課本上的字一個都看不進去。', inner: '不要哭。在這裡哭就更丟臉了。' }] },
    { text: '說：「沒關係，我禮拜天也要照顧弟弟。」',
      then: [{ speaker: 'xiaoyu', emo: 'happy', text: '沒關係啊，我禮拜天也要照顧弟弟。', inner: '就算不用照顧弟弟，也沒有人會邀我。' }] },
    { text: '問佳佳：「我也可以去嗎？」', need: 40,
      then: [
        { speaker: 'xiaoyu', emo: 'neutral', text: '佳佳……我也可以去嗎？' },
        { speaker: 'jiajia', emo: 'surprised', text: '呃……我、我再問我媽媽。' },
        { speaker: 'narrator', text: '她一直沒有再提起這件事。', inner: '我知道答案了。' },
      ] },
  ] },

  // ---------------- 週四 ----------------
  { k: 'day', day: '週四', title: '很晚的晚餐', bg: 'home' },
  { bg: 'home', chars: [{ id: 'xiaoyu', x: 64, emo: 'neutral' }, { id: 'momX', x: 128, emo: 'neutral' }],
    speaker: 'narrator', text: '媽媽八點半才下班。你們一起吃中午剩下的炒飯。' },
  { speaker: 'momX', emo: 'happy', text: '運動會是禮拜六對不對？媽媽有請假，會去看你跑喔。' },
  { speaker: 'narrator', text: '你看著媽媽很累的臉。', inner: '班服、群組、邀請卡……' },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「嗯！學校都很好。」',
      effect: { courage: -5 },
      then: [
        { speaker: 'xiaoyu', emo: 'happy', text: '嗯！學校都很好。', inner: '媽媽已經夠累了。' },
        { speaker: 'momX', emo: 'happy', text: '那就好。快吃，吃完早點睡。' },
      ] },
    { text: '「……班服一定要買嗎？」', need: 25,
      then: [
        { speaker: 'xiaoyu', emo: 'sad', text: '……班服一定要買嗎？' },
        { speaker: 'momX', emo: 'sad', text: '……多少錢？媽媽想辦法。是不是有人說了什麼？' },
        { speaker: 'xiaoyu', emo: 'sad', text: '沒有啦。', inner: '說了，媽媽會不會更辛苦？' },
        { speaker: 'momX', emo: 'neutral', text: '有什麼事都要跟媽媽說喔。你不用一個人撐著。',
          effect: { courage: 5, kind: 1 } },
      ] },
    { text: '把群組的照片拿給媽媽看，告訴她這幾天的事。', need: 40, flag: 'toldMom',
      then: [
        { speaker: 'xiaoyu', emo: 'cry', text: '媽媽……他們在群組笑我的外套。佳佳的生日也沒有邀我。' },
        { speaker: 'momX', emo: 'sad', text: '……謝謝你告訴我。這不是你的錯，一點都不是。' },
        { speaker: 'momX', emo: 'neutral', text: '明天媽媽會打電話給老師。你不用一個人面對。',
          effect: { courage: 20, kind: 1 } },
      ] },
  ] },

  // ---------------- 週五 ----------------
  { k: 'day', day: '週五', title: '號碼布', bg: 'track' },
  { k: 'if', flag: 'toldMom', then: [
    { bg: 'classroom', chars: [{ id: 'teacher', x: 96, emo: 'neutral' }],
      speaker: 'teacher', text: '早上，老師在全班面前說：「班服不用自己買，老師用班費幫大家訂。還有，群組不是用來笑別人的地方。」' },
    { speaker: 'narrator', text: '那張照片被刪掉了。下課時，老師把志豪叫到走廊上談話。',
      effect: { courage: 5, kind: 1 } },
  ] },
  { bg: 'track', chars: [{ id: 'xiaoyu', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '下午練大隊接力。你跑第三棒，一口氣超過了兩個人。' },
  { bg: 'track', chars: [{ id: 'xiaoyu', x: 52, emo: 'surprised' }, { id: 'azhe', x: 140, emo: 'happy' }],
    speaker: 'azhe', text: '小雨！你跑超快的耶！' },
  { speaker: 'azhe', text: '欸，我幫你在號碼布上畫一隻閃電好不好？畫了就跟班服一樣帥！',
    effect: { courage: 25, kind: 1 } },
  { speaker: 'narrator', text: '這是這個禮拜，第一次有同學主動跟你說話。' },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「……好啊。謝謝。」',
      effect: { courage: 5 },
      then: [{ speaker: 'xiaoyu', emo: 'happy', text: '……好啊。謝謝。', inner: '原來有人看到我跑得很快。' }] },
    { text: '「你也會被他們笑嗎？」', need: 20, flag: 'friend',
      effect: { courage: 10 },
      then: [
        { speaker: 'xiaoyu', emo: 'neutral', text: '你也會被他們笑嗎？' },
        { speaker: 'azhe', emo: 'sad', text: '會啊。他們叫我過動兒。所以我知道那種感覺。' },
        { speaker: 'azhe', emo: 'happy', text: '明天我們兩個都要跑很快，嚇死他們！' },
      ] },
    { text: '什麼都沒說，點點頭。',
      then: [{ speaker: 'narrator', emo: 'neutral', text: '阿哲還是很開心地拿出彩色筆開始畫。', inner: '有人陪著，好像沒那麼難過了。' }] },
  ] },
];

const ENDINGS = {
  brave: [
    { k: 'day', day: '週六', title: '運動會', bg: 'sportsday' },
    { bg: 'sportsday', chars: [{ id: 'xiaoyu', x: 52, emo: 'neutral' }, { id: 'momX', x: 140, emo: 'happy' }],
      speaker: 'narrator', text: '你的外套上，別著一張畫了金色閃電的號碼布。媽媽坐在觀眾席最前面。' },
    { speaker: 'narrator', emo: 'happy', text: '「砰！」\n第三棒。你接過接力棒，一口氣超過了兩個人。' },
    { speaker: 'momX', emo: 'happy', text: '小雨——加油！' },
    { speaker: 'narrator', emo: 'happy', text: '你把接力棒交出去的時候，聽到阿哲在旁邊大叫：「閃電女王！」',
      inner: '這個外號，我喜歡。' },
  ],
  heavy: [
    { k: 'day', day: '週六', title: '運動會', bg: 'sportsday' },
    { bg: 'sportsday', chars: [{ id: 'xiaoyu', x: 52, emo: 'sad' }],
      speaker: 'narrator', text: '全班都穿著一樣的藍色班服。只有你穿著那件外套，拉鍊拉到最上面。' },
    { speaker: 'narrator', text: '你聽到有人在後面小聲說：「復古風女王來了。」',
      inner: '不要看我。不要看我。' },
    { speaker: 'narrator', emo: 'sad', text: '「砰！」\n你超過了兩個人。可是你一點都不開心。' },
    { bg: 'sportsday', chars: [{ id: 'xiaoyu', x: 52, emo: 'sad' }, { id: 'azhe', x: 140, emo: 'neutral' }],
      speaker: 'azhe', text: '你跑得超快的。真的。',
      inner: '如果這個禮拜，早一點有人這樣跟我說就好了。' },
  ],
};

export default {
  id: 'xiaoyu',
  name: '小雨',
  blurb: '跑步很快，話不多。家裡只有媽媽和弟弟。',
  story: STORY,
  endings: ENDINGS,
};
