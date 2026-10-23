// 小雨的故事：單親家庭、家裡經濟辛苦，外套被笑、被排除在生日派對外
//
// 描寫原則：小雨照顧弟弟、跑得快，是有力量的孩子；家裡辛苦但有溫暖
// 老師幫忙時要私下處理（弱勢補助），不能讓全班知道她家的狀況

const WITH_ZHIHAO = (you = 'neutral', zh = 'neutral') => [
  { id: 'xiaoyu', x: 52, emo: you },
  { id: 'zhihao', x: 140, emo: zh },
];

const STORY = [
  // ---------------- 週一 ----------------
  { k: 'day', day: '週一', title: '班服', bg: 'classroom',
    diary: ['你把拉鍊拉到最上面時，心裡最想躲到哪裡？'],
    recap: '要訂班服了，小雨問可不可以不要訂。志豪笑她的外套「袖口都起毛球了，笑死」。',
    help: [
      { text: '跟志豪說：「每個人家裡狀況不一樣，不要這樣。」', result: '志豪翻了一個白眼，但沒有再笑。小雨偷偷看了你一眼。' },
      { text: '下課跟她說：「你的外套很好看啊。」', result: '她愣了一下，把拉鍊拉下來一點點。' },
      { text: '私下告訴老師班服的事，問學校有沒有補助', result: '老師說：「謝謝你，這件事老師會私下處理。」' },
      { text: '不跟著笑', result: '後面的笑聲少了一個。' },
    ] },
  { bg: 'classroom', chars: [{ id: 'xiaoyu', x: 52, emo: 'neutral' }, { id: 'jiajia', x: 140, emo: 'happy' }],
    speaker: 'narrator', text: '你叫小雨，五年三班。你跑步很快，話不多。\n家裡有你、媽媽和讀幼兒園的弟弟。每天放學，都是你去接弟弟。' },
  { speaker: 'jiajia', text: '老師說運動會要穿一樣的班服，一件 350 元，要訂的人禮拜五前跟我登記喔！' },
  { speaker: 'narrator', emo: 'sad', text: '350 元。你想起媽媽上個月在廚房算帳，算了好久。' },
  { speaker: 'xiaoyu', emo: 'sad', text: '那個……我可以不要訂嗎？' },
  { bg: 'classroom', chars: WITH_ZHIHAO('sad', 'happy'),
    speaker: 'zhihao', text: '不訂？那你要穿那件喔？袖口都起毛球了耶，笑死。',
    effect: { courage: -10, witness: 5 } },
  { speaker: 'class', text: '（後面有人小聲說：「她那件好像穿三年了吧。」）' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '說：「我只是不喜歡那個顏色。」',
      effect: { courage: -5 },
      then: [{ speaker: 'xiaoyu', emo: 'neutral', text: '我只是不喜歡那個顏色而已。', inner: '其實那個顏色很好看。' }] },
    { text: '把外套拉鍊拉到最上面，不說話。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你把外套拉鍊拉到下巴，整節課都沒有再抬頭。', inner: '只要不說話，就不會被注意到。' }] },
    { text: '小聲跟佳佳說：「我家最近不方便，可以晚一點再說嗎？」', need: 45, flag: 'askedLater',
      fear: '如果被別人聽到，大家就都知道我家沒錢了。',
      then: [
        { speaker: 'xiaoyu', emo: 'neutral', text: '我家最近不方便……可以晚一點再說嗎？' },
        { speaker: 'jiajia', emo: 'neutral', text: '……喔，好，我先不寫你的名字。' },
        { speaker: 'narrator', text: '志豪在旁邊「噗」地笑了一聲。', inner: '至少佳佳沒有笑。' },
      ] },
  ] },

  // ---------------- 週二 ----------------
  { k: 'day', day: '週二', title: '班級群組', bg: 'home',
    diary: ['看到「已讀 24」的時候，你的手心是什麼感覺？', '收到「我沒有笑」的私訊時，心裡有什麼不一樣？'],
    recap: '晚上，有人把小雨外套的照片傳到班級群組，寫「復古風女王」。24 個人已讀，群組裡沒有人說「不要這樣」。',
    help: [
      { text: '在群組裡說：「這樣不好笑，刪掉吧。」', result: '群組安靜了一下。過了幾分鐘，照片被收回了。' },
      { text: '私訊她：「那張照片很過分，我沒有笑。」', result: '她回了一個字：「嗯。」可是你看到她一直在線上。' },
      { text: '把群組截圖給爸媽或老師看', result: '隔天，老師說：「謝謝你，這件事老師會處理。」' },
      { text: '不按讚、不傳貼圖', result: '那天晚上，已讀的人裡面，有一個沒有笑。' },
    ] },
  { bg: 'home', chars: [{ id: 'xiaoyu', x: 96, emo: 'neutral' }],
    speaker: 'narrator', text: '晚上九點。媽媽還在上班，弟弟已經睡了。你一個人在餐桌寫功課。' },
  { speaker: 'narrator', emo: 'surprised', text: '手機震了一下。是班級群組。\n有人傳了一張照片：你那件起毛球的外套，旁邊加了一行字——「復古風女王」。' },
  { speaker: 'narrator', emo: 'cry', text: '底下有好幾個「哈哈哈」的貼圖。\n照片旁邊寫著：已讀 24。',
    effect: { courage: -15, witness: 24 } },
  { speaker: 'narrator', text: '24 個人看到了。群組裡，沒有一個人說「不要這樣」。',
    inner: '佳佳也看到了吧。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '傳一個「哈哈」貼圖，假裝不在意。',
      effect: { courage: -10 },
      then: [{ speaker: 'narrator', emo: 'happy', text: '你傳了一個大笑的貼圖。', inner: '我在笑。為什麼我在笑？' }] },
    { text: '把手機蓋起來，退出群組。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你退出了群組。房間突然變得好安靜。', inner: '明天他們會不會說我玻璃心？' }] },
    { text: '把照片截圖下來，等媽媽回家給她看。', need: 40, flag: 'savedProof',
      fear: '截圖了又怎樣？大人會不會說只是開玩笑？',
      effect: { courage: 5 },
      then: [
        { speaker: 'narrator', emo: 'neutral', text: '你把照片、是誰傳的、傳的時間，都截圖存了下來。' },
        { speaker: 'narrator', text: '（遇到網路上的欺負，把畫面完整截圖保存，是保護自己的證據。）',
          inner: '我要讓大人知道。' },
      ] },
  ] },
  { speaker: 'narrator', emo: 'surprised', text: '過了一會兒，你收到一則私訊。是同班的冠宇：\n「那張照片很過分，我沒有笑。」',
    effect: { courage: 5, kind: 1 } },
  { speaker: 'narrator', text: '只有一句話。可是你看了好多次。' },

  // ---------------- 週三 ----------------
  { k: 'day', day: '週三', title: '生日邀請卡', bg: 'classroom',
    diary: ['佳佳走過你的座位時，那一秒你心裡是什麼感覺？'],
    recap: '佳佳發生日派對的邀請卡，走過小雨的座位沒有停。旁邊的女生小聲說「她哪有錢買禮物」。',
    help: [
      { text: '下課找她一起去福利社', result: '她愣了一下，說：「……好啊。」' },
      { text: '跟佳佳說：「也邀小雨吧。」', result: '佳佳想了一下，又拿出一張卡片。' },
      { text: '約她禮拜天去公園，帶弟弟也可以', result: '她說：「弟弟很吵喔。」可是她在笑。' },
      { text: '告訴老師，班上有人說她買不起禮物', result: '老師說：「謝謝你，老師會注意班上的說話方式。」' },
    ] },
  { bg: 'classroom', chars: [{ id: 'xiaoyu', x: 52, emo: 'neutral' }, { id: 'jiajia', x: 140, emo: 'happy' }],
    speaker: 'narrator', text: '下課時，佳佳拿著一疊粉紅色的卡片走過每個座位。是她禮拜天的生日派對邀請卡。' },
  { speaker: 'narrator', text: '她走到你的座位。停了一秒。然後走向下一個人。',
    effect: { courage: -10, witness: 6 } },
  { speaker: 'class', text: '（佳佳旁邊的女生小聲說：「她來的話氣氛會很怪啦……而且她哪有錢買禮物。」）' },
  { speaker: 'class', text: '（幾個女生對看了一眼，笑了。佳佳沒有說話。）' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '假裝在看課本。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '課本上的字一個都看不進去。', inner: '不要哭。在這裡哭就更丟臉了。' }] },
    { text: '說：「沒關係，我禮拜天也要照顧弟弟。」',
      then: [{ speaker: 'xiaoyu', emo: 'happy', text: '沒關係啊，我禮拜天也要照顧弟弟。', inner: '就算不用照顧弟弟，也沒有人會邀我。' }] },
    { text: '問佳佳：「我也可以去嗎？」', need: 40,
      fear: '如果她說不行，我會更丟臉。',
      then: [
        { speaker: 'xiaoyu', emo: 'neutral', text: '佳佳……我也可以去嗎？' },
        { speaker: 'jiajia', emo: 'surprised', text: '呃……我、我再問我媽媽。' },
        { speaker: 'narrator', text: '她一直沒有再提起這件事。', inner: '我知道答案了。' },
      ] },
  ] },

  // ---------------- 週四 ----------------
  { k: 'day', day: '週四', title: '很晚的晚餐', bg: 'home',
    diary: ['你為什麼會猶豫，要不要告訴媽媽？', '如果媽媽知道了，你最希望她對你說什麼？'],
    recap: '群組的照片還在。晚上媽媽八點半才下班，問小雨怎麼臉臭臭的。',
    help: [
      { text: '傳訊息給她：「明天練跑要不要一起？」', result: '她回：「好，我跑第三棒。」' },
      { text: '傳訊息給她：「你跑超快，明天第三棒靠你了。」', result: '她回了一個閃電貼圖。' },
      { text: '跟爸媽說群組的事，問他們該怎麼辦', result: '爸爸說：「明天先告訴老師。你不用一個人處理。」' },
      { text: '決定明天早上主動跟她說早安', result: '隔天早上，她小聲回了一句：「早安。」' },
    ] },
  { bg: 'home', chars: [{ id: 'xiaoyu', x: 64, emo: 'neutral' }, { id: 'momX', x: 128, emo: 'happy' }],
    speaker: 'narrator', text: '媽媽八點半才下班，手上提著店裡多出來的玉米濃湯。' },
  { speaker: 'momX', emo: 'happy', text: '快，趁熱喝！弟弟今天在幼兒園把襪子穿在手上，老師笑到不行。' },
  { speaker: 'narrator', emo: 'happy', text: '你也忍不住笑了一下。' },
  { speaker: 'momX', emo: 'neutral', text: '……你今天怎麼了？臉臭臭的。運動會是禮拜六對不對？媽媽有請假，會去看你跑喔。' },
  { speaker: 'narrator', text: '你看著媽媽很累的臉。', inner: '班服、群組、邀請卡……' },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「嗯！學校都很好。」',
      effect: { courage: -5 },
      then: [
        { speaker: 'xiaoyu', emo: 'happy', text: '嗯！學校都很好。', inner: '媽媽已經夠累了。' },
        { speaker: 'momX', emo: 'happy', text: '那就好。喝完早點睡。' },
      ] },
    { text: '「……班服一定要買嗎？」', need: 20,
      fear: '媽媽會不會又要多加班？',
      then: [
        { speaker: 'xiaoyu', emo: 'sad', text: '……班服一定要買嗎？' },
        { speaker: 'momX', emo: 'sad', text: '……多少錢？媽媽想辦法。是不是有人說了什麼？' },
        { speaker: 'xiaoyu', emo: 'sad', text: '沒有啦。', inner: '說了，媽媽會不會更辛苦？' },
        { speaker: 'momX', emo: 'neutral', text: '有什麼事都要跟媽媽說喔。你不用一個人撐著。',
          effect: { courage: 5, kind: 1 } },
      ] },
    { text: '把群組的截圖拿給媽媽看，告訴她這幾天的事。', need: 30, flag: 'toldMom',
      fear: '媽媽已經這麼累了，我還要讓她擔心嗎？',
      then: [
        { speaker: 'xiaoyu', emo: 'cry', text: '媽媽……他們在群組笑我的外套。佳佳的生日也沒有邀我。' },
        { speaker: 'momX', emo: 'sad', text: '……謝謝你告訴我。這不是你的錯，一點都不是。' },
        { speaker: 'momX', emo: 'neutral', text: '明天媽媽會打電話給老師。你不用一個人面對。',
          effect: { courage: 15, kind: 1 } },
      ] },
  ] },

  // ---------------- 週五 ----------------
  { k: 'day', day: '週五', title: '號碼布', bg: 'classroom',
    diary: ['老師說班服不用擔心時，你有沒有鬆一口氣？', '號碼布上的閃電，讓你覺得明天可以跑多快？'],
    recap: '老師私下處理了群組和班服的事。下午練跑時，小雨一口氣超過了兩個人。',
    help: [
      { text: '幫阿哲一起在號碼布上畫閃電', result: '閃電被你們畫得太大，整張號碼布都是金色的。' },
      { text: '練跑時大聲幫她加油', result: '她跑過你面前的時候，好像跑得更快了。' },
      { text: '問一句：「你還好嗎？」', result: '她說：「群組的照片不見了。好一點了。」' },
      { text: '陪她一起去接弟弟', result: '弟弟一直問你是誰。她說：「我朋友。」' },
    ] },
  { bg: 'classroom', chars: [{ id: 'xiaoyu', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'neutral' }],
    speaker: 'narrator', text: '早自習的時候，林老師把你叫到走廊上。' },
  { speaker: 'teacher', text: '小雨，老師這幾天有注意到，班上的群組有一些不好的事情。' },
  { k: 'if', flag: 'toldMom', then: [
    { speaker: 'teacher', text: '媽媽昨天也打電話給老師了。謝謝你願意告訴媽媽。' },
  ] },
  { speaker: 'teacher', emo: 'neutral', text: '還有，學校有補助，班服你不用擔心，這本來就是你可以用的。老師已經幫你登記了，不會有別人知道。',
    effect: { courage: 10, kind: 1 } },
  { speaker: 'teacher', text: '這不是你的錯。群組的事，老師會處理。' },
  { speaker: 'narrator', text: '第一節課，老師沒有點任何人的名字，只對全班說：\n「把別人的照片貼到群組裡開玩笑，也是霸凌。」\n那張照片不見了。' },
  { k: 'if', flag: 'toldMom', then: [
    { speaker: 'narrator', emo: 'happy', text: '你想起昨天晚上，媽媽一直握著你的手。',
      effect: { courage: 5 } },
  ] },
  { bg: 'track', chars: [{ id: 'xiaoyu', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '下午練大隊接力。你跑第三棒，一口氣超過了兩個人。' },
  { bg: 'track', chars: [{ id: 'xiaoyu', x: 52, emo: 'surprised' }, { id: 'azhe', x: 140, emo: 'happy' }],
    speaker: 'azhe', text: '小雨！你跑超快的耶！' },
  { speaker: 'azhe', text: '欸，我幫你在號碼布上畫一隻閃電好不好？一定超帥！',
    effect: { courage: 20, kind: 1 } },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「……好啊。謝謝。」',
      effect: { courage: 5 },
      then: [{ speaker: 'xiaoyu', emo: 'happy', text: '……好啊。謝謝。', inner: '原來有人看到我跑得很快。' }] },
    { text: '「你也會被他們笑嗎？」', need: 20, flag: 'friend',
      fear: '問了，他會不會覺得我很奇怪？',
      effect: { courage: 10 },
      then: [
        { speaker: 'xiaoyu', emo: 'neutral', text: '你也會被他們笑嗎？' },
        { speaker: 'azhe', emo: 'sad', text: '會啊。他們說跟我同一隊很倒楣。所以我知道那種感覺。' },
        { speaker: 'azhe', emo: 'happy', text: '明天我們兩個都要跑很快，嚇死他們！' },
      ] },
    { text: '什麼都沒說，點點頭。',
      then: [{ speaker: 'narrator', emo: 'neutral', text: '阿哲還是很開心地拿出彩色筆開始畫。', inner: '有人陪著，好像沒那麼難過了。' }] },
  ] },
];

