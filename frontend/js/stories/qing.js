// 小晴的故事：自閉症類群，部分課程在資源班上
//
// 描寫原則：尊重神經多樣性，不寫成「可憐」或「怪」。內心話寫的是感官被塞滿的真實感受，
// 和她用事實、順序讓自己安心的方式；去冷靜角、戴耳罩是照顧自己的好方法，不扣心靈能量
// 她的力量：對恐龍和數字的驚人記憶。家人是開計程車的爸爸（爸爸照顧）

const CLASS_CHARS = (you = 'neutral', zh = 'neutral') => [
  { id: 'qing', x: 52, emo: you },
  { id: 'zhihao', x: 140, emo: zh },
];

const STORY = [
  // ---------------- 週一 ----------------
  { k: 'day', day: '週一', title: '排整齊的鉛筆', bg: 'classroom',
    recap: '志豪故意把小晴排好的色鉛筆撥亂，還說「排那麼齊是要拜拜喔」。小晴的耳朵嗡嗡作響。',
    diary: ['固定的順序突然被弄亂時，你的身體有什麼感覺？'],
    help: [
      { text: '幫她照顏色順序，把筆一起排回去', result: '小晴的呼吸慢慢平穩，對你點了兩下頭。' },
      { text: '跟志豪說：「亂動別人的東西很沒禮貌。」', result: '志豪說「開玩笑而已」，轉身走了。' },
      { text: '拿恐龍貼紙問她：「這隻是副櫛龍嗎？」', result: '她馬上說出牠的特徵，慢慢不那麼慌了。' },
      { text: '下課告訴老師，有人故意弄亂同學的東西', result: '老師提醒全班：別人桌上的東西，不能亂動。' },
    ] },
  { bg: 'classroom', chars: [{ id: 'qing', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'neutral' }],
    speaker: 'narrator', text: '你叫小晴，五年三班。你最喜歡恐龍，也記得全班每個人的生日。' },
  { speaker: 'narrator', text: '每天早上，你會把十二色鉛筆從深排到淺。這樣，世界就是安全的。' },
  { speaker: 'teacher', text: '第四節，小晴要先去資源班上課喔。' },
  { bg: 'classroom', chars: [{ id: 'qing', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '下課鐘響，老師走出教室。志豪經過你的桌子，用手肘一掃。' },
  { bg: 'classroom', chars: CLASS_CHARS('surprised', 'happy'),
    speaker: 'zhihao', text: '哎呀手滑！排那麼齊，是要拜拜喔？',
    effect: { courage: -10, witness: 6 } },
  { speaker: 'class', text: '（後面有人說：「她去資源班的啦，規矩很多。」）' },
  { speaker: 'narrator', emo: 'cry', text: '鉛筆掉了一地，順序全亂了。你的心跳變快，耳朵嗡嗡作響。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '蹲下來，雙手抱住頭，閉上眼睛。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'cry', text: '你抱著頭蹲在桌子下面。', inner: '聲音太大、顏色太亂了。我需要安靜……' }] },
    { text: '一直重複唸：「鉛筆散了、鉛筆散了……」',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你一直唸同一句話。志豪在旁邊學你的聲音。', inner: '為什麼他要發出奇怪的聲音？' }] },
    { text: '一邊背甲龍的特徵，一邊把筆撿回來。', need: 45,
      fear: '如果我發出聲音，大家會不會圍過來看？',
      then: [
        { speaker: 'qing', emo: 'neutral', text: '甲龍身長六公尺，背上有厚厚的骨板。' },
        { speaker: 'narrator', text: '你一邊唸，一邊照顏色把筆排好。', inner: '順序回來了。我把我的鉛筆保護好了。' },
      ] },
  ] },
  { bg: 'classroom', chars: [{ id: 'qing', x: 52, emo: 'surprised' }, { id: 'guanyu', x: 140, emo: 'neutral' }],
    speaker: 'narrator', text: '冠宇蹲下來，從講台下面撿起兩支深藍色的筆。' },
  { speaker: 'guanyu', text: '最後兩支滾到這裡了。是放在這個位置嗎？',
    effect: { courage: 5, kind: 1 } },

  // ---------------- 週二 ----------------
  { k: 'day', day: '週二', title: '突然的巨響', bg: 'classroom',
    recap: '打掃時間，志豪在小晴背後故意把鐵椅子用力摔在地上。小晴摀著耳朵，全身僵住。',
    diary: ['很大的聲音突然炸開時，你的身體有什麼感覺？你需要什麼？'],
    help: [
      { text: '把你的耳塞或耳罩借她', result: '她戴上之後，肩膀慢慢放鬆了。' },
      { text: '跟志豪說：「不要故意製造聲音嚇人！」', result: '教室安靜了下來，志豪低下頭。' },
      { text: '輕輕敲她的桌角：「深呼吸，聲音已經停了。」', result: '她跟著你的節奏吸氣、吐氣，慢慢鬆開拳頭。' },
      { text: '陪她去保健室，喝一杯溫水', result: '在安靜的保健室坐了十分鐘，她好多了。' },
    ] },
  { bg: 'classroom', chars: [{ id: 'qing', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '下午打掃時間，教室裡都是拖椅子的聲音。你的耳朵有點痛。' },
  { speaker: 'narrator', text: '志豪拿著一張鐵椅子，走到你後面，用力往地上一摔！' },
  { speaker: 'narrator', emo: 'surprised', text: '「碰——！」\n巨大的聲音在你的耳朵裡炸開。' },
  { bg: 'classroom', chars: CLASS_CHARS('cry', 'happy'),
    speaker: 'zhihao', text: '哇，耳朵那麼靈喔？測試一下而已啦！',
    effect: { courage: -15, witness: 8 } },
  { speaker: 'class', text: '（有人嚇了一跳，然後看著你摀住耳朵，偷偷笑了。）' },
  { speaker: 'narrator', emo: 'cry', text: '尖尖的聲音一直在腦袋裡轉。你全身僵硬，雙手摀住耳朵。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '趴在桌上，用外套把頭整個包起來。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'cry', text: '你縮在外套底下，眼淚一直流。', inner: '好吵，好痛。我想回家……' }] },
    { text: '走去資源教室的冷靜角。',
      then: [
        { speaker: 'narrator', emo: 'neutral', text: '你快步走到資源教室。那裡有軟墊，很安靜。' },
        { speaker: 'narrator', text: '資源班老師遞給你一杯水，讓你坐在軟墊上。', inner: '這是我讓自己好起來的方法。' },
      ] },
    { text: '戴上爸爸買的耳罩，在筆記本寫下來。', need: 35,
      fear: '戴上大耳罩，會不會被大家指指點點？',
      effect: { courage: 5 },
      then: [
        { speaker: 'narrator', text: '你戴上耳罩，世界一下子變安靜了。' },
        { speaker: 'narrator', text: '你在筆記本寫下：「週二，故意摔椅子。」', inner: '耳罩幫我擋住了怪獸的吼叫。' },
      ] },
  ] },

  // ---------------- 週三（好的一天：連續兩天被欺負之後，這一天不會再被欺負）----------------
  // 同一幕也出現在阿凱的故事裡
  { k: 'day', day: '週三', title: '準確的拍子', bg: 'track',
    diary: ['今天你幫上別人的時候，你心裡是什麼感覺？'],
    recap: '進場舞彩排時，小晴聽出哪裡快了、哪裡慢了。阿凱請她幫忙數拍子。',
    help: [
      { text: '跟她說：「你的耳朵好厲害！」', result: '她點點頭：「我對聲音很敏感。」' },
      { text: '彩排時站在她旁邊，讓她不會被擠到', result: '她跳完整首，都沒有摀耳朵。' },
      { text: '問她：「你最喜歡哪一種恐龍？」', result: '她講了十分鐘的三角龍，你聽得好入迷。' },
      { text: '請老師把音樂調小聲一點', result: '她的肩膀放鬆了，跟著拍子點頭。' },
    ] },
  { bg: 'track', chars: [{ id: 'qing', x: 52, emo: 'neutral' }, { id: 'kai', x: 140, emo: 'happy' }],
    speaker: 'narrator', text: '今天全班第一次彩排進場舞。阿凱站在最前面帶大家跳。' },
  { speaker: 'narrator', text: '音樂有點大聲，可是拍子很清楚。你在心裡數：一、二、三、四。' },
  { speaker: 'narrator', text: '第三小節，大家慢了半拍。第五小節，又快了半拍。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '說出你聽到的。',
      effect: { courage: 5 },
      then: [
        { speaker: 'qing', emo: 'neutral', text: '第三小節慢了半拍。第五小節快了半拍。' },
        { speaker: 'narrator', text: '阿凱愣了一下，然後眼睛亮了起來。' },
      ] },
    { text: '小聲跟旁邊的阿凱說。',
      effect: { courage: 5 },
      then: [
        { speaker: 'qing', emo: 'neutral', text: '阿凱，第三小節慢了，第五小節快了。' },
        { speaker: 'narrator', text: '阿凱聽完，馬上點點頭。' },
      ] },
    { text: '寫在筆記本上，等一下拿給他看。',
      then: [{ speaker: 'narrator', text: '你寫下「第三小節慢、第五小節快」，拿給阿凱看。' }] },
  ] },
  { speaker: 'kai', emo: 'happy', text: '小晴，你的拍子最準。可以幫我數拍子嗎？',
    effect: { courage: 5, kind: 1 } },
  { speaker: 'qing', text: '好。一、二、三、四。每一拍都一樣長。' },
  { speaker: 'narrator', emo: 'happy', text: '第二次，全班跳得整整齊齊。大家都拍手了。', inner: '我的耳朵，也可以幫上忙。' },
  { speaker: 'narrator', emo: 'happy', text: '今天，沒有人故意嚇你。', inner: '如果每天都像今天就好了。' },

  // ---------------- 週四（白天在學校，晚上和家人）----------------
  { k: 'day', day: '週四', title: '假裝友善的玩笑', bg: 'classroom',
    diary: ['別人笑著跟你說話、其實是在騙你的時候，你心裡是什麼感覺？', '你最想用什麼方式，讓爸爸知道今天學校發生的事？'],
    recap: '志豪笑瞇瞇地騙小晴：「沙坑挖到暴龍骨頭，叫你快去挖！」後面的人等著看她跑去。晚上九點，開計程車的爸爸收工回家，看到小晴把恐龍模型排了一次又一次。',
    help: [
      { text: '提醒她：「他在亂講，學校沒有恐龍化石。」', result: '她停下來，翻開圖鑑確認，點了點頭。' },
      { text: '跟志豪說：「故意騙人看笑話，一點都不好笑。」', result: '志豪不高興地走開，沒有人跑去沙坑。' },
      { text: '傳訊息給她：「晚安，明天接力賽一起加油！」', result: '她回：「晚安。明天氣溫二十六度。」' },
      { text: '決定明天進場時走在她旁邊，幫她隔開人群', result: '隔天集合時，她站在你旁邊，看起來比較安心。' },
    ] },
  { bg: 'classroom', chars: [{ id: 'qing', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '午休後，志豪笑瞇瞇地走過來。他的眼睛一直瞄向後面的同學。' },
  { bg: 'classroom', chars: CLASS_CHARS('neutral', 'happy'),
    speaker: 'zhihao', text: '小晴，警衛伯伯說沙坑挖到暴龍骨頭，叫你快去挖！',
    effect: { courage: -10, witness: 6 } },
  { speaker: 'class', text: '（後面幾個人摀著嘴偷笑，等著看你跑去沙坑。）' },
  { speaker: 'narrator', text: '暴龍住在很久以前的北美洲。台灣從來沒有挖到過恐龍化石。' },
  { speaker: 'narrator', emo: 'surprised', text: '可是志豪在笑。大人說，笑瞇瞇的人是友善的。你覺得好混亂。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '站起來，想拿小鏟子去沙坑看看。',
      effect: { courage: -10 },
      then: [{ speaker: 'narrator', emo: 'surprised', text: '你一站起來，後面爆出大笑：「她真的信了啦！」', inner: '笑瞇瞇不是友善嗎？為什麼騙我，大家會笑？' }] },
    { text: '不看他，低頭翻恐龍百科。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', text: '你把百科立得高高的。', inner: '書不會騙人。書上寫的都是真的。' }] },
    { text: '抬起頭，說出你知道的事實。', need: 50,
      fear: '如果我說錯了，大家會不會笑得更大聲？',
      then: [
        { speaker: 'qing', emo: 'neutral', text: '台灣沒有挖到過恐龍化石。你說的不是真的。' },
        { speaker: 'narrator', text: '教室安靜了一下。志豪聳聳肩走開了。', inner: '事實不會騙人。' },
      ] },
  ] },
  // 被騙之後，阿凱來找她：昨天彩排一起數拍子，今天是朋友了
  { bg: 'classroom', chars: [{ id: 'qing', x: 52, emo: 'surprised' }, { id: 'kai', x: 140, emo: 'happy' }],
    speaker: 'narrator', text: '放學前，阿凱走過來，手上拿著一張恐龍貼紙。' },
  { speaker: 'kai', text: '你講化石的那段好厲害。這張三角龍給你。',
    effect: { courage: 5, kind: 1 } },
  { speaker: 'narrator', emo: 'happy', text: '貼紙上的三角龍，有三根角，畫得很正確。',
    inner: '他聽懂了我說的話。' },

  // 晚上
  { bg: 'home', chars: [{ id: 'qing', x: 64, emo: 'neutral' }, { id: 'dadQ', x: 128, emo: 'happy' }],
    speaker: 'narrator', text: '晚上九點，爸爸穿著計程車的制服回來，幫你把青椒挑掉。' },
  { speaker: 'dadQ', text: '小晴，你把暴龍和劍龍排了五次喔。今天學校很吵嗎？' },
  { speaker: 'narrator', text: '你看著爸爸累累的臉。',
    inner: '摔椅子的聲音、假的暴龍骨頭、走廊的笑聲……' },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「今天有很吵的聲音。」然後低頭吃飯。',
      effect: { courage: -5 },
      then: [
        { speaker: 'qing', emo: 'neutral', text: '今天有很吵的聲音。' },
        { speaker: 'dadQ', emo: 'neutral', text: '爸爸幫你把耳罩換新的海綿，好不好？' },
        { speaker: 'narrator', text: '你點點頭。', inner: '爸爸開了十二個小時的車，已經很累了。' },
      ] },
    { text: '「運動會很吵，我可以不要去嗎？」', need: 20,
      fear: '爸爸會不會覺得我很不合群？',
      then: [
        { speaker: 'qing', emo: 'sad', text: '爸爸，運動會人很多、哨子很吵，我可以不要去嗎？' },
        { speaker: 'dadQ', emo: 'neutral', text: '真的很難受的話，爸爸陪你跟老師說。' },
        { speaker: 'dadQ', emo: 'happy', text: '如果你想跑，爸爸那天休假，在跑道邊幫你拿耳罩。',
          effect: { courage: 5, kind: 1 } },
      ] },
    { text: '把筆記本上的事，一條一條唸給爸爸聽。', need: 30, flag: 'toldMom',
      fear: '唸出來，那些事會不會變得更可怕？',
      then: [
        { speaker: 'qing', emo: 'sad', text: '週一，鉛筆被弄亂。週二，故意摔椅子。今天，說不真實的話。' },
        { speaker: 'dadQ', emo: 'sad', text: '……謝謝你寫得這麼清楚。欺負人是不對的，不是你的錯。' },
        { speaker: 'dadQ', emo: 'neutral', text: '明天爸爸先去學校跟林老師談。你不用一個人面對。',
          effect: { courage: 15, kind: 1 } },
      ] },
  ] },

  // ---------------- 週五 ----------------
  { k: 'day', day: '週五', title: '安靜的圖書角', bg: 'classroom',
    recap: '林老師在安靜的圖書角和小晴談，讓她可以戴耳塞跑接力。放學前，阿哲請她幫忙看棒次名單。',
    diary: ['老師和同學用你舒服的方式跟你說話時，心裡有沒有安靜一點？'],
    help: [
      { text: '幫她把耳塞盒放進束口袋', result: '她確認了兩次拉鍊，滿意地點點頭。' },
      { text: '練跑時在終點舉著數字牌給她看', result: '看著清楚的數字，她直直衝到終點。' },
      { text: '問她：「明天太吵的話，要我幫你拿東西嗎？」', result: '她說：「請幫我拿水壺。容量六百毫升。」' },
      { text: '陪她走去資源教室交作業', result: '你們踩著地上的磁磚，一格一格走過去。' },
    ] },
  { bg: 'classroom', chars: [{ id: 'qing', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'neutral' }],
    speaker: 'narrator', text: '早自習，林老師請你到圖書角。那裡有厚厚的地毯，很安靜。' },
  { speaker: 'teacher', text: '小晴，老師這幾天有注意到，有人故意弄出很大的聲音，還騙你。' },
  { k: 'if', flag: 'toldMom', then: [
    { speaker: 'teacher', text: '爸爸今天早上也來找老師了。謝謝你讓爸爸知道。' },
    { speaker: 'teacher', text: '爸爸說你都記在筆記本裡。你記得很清楚，幫了老師很多。' },
  ] },
  { speaker: 'teacher', emo: 'happy', text: '這不是你的錯。明天你可以戴耳塞跑，老師跟裁判說好了。',
    effect: { courage: 10, kind: 1 } },
  { speaker: 'narrator', text: '第一節課，老師沒有點任何人的名字，只對全班說：\n「故意用聲音嚇人、騙人看笑話，都是霸凌。我們不這樣對待同學。」' },
  { k: 'if', flag: 'toldMom', then: [
    { speaker: 'narrator', emo: 'happy', text: '你想起爸爸早上幫你放進書包的耳塞盒。',
      effect: { courage: 5 } },
  ] },
  { bg: 'classroom', chars: [{ id: 'qing', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '放學前，大家在走廊排路隊。' },
  { bg: 'classroom', chars: [{ id: 'qing', x: 52, emo: 'surprised' }, { id: 'azhe', x: 140, emo: 'happy' }],
    speaker: 'azhe', text: '小晴！你記得每個人的號碼對不對？可以幫我看棒次名單嗎？' },
  { speaker: 'azhe', text: '我常常看漏，怕明天排錯。',
    effect: { courage: 20, kind: 1 } },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「七號是冠宇，八號是阿明。你寫反了。」',
      effect: { courage: 5 },
      then: [
        { speaker: 'qing', emo: 'neutral', text: '七號是冠宇，八號是阿明。你寫反了。' },
        { speaker: 'azhe', emo: 'happy', text: '哇，你一眼就看出來了！太厲害了！', inner: '數字和順序，我不會記錯。' },
      ] },
    { text: '「你跑步的時候，會覺得槍聲很大聲嗎？」', need: 20, flag: 'friend',
      fear: '問了，他會不會覺得我只在乎自己的耳朵？',
      effect: { courage: 10 },
      then: [
        { speaker: 'qing', emo: 'neutral', text: '你跑步的時候，會覺得槍聲很大聲嗎？' },
        { speaker: 'azhe', emo: 'neutral', text: '會啊，心臟會砰砰跳！我都只看前面的旗子。' },
        { speaker: 'azhe', emo: 'happy', text: '明天我們都只看前面，一起衝！' },
      ] },
    { text: '把名單拿過來，把缺的號碼補整齊。',
      then: [
        { speaker: 'narrator', text: '你把每個數字寫得方方正正。' },
        { speaker: 'azhe', emo: 'happy', text: '字好整齊喔，謝謝你！', inner: '整齊的名單，很漂亮。' },
      ] },
  ] },
];

