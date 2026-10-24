// 阿凱的故事：喜歡跳舞、說話輕聲，性別氣質不符合刻板印象
//
// 描寫原則：不讓畫面出現性別貶抑的綽號，用「模仿動作」「男生跳什麼舞」這類行為和偏見呈現排擠
// 針對性別特質的霸凌可能屬於《性別平等教育法》的性霸凌：老師要通報，並由學校性平會處理
// 跳舞是阿凱的力量；家人是開修改衣服店的阿嬤（隔代教養）

const CLASS_CHARS = (you = 'neutral', zh = 'neutral') => [
  { id: 'kai', x: 52, emo: you },
  { id: 'zhihao', x: 140, emo: zh },
];

const STORY = [
  // ---------------- 週一 ----------------
  { k: 'day', day: '週一', title: '走廊上的舞步', bg: 'classroom',
    recap: '阿凱在走廊練運動會的進場舞。志豪故意學他扭腰甩手，圍觀的人跟著笑。',
    diary: ['今天大家在走廊看著你笑的時候，你心裡最在意什麼？'],
    help: [
      { text: '走過去問他：「這一步怎麼跳？可以教我嗎？」', result: '他愣了一下，放慢動作教你。走廊的笑聲停了。' },
      { text: '跟志豪說：「舞跳得好本來就很厲害。」', result: '志豪撇撇嘴回教室了。圍觀的人也散了。' },
      { text: '下課跟他說：「你的舞步真的很俐落。」', result: '他笑了一下，緊繃的肩膀放鬆了。' },
      { text: '不跟著起鬨模仿', result: '起鬨的聲音少了一個。阿凱看到你沒有在笑。' },
    ] },
  { bg: 'classroom', chars: [{ id: 'kai', x: 52, emo: 'happy' }, { id: 'teacher', x: 140, emo: 'happy' }],
    speaker: 'narrator', text: '你叫阿凱，五年三班。你喜歡音樂，更喜歡跳舞。' },
  { speaker: 'narrator', text: '放學後，你常在阿嬤的修改衣服店，對著大鏡子練習。' },
  { speaker: 'teacher', text: '運動會的進場舞，阿凱節奏感很好，請他當編舞小老師！' },
  { bg: 'classroom', chars: [{ id: 'kai', x: 52, emo: 'happy' }],
    speaker: 'narrator', text: '午休後的走廊，你忍不住對著窗戶的倒影練動作。' },
  { bg: 'classroom', chars: CLASS_CHARS('surprised', 'happy'),
    speaker: 'zhihao', text: '（捏著嗓子扭腰）哎唷～男生跳什麼舞啦，大家快來看！',
    effect: { courage: -10, witness: 6 } },
  { speaker: 'class', emo: 'sad', text: '（幾個男生圍過來，跟著甩手怪笑。）' },
  { speaker: 'narrator', emo: 'sad', text: '你想把手收進口袋，可是身體好像僵住了。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '馬上停下來，低頭走回教室。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你衝回座位，趴在桌上假裝睡覺。', inner: '只要我不跳，就不會被注意了……' }] },
    { text: '假裝在搞笑，故意跳得很滑稽。',
      effect: { courage: -5 },
      then: [
        { speaker: 'kai', emo: 'happy', text: '哈哈，對啊，我在演小丑啦！' },
        { speaker: 'narrator', emo: 'sad', text: '大家笑得更大聲了。', inner: '為什麼喜歡的事，要變成笑話才能過關？' },
      ] },
    { text: '跟志豪說：「跳舞是運動，不要這樣學人。」', need: 55, flag: 'stoodUp',
      fear: '如果我回嘴，他們會不會叫男生都不要理我？',
      then: [
        { speaker: 'kai', emo: 'angry', text: '跳舞是運動。請你不要這樣學別人。' },
        { speaker: 'zhihao', emo: 'happy', text: '好啦好啦，大明星脾氣真大。' },
        { speaker: 'narrator', emo: 'sad', text: '他揮揮手走開了。', inner: '我的手在發抖。可是我把話說清楚了。' },
      ] },
  ] },

  // ---------------- 週二 ----------------
  { k: 'day', day: '週二', title: '分隊', bg: 'track',
    recap: '體育課，老師去拿球，男生自己分隊。志豪說阿凱「力氣那麼小」，叫他去女生那組。',
    diary: ['大家把你推出男生那一組的時候，你心裡有什麼感覺？'],
    help: [
      { text: '舉手說：「阿凱來我們這隊，他跑很快！」', result: '阿凱眼睛亮了起來。那節課，你們傳球傳得很順。' },
      { text: '跟大家說：「每個人都要練，輪流分組啦。」', result: '隊長抓抓頭，把阿凱寫進名單。' },
      { text: '下課找阿凱在操場邊一起練傳球', result: '你們傳了十幾球。阿凱笑著說，踢球也滿好玩的。' },
      { text: '告訴老師，分組時有人被故意落下', result: '老師說：「下次照座號分組，不讓少數人決定。」' },
    ] },
  { bg: 'track', chars: [{ id: 'kai', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'happy' }],
    speaker: 'teacher', text: '今天練傳接棒和傳球！老師去器材室拿球，男生先自己分隊。' },
  { bg: 'track', chars: [{ id: 'kai', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '男生們馬上推來推去猜拳。你站在旁邊。' },
  { bg: 'track', chars: CLASS_CHARS('sad', 'happy'),
    speaker: 'zhihao', text: '我們滿了啦！你去女生那組，你力氣那麼小，很難傳耶。',
    effect: { courage: -10, witness: 7 } },
  { speaker: 'class', text: '（有人小聲說：「其實他跑滿快的啊……」可是沒有人大聲說。）' },
  { speaker: 'narrator', emo: 'sad', text: '你站在太陽底下，看著大家把球踢來踢去。',
    inner: '我是男生啊。為什麼男生那邊總是把我推開？' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '走到樹蔭下坐著看。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你默默坐到司令台旁邊。', inner: '如果不用上體育課，學校其實沒那麼討厭。' }] },
    { text: '說：「我今天腳痠，本來就不想踢。」',
      effect: { courage: -10 },
      then: [
        { speaker: 'kai', emo: 'neutral', text: '反正我今天腳痠，本來就不想踢。' },
        { speaker: 'narrator', emo: 'sad', text: '志豪聳聳肩，繼續踢球。', inner: '我為什麼要說謊？我明明穿了球鞋。' },
      ] },
    { text: '走到另一組問：「你們還差一個人嗎？」', need: 35,
      fear: '如果連這一組都不要我，我會好丟臉。',
      effect: { courage: 10 },
      then: [
        { speaker: 'kai', emo: 'neutral', text: '你們這組是不是少一個？我可以跑邊路。' },
        { speaker: 'narrator', text: '組長看了看你：「好啊，那你負責接應！」' },
        { speaker: 'narrator', emo: 'happy', text: '那場練習，你接住了兩次回傳。',
          inner: '這一組讓我加入了。可是一開始被推開，還是好難受。' },
      ] },
  ] },

  // ---------------- 週三（好的一天：連續兩天被欺負之後，這一天不會再被欺負）----------------
  // 同一幕也出現在小晴的故事裡（小晴幫忙數拍子）
  { k: 'day', day: '週三', title: '彩排', bg: 'track',
    diary: ['今天大家跟著你跳的時候，你心裡是什麼感覺？'],
    recap: '進場舞第一次全班彩排。阿凱帶大家跳，還請拍子最準的小晴幫忙數拍子。',
    help: [
      { text: '跟著他的動作認真跳', result: '你們這一排，是跳得最整齊的一排。' },
      { text: '跟他說：「你教得好清楚！」', result: '他笑了：「那我們再來一次！」' },
      { text: '幫他把音樂調大聲一點', result: '音樂一響，大家都跟著拍子動起來了。' },
      { text: '下課請他再教你一個動作', result: '他放慢速度，一拍一拍教你。' },
    ] },
  { bg: 'track', chars: [{ id: 'kai', x: 52, emo: 'happy' }, { id: 'teacher', x: 140, emo: 'happy' }],
    speaker: 'teacher', text: '今天全班第一次彩排進場舞！阿凱，交給你帶。' },
  { speaker: 'narrator', text: '你站到隊伍前面，深吸一口氣。' },
  { speaker: 'narrator', emo: 'happy', text: '音樂響起。你數著拍子，全班跟著你一起動。' },
  { bg: 'track', chars: [{ id: 'kai', x: 52, emo: 'surprised' }, { id: 'qing', x: 140, emo: 'neutral' }],
    speaker: 'qing', text: '第三小節慢了半拍。第五小節快了半拍。' },
  { speaker: 'narrator', text: '你一聽就知道，她說的都對。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '「小晴，你可以幫我數拍子嗎？」',
      effect: { courage: 5 },
      then: [
        { speaker: 'kai', emo: 'happy', text: '小晴，你的拍子最準。可以幫我數嗎？' },
        { speaker: 'qing', emo: 'neutral', text: '好。一、二、三、四。每一拍都一樣長。', inner: '兩個人一起，可以做得更好。' },
      ] },
    { text: '照她說的，把那兩小節再練一次。',
      effect: { courage: 5 },
      then: [{ speaker: 'narrator', emo: 'happy', text: '你們把那兩小節重練一次，真的整齊多了。', inner: '她聽得好仔細。' }] },
    { text: '跟她說：「謝謝你，好厲害。」',
      then: [
        { speaker: 'kai', emo: 'happy', text: '謝謝你，你好厲害。' },
        { speaker: 'qing', emo: 'neutral', text: '不客氣。我喜歡準確的東西。' },
      ] },
  ] },
  { bg: 'track', chars: [{ id: 'kai', x: 52, emo: 'happy' }, { id: 'guanyu', x: 140, emo: 'happy' }],
    speaker: 'class', anim: 'jump', text: '（跳完的時候，大家都拍手了。有人喊：「阿凱，帥喔！」）',
    effect: { courage: 5, kind: 1 } },
  { speaker: 'narrator', emo: 'happy', text: '今天，沒有人學你的動作。', inner: '如果每天都像今天就好了。' },

  // ---------------- 週四（白天在學校，晚上和家人）----------------
  { k: 'day', day: '週四', title: '金色彩帶', bg: 'classroom',
    diary: ['有人拿你喜歡的事開玩笑時，你最想對他說什麼？', '看著疼你的家人，今天有哪一句話最難說出口？'],
    recap: '做進場道具時，志豪拿走阿凱帶來的金色彩帶，綁在掃把上亂揮，說「男生拿彩帶很怪耶」。晚上，阿嬤夾了煎魚給阿凱，問他練舞順不順利。他看著阿嬤的手，不知道要不要說。',
    help: [
      { text: '幫他從材料箱找一卷新的金色彩帶', result: '阿凱看著你。你們一起把花環綁好了。' },
      { text: '跟志豪說：「那是全班表演要用的，還他。」', result: '志豪把彩帶丟回桌上，沒再多說。' },
      { text: '傳訊息給他：「明天的進場走位，你排得超清楚！」', result: '他回了一個比讚的貼圖。' },
      { text: '決定明天早上約他在校門口一起練舞', result: '隔天在校門口看到你，他開心地小跑步過來。' },
    ] },
  { bg: 'classroom', chars: [{ id: 'kai', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'happy' }],
    speaker: 'teacher', text: '請大家把進場的舞圈綁上彩帶。老師去辦公室拿膠帶，馬上回來。' },
  { bg: 'classroom', chars: [{ id: 'kai', x: 52, emo: 'happy' }],
    speaker: 'narrator', text: '你帶來阿嬤幫全班剪好的金色彩帶。轉身拿剪刀時，桌上空了。' },
  { bg: 'classroom', chars: CLASS_CHARS('surprised', 'happy'),
    speaker: 'zhihao', text: '（把彩帶綁在掃把上亂揮）男生拿彩帶揮來揮去，很怪耶！',
    effect: { courage: -10, witness: 5 } },
  { speaker: 'class', text: '（幾個人轉頭看，可是沒有人上前拿回來。）' },
  { speaker: 'narrator', emo: 'sad', text: '那是阿嬤昨晚戴著老花眼鏡，一條一條剪好的。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '算了，用鉛筆盒裡的塑膠繩代替。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你一聲不吭，用塑膠繩草草綁好。', inner: '阿嬤昨天剪得那麼整齊……' }] },
    { text: '等老師回來，跟老師說道具被拿走了。', need: 25, flag: 'toldTeacher',
      fear: '被大家看到，會不會說我愛打小報告？',
      effect: { courage: 5 },
      then: [
        { speaker: 'kai', emo: 'sad', text: '老師，進場要用的彩帶被拿去玩了。' },
        { speaker: 'teacher', emo: 'neutral', text: '謝謝你告訴老師。老師會處理，也不會說是你講的。' },
        { speaker: 'narrator', text: '下課前，彩帶回到了你的桌上。' },
      ] },
    { text: '伸出手說：「請還給我，這是我阿嬤準備的。」', need: 55,
      fear: '如果他當著大家的面扯壞它，我該怎麼辦？',
      then: [
        { speaker: 'kai', emo: 'angry', text: '請你還給我。這是我阿嬤昨晚幫全班剪的。' },
        { speaker: 'zhihao', emo: 'neutral', text: '還你就還你，兇什麼。' },
        { speaker: 'narrator', text: '他把彩帶丟回桌上。', inner: '阿嬤的心意，我要好好守住。' },
      ] },
  ] },
  { bg: 'classroom', chars: [{ id: 'kai', x: 52, emo: 'surprised' }, { id: 'guanyu', x: 140, emo: 'neutral' }],
    speaker: 'narrator', text: '午休前，前排的冠宇轉過頭，放了一卷雙面膠在你桌上。' },
  { speaker: 'guanyu', text: '（小聲）這個很好黏。你做的花環很好看。',
    effect: { courage: 5, kind: 1 } },

  // 晚上
  { bg: 'home', chars: [{ id: 'kai', x: 64, emo: 'neutral' }, { id: 'grandma', x: 128, emo: 'happy' }],
    speaker: 'narrator', text: '店裡的熨斗還在冒蒸氣。阿嬤把一塊煎魚夾進你的碗裡。' },
  { speaker: 'grandma', text: '阿凱，今天練舞順利嗎？怎麼一進門就在發呆？' },
  { speaker: 'narrator', text: '你看著阿嬤手指上的針痕。',
    inner: '走廊的笑聲、分隊、被拿走的彩帶……' },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「沒事啦，今天排練比較久，有點累。」',
      effect: { courage: -5 },
      then: [
        { speaker: 'kai', emo: 'happy', text: '沒事啦，今天排練比較久，腳有點痠。', inner: '阿嬤做衣服已經很辛苦了。' },
        { speaker: 'grandma', emo: 'happy', text: '那就多吃一點！阿嬤煎了你最愛的魚。' },
      ] },
    { text: '「阿嬤……男生喜歡跳舞，很奇怪嗎？」', need: 20,
      fear: '阿嬤會不會也覺得，我不像一般男生？',
      then: [
        { speaker: 'kai', emo: 'sad', text: '阿嬤，男生跳舞……真的很怪嗎？' },
        { speaker: 'grandma', emo: 'surprised', text: '傻孩子，電視上很多厲害的舞者都是男生啊。' },
        { speaker: 'grandma', emo: 'happy', text: '跳得好是你的本事，哪裡怪？',
          effect: { courage: 5, kind: 1 } },
      ] },
    { text: '把學校發生的事都告訴阿嬤。', need: 30, flag: 'toldMom',
      fear: '阿嬤要是去學校找老師，大家會不會更排擠我？',
      then: [
        { speaker: 'kai', emo: 'cry', text: '阿嬤……同學一直學我的動作，分組也故意不要我。' },
        { speaker: 'grandma', emo: 'sad', text: '……謝謝你告訴阿嬤。這不是你的錯。' },
        { speaker: 'grandma', emo: 'neutral', text: '明天阿嬤寫聯絡簿給林老師。你不用一個人面對。',
          effect: { courage: 15, kind: 1 } },
      ] },
  ] },

  // ---------------- 週五 ----------------
  { k: 'day', day: '週五', title: '窗戶當鏡子', bg: 'classroom',
    recap: '林老師私下找阿凱談，說會請學校性平會一起處理。放學後，品妤來找他練舞。',
    diary: ['今天有哪一刻，讓你覺得心裡的大石頭放下了？'],
    help: [
      { text: '練跑時在他後面喊加油', result: '阿凱回頭對你點點頭，腳步更穩了。' },
      { text: '幫他整理進場要用的花環', result: '花環排得整整齊齊，省下好多彩排時間。' },
      { text: '問他：「明天的進場舞，我們再順一次好嗎？」', result: '他眼睛亮了：「好啊！第三小節轉圈要聽鼓聲。」' },
      { text: '放學陪他走到公車站', result: '你們聊了一路喜歡的歌，他笑得很開心。' },
    ] },
  { bg: 'classroom', chars: [{ id: 'kai', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'neutral' }],
    speaker: 'narrator', text: '早自習的時候，林老師把你叫到走廊上。' },
  { speaker: 'teacher', text: '阿凱，老師這幾天有注意到，有同學一直學你的動作取笑你。' },
  { k: 'if', flag: 'toldMom', then: [
    { speaker: 'teacher', text: '阿嬤昨天也在聯絡簿寫給老師了。謝謝你願意告訴阿嬤。' },
  ] },
  { k: 'if', flag: 'toldTeacher', then: [
    { speaker: 'teacher', text: '也謝謝你昨天來告訴老師彩帶的事。' },
  ] },
  { speaker: 'teacher', text: '拿別人的性別特質取笑人，學校會很認真處理。' },
  { speaker: 'teacher', text: '老師今天會通報，學校的性平會也會一起幫忙。' },
  { speaker: 'teacher', text: '只有需要知道的老師會知道，你不用一直重講。' },
  { speaker: 'teacher', emo: 'happy', text: '這不是你的錯。喜歡跳舞，一點問題都沒有。',
    effect: { courage: 10, kind: 1 } },
  { speaker: 'narrator', text: '第一節課，老師沒有點任何人的名字，只對全班說：\n「每個人都可以有自己的樣子。拿性別取笑人，就是霸凌。」' },
  { k: 'if', flag: 'toldMom', then: [
    { speaker: 'narrator', emo: 'happy', text: '你想起昨天晚上，阿嬤摸你頭的手。',
      effect: { courage: 5 } },
  ] },
  { bg: 'classroom', chars: [{ id: 'kai', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '放學後，大家陸續背起書包。' },
  { bg: 'classroom', chars: [{ id: 'kai', x: 52, emo: 'surprised' }, { id: 'pinyu', x: 140, emo: 'happy' }],
    speaker: 'pinyu', text: '阿凱！明天進場那個踏步，可以再教我一次嗎？' },
  { speaker: 'pinyu', text: '你跳起來超有自信的，我也想跳得跟你一樣。',
    effect: { courage: 20, kind: 1 } },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「……好啊，我們去走廊對著窗戶練。」',
      effect: { courage: 5 },
      then: [
        { speaker: 'kai', emo: 'happy', text: '好啊……走廊的窗戶可以當鏡子。' },
        { speaker: 'narrator', emo: 'happy', text: '品妤很認真地跟著你數拍子。', inner: '原來我的舞，可以幫到別人。' },
      ] },
    { text: '「你這幾天，是不是也被她們不理？」', need: 20, flag: 'friend',
      fear: '問這個，會不會戳到她的痛處？',
      effect: { courage: 10 },
      then: [
        { speaker: 'kai', emo: 'neutral', text: '你這幾天……是不是也被她們不理？' },
        { speaker: 'pinyu', emo: 'sad', text: '嗯，因為我幫阿明說了一句話。可是我不後悔。' },
        { speaker: 'pinyu', emo: 'happy', text: '明天，我們一起把舞跳好！' },
      ] },
    { text: '點點頭，幫她調整手臂的角度。',
      then: [{ speaker: 'narrator', emo: 'happy', text: '你們把最後八拍順得整整齊齊。', inner: '被信任的感覺，真好。' }] },
  ] },
];