// 運動會：只有一個結局。欺負的人和旁觀者在每條路徑都一樣
// 媽媽週四說過會請假來看，所以每條路徑都在；有告訴媽媽，她會大聲喊加油
const ENDING = [
  { k: 'day', day: '週六', title: '運動會', bg: 'sportsday' },
  { bg: 'sportsday', chars: [{ id: 'xiaoyu', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '你穿著和大家一樣的班服，號碼布上有阿哲畫的金色閃電。' },
  { speaker: 'narrator', text: '有人在後面小聲說：「復古風女王來了。」',
    inner: '不要理他們。' },
  { bg: 'sportsday', chars: [{ id: 'xiaoyu', x: 52, emo: 'neutral' }, { id: 'momX', x: 140, emo: 'happy' }],
    speaker: 'narrator', text: '觀眾席上，媽媽牽著弟弟，對你揮手。' },
  { k: 'if', flag: 'toldMom', then: [
    { speaker: 'momX', text: '小雨——媽媽在這裡！加油！' },
  ] },
  { speaker: 'narrator', emo: 'happy', text: '「砰！」\n第三棒。你接過接力棒，一口氣超過了兩個人。' },
  { bg: 'sportsday', chars: [{ id: 'xiaoyu', x: 52, emo: 'happy' }, { id: 'azhe', x: 140, emo: 'happy' }],
    speaker: 'azhe', text: '閃電女王！',
    inner: '這個外號，我喜歡。' },
  { bg: 'sportsday', chars: [{ id: 'xiaoyu', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'happy' }],
    speaker: 'teacher', text: '小雨，下禮拜輔導老師想找你聊聊群組的事。你想說多少都可以，慢慢來。',
    inner: '這個禮拜很難。可是好像……有人站在我這邊了。' },
];

export default {
  id: 'xiaoyu',
  name: '小雨',
  pronoun: '她',
  blurb: '跑步很快，話不多。每天放學去接弟弟。',
  story: STORY,
  ending: ENDING,
};