// 運動會：只有一個結局。跑道邊的耳語在每條路徑都一樣
const ENDING = [
  { k: 'day', day: '週六', title: '第四棒', bg: 'sportsday' },
  { bg: 'sportsday', chars: [{ id: 'qing', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '運動會的操場好吵。你戴著耳塞，尖叫聲變成了軟軟的悶響。' },
  { speaker: 'narrator', text: '跑道邊有人小聲說：「她也要跑接力喔？」',
    inner: '大隊接力，全班每個人都要跑。我也是。' },
  { k: 'if', flag: 'toldMom', then: [
    { bg: 'sportsday', chars: [{ id: 'qing', x: 52, emo: 'surprised' }, { id: 'dadQ', x: 140, emo: 'happy' }],
      speaker: 'narrator', text: '你看到爸爸站在圍欄邊，對你比了一個「三角龍衝鋒」。' },
  ] },
  { bg: 'sportsday', chars: [{ id: 'qing', x: 52, emo: 'neutral' }, { id: 'xiaoyu', x: 140, emo: 'happy' }],
    speaker: 'narrator', text: '第三棒的小雨衝過來了。你在心裡數著步伐。' },
  { bg: 'sportsday', chars: [{ id: 'qing', x: 52, emo: 'happy' }, { id: 'azhe', x: 140, emo: 'happy' }],
    speaker: 'narrator', text: '啪！接力棒穩穩落進你的手心。你照著固定的步伐，直直往前衝。' },
  { speaker: 'azhe', text: '小晴，直線加速！好棒！' },
  { k: 'if', flag: 'friend', then: [
    { speaker: 'azhe', text: '只看前面就好！我說的沒錯吧！' },
  ] },
  { speaker: 'narrator', emo: 'happy', text: '你把接力棒交給第五棒的阿凱。',
    inner: '一百二十步，任務完成。' },
  { bg: 'sportsday', chars: [{ id: 'qing', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'happy' }],
    speaker: 'teacher', text: '小晴，跑得好穩！下禮拜一午休，要不要來找老師聊恐龍？',
    inner: '吵鬧的世界裡，我也跑出了自己的直線。' },
];

export default {
  id: 'qing',
  name: '小晴',
  blurb: '最喜歡恐龍，記得每個人的生日。對聲音很敏感。',
  pronoun: '她',
  story: STORY,
  ending: ENDING,
};