// 運動會：只有一個結局。旁邊別班的耳語在每條路徑都一樣
const ENDING = [
  { k: 'day', day: '週六', title: '運動會的節奏', bg: 'sportsday' },
  { bg: 'sportsday', chars: [{ id: 'kai', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '開幕進場。你胸前別著阿嬤用金線縫好的小花環。' },
  { speaker: 'narrator', text: '旁邊別班有人小聲說：「你看三班前面那個男生……」',
    inner: '不要管雜音。跟著節奏走。' },
  { k: 'if', flag: 'toldMom', then: [
    { bg: 'sportsday', chars: [{ id: 'kai', x: 52, emo: 'surprised' }, { id: 'grandma', x: 140, emo: 'happy' }],
      speaker: 'narrator', anim: 'cheer', text: '你看到阿嬤穿著花襯衫，在跑道外用力揮著手帕。' },
  ] },
  { bg: 'sportsday', chars: [{ id: 'kai', x: 52, emo: 'happy' }, { id: 'pinyu', x: 140, emo: 'happy' }],
    speaker: 'narrator', anim: 'jump', text: '音樂響起。你踏出第一步，全班跟著你的節奏一起動。' },
  { speaker: 'pinyu', anim: 'cheer', text: '阿凱，節奏超棒！' },
  { k: 'if', flag: 'friend', then: [
    { speaker: 'pinyu', text: '我們是最有氣勢的一班！' },
  ] },
  { speaker: 'narrator', text: '志豪在隊伍後面跟著跳完了。這一次，他沒有再學你。' },
  { speaker: 'narrator', emo: 'happy', anim: 'run', text: '大隊接力，你跑第五棒。接過棒子，你像風一樣衝出去。',
    inner: '這就是我的力量。' },
  { bg: 'sportsday', chars: [{ id: 'kai', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'happy' }],
    speaker: 'teacher', text: '阿凱，跳得真好！下禮拜一午休，要不要來找老師聊聊？',
    inner: '這個禮拜很辛苦。可是我喜歡現在的自己。' },
];

export default {
  id: 'kai',
  name: '阿凱',
  blurb: '喜歡跳舞，說話輕聲。跟著音樂就停不下來。',
  story: STORY,
  ending: ENDING,
};
