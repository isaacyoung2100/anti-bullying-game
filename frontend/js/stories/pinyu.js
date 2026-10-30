// 品妤的故事：普通的學生，因為替阿明說了一句話，被原本的小團體排擠
//
// 描寫原則：誠實呈現挺身而出後的壓力，但不能讓孩子學到「幫別人會倒楣，所以不要幫」：
// 她心裡清楚自己沒有做錯，姊姊、老師和阿明都肯定她的那一句話，普通同學冠宇也在她身邊
// 家人是常加班的爸媽和讀國二的姊姊（雙薪家庭）
// 週一走廊這一幕也出現在阿明的故事裡

// 週二晚上的小群組（手機畫面）：問了問題，已讀 4，然後被移出群組
const ASK = { me: true, text: '大隊接力要綁什麼顏色的髮圈？' };
const SPARKLE = (...more) => ({ title: '閃亮五人組', sub: '5 人', msgs: [
  { from: '欣儀', text: '明天見～' },
  { from: '佳佳', sticker: '💖' },
  ...more,
] });

const STORY = [
  // ---------------- 週一 ----------------
  { k: 'day', day: '週一', title: '開口之後', bg: 'classroom',
    recap: '下課時，志豪在走廊叫阿明「外星阿明」，品妤說了一句「亂取綽號很幼稚」。之後，她的好朋友不理她了。',
    diary: ['你替別人說了一句話，卻換來朋友冷淡的眼神。你心裡在想什麼？'],
    help: [
      { text: '下課跟她說：「你剛才替阿明說話，超帥的。」', result: '品妤鬆了一口氣，表情放鬆下來。' },
      { text: '邀她一起去福利社買文具', result: '你們一起走出教室，她不用一個人了。' },
      { text: '跟不理她的人說：「大家都是同學，幹嘛這樣。」', result: '那幾個女生有點尷尬地散開了。' },
      { text: '偷偷在她鉛筆盒放一張打氣的小紙條', result: '品妤看到紙條，偷偷收進口袋。' },
    ] },
  { bg: 'classroom', chars: [{ id: 'pinyu', x: 52, emo: 'happy' }, { id: 'jiajia', x: 140, emo: 'happy' }],
    speaker: 'narrator', text: '你叫品妤，五年三班。你喜歡和佳佳、欣儀一起聊偶像和文具。' },
  { speaker: 'narrator', text: '你覺得自己很普通。成績普通，個性也普通。' },
  { bg: 'classroom', chars: [{ id: 'pinyu', x: 52, emo: 'neutral' }, { id: 'zhihao', x: 140, emo: 'happy' }],
    speaker: 'narrator', text: '下課的走廊上，志豪又對著阿明說：「外星阿明。」' },
  { speaker: 'class', text: '（旁邊的人都在笑。阿明的臉漲得紅紅的。）' },
  { speaker: 'pinyu', emo: 'angry', text: '志豪，亂取綽號很幼稚耶，一點都不好笑。' },
  { speaker: 'narrator', text: '志豪翻了一個白眼，走開了。' },
  { bg: 'classroom', chars: [{ id: 'pinyu', x: 52, emo: 'neutral' }, { id: 'xinyi', x: 140, emo: 'angry' }],
    speaker: 'narrator', text: '你轉身想找欣儀和佳佳去廁所，她們卻收起了笑容。' },
  { speaker: 'xinyi', text: '（小聲）幹嘛那麼愛出風頭啊，很掃興耶。',
    effect: { courage: -10, witness: 5 } },
  { speaker: 'narrator', emo: 'sad', zoom: true, text: '她們手牽手走出教室，沒有等你。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '追上去說：「好啦，我剛剛隨便講講的。」',
      effect: { courage: -10 },
      then: [
        { speaker: 'pinyu', emo: 'happy', text: '哎呀，我剛剛只是隨便說說啦。' },
        { speaker: 'xinyi', emo: 'neutral', text: '隨便啊。', inner: '我明明沒做錯事，為什麼要道歉？' },
      ] },
    { text: '不追上去，到走廊窗邊吹吹風，讓自己冷靜。',
      then: [{ speaker: 'narrator', emo: 'neutral', text: '你站在走廊的窗邊，深深吸了一口氣。', inner: '我說的話沒有錯。先讓自己冷靜下來。' }] },
    { text: '跟欣儀說：「我只是覺得那樣不好笑。」', need: 50, flag: 'stoodUp',
      fear: '如果我講開，她們會不會把我踢出群組？',
      then: [
        { speaker: 'pinyu', emo: 'neutral', text: '我只是覺得笑別人不好。我沒有要跟你們吵架。' },
        { speaker: 'xinyi', emo: 'angry', text: '哼。' },
        { speaker: 'narrator', text: '佳佳回頭看了你一眼，好像想說什麼。', inner: '我站穩了。我沒有騙自己。' },
      ] },
    { text: '大聲回她：「你們才掃興！只會一起笑別人！」', flag: 'talkedBack',
      effect: { courage: -5 },
      then: [
        { speaker: 'pinyu', emo: 'angry', anim: 'shake', text: '你們才掃興！只會一起笑別人！' },
        { speaker: 'xinyi', emo: 'neutral', text: '（轉頭跟其他女生說）你看，她就是這麼兇。' },
        { speaker: 'narrator', emo: 'sad', text: '走廊上的人都轉過來看你。佳佳把頭轉開了。',
          inner: '我說的沒錯……可是現在大家只記得我很兇。' },
      ] },
  ] },
  // 背景一瞥（不影響能量和分支）
  { speaker: 'narrator', glimpse: 'azhe', seenEmo: 'sad', text: '數學課，你看見阿哲在書包裡翻了好久，耳朵都紅了。',
    react: [
      { text: '小聲說：「要不要看看前面的夾層？」', result: '阿哲翻了翻，還是沒找到，可是沒那麼慌了。' },
      { text: '推一張便利貼給他，寫「沒關係」。', result: '阿哲看了好久，把它收進口袋。' },
      { text: '轉頭看黑板，假裝很專心。', result: '今天發生太多事，你什麼都不想管。', none: true },
    ] },

  // ---------------- 週二 ----------------
  { k: 'day', day: '週二', title: '已讀的群組', bg: 'home',
    recap: '晚上，品妤在好朋友的小群組問問題，大家已讀不回。後來，欣儀把她移出了群組。',
    diary: ['看著「已讀 4」，卻沒有人回你。那種安靜讓你覺得怎麼樣？'],
    help: [
      { text: '私訊她：「進場的髮圈，我們這組想問你意見！」', result: '她馬上回了，你們聊了好久。' },
      { text: '在大群組回她的訊息，不讓她被晾著', result: '有人開始回話，她不再是一個人在講話。' },
      { text: '把踢人的畫面截圖給老師看', result: '隔天，輔導老師找了相關的同學聊一聊。' },
      { text: '隔天早上在校門口等她一起進教室', result: '看到你在等她，她的腳步變輕快了。' },
    ] },
  { bg: 'home', chars: [{ id: 'pinyu', x: 48, emo: 'neutral' }],
    phone: SPARKLE(), speaker: 'narrator', text: '晚上八點。平常響個不停的「閃亮五人組」群組，突然好安靜。' },
  { speaker: 'narrator', phone: SPARKLE(ASK), text: '你在群組問：「大隊接力要綁什麼顏色的髮圈？」' },
  { speaker: 'narrator', emo: 'sad', phone: SPARKLE({ ...ASK, seen: 4 }), text: '「已讀 4」。過了十分鐘，沒有人回。然後跳出一行字：' },
  { speaker: 'narrator', emo: 'cry', anim: 'shake', phone: SPARKLE({ ...ASK, seen: 4 }, { system: '欣儀 已將 品妤 移出群組' }), text: '「欣儀 已將 品妤 移出群組。」',
    effect: { courage: -15, witness: 4 } },
  { speaker: 'narrator', emo: 'sad', text: '房間裡，只剩下時鐘的滴答聲。你的手心好冰。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '把群組關成靜音，去洗個熱水澡。',
      then: [{ speaker: 'narrator', emo: 'neutral', phone: { off: true }, text: '你把通知關掉，去洗了一個很久的熱水澡。', inner: '今天先到這裡。明天的事，明天再想。' }] },
    { text: '把手機關機，用棉被蒙住頭。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'cry', phone: { off: true }, text: '你把手機丟在桌上，縮進被子裡。', inner: '我只是說了一句對的話。為什麼這麼難受？' }] },
    { text: '把被移出群組的畫面截圖存起來。', need: 40,
      fear: '截圖存起來，會不會顯得我很愛計較？',
      effect: { courage: 5 },
      then: [
        { speaker: 'narrator', phone: SPARKLE({ ...ASK, seen: 4 }, { system: '欣儀 已將 品妤 移出群組' }, { toast: '截圖已儲存' }), text: '你按下截圖，把時間和畫面都存了下來。' },
        { speaker: 'narrator', text: '（被排擠時把畫面存下來，之後找大人幫忙會比較清楚。）',
          inner: '排擠人是她們的問題，不是我變差了。' },
      ] },
  ] },
  { bg: 'home', chars: [{ id: 'pinyu', x: 48, emo: 'surprised' }],
    phone: { title: '五年三班', sub: '32 人', msgs: [{ from: '冠宇', text: '品妤，明天小考的重點，可以借我對一下筆記嗎？' }] },
    speaker: 'narrator', text: '手機震了一下。是冠宇在班級大群組問你：\n「品妤，明天小考的重點，可以借我對一下筆記嗎？」',
    effect: { courage: 5, kind: 1 } },
  { speaker: 'narrator', emo: 'happy', text: '只是一句普通的話。可是你覺得暖暖的。' },

  // ---------------- 週三（好的一天：連續兩天被欺負之後，這一天不會再被欺負）----------------
  // 同一幕也出現在小雨的故事裡
  { k: 'day', day: '週三', title: '跟小雨學起跑', bg: 'track',
    diary: ['今天和新朋友在一起的時候，你心裡是什麼感覺？'],
    recap: '體育課計時，品妤跑去請跑最快的小雨教她起跑。兩個人一起練了好久。',
    help: [
      { text: '也加入她們一起練起跑', result: '三個人一起數「預備——砰」，笑成一團。' },
      { text: '跟她說：「你剛剛快了一秒耶！」', result: '她驚訝地看著你：「真的嗎？」' },
      { text: '下課找她一起去喝水', result: '她跟你說，小雨其實很會講笑話。' },
      { text: '幫她們在終點計時', result: '你大聲報出秒數，兩個人一起歡呼。' },
    ] },
  { bg: 'track', chars: [{ id: 'pinyu', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'happy' }],
    speaker: 'narrator', text: '下午體育課計時。你跑完，喘著氣站在終點。' },
  { speaker: 'teacher', text: '小雨，十四秒二，全班最快！' },
  { speaker: 'narrator', text: '你想起來，你從來沒跟小雨說過話。', inner: '要不要過去問她？' },
  { bg: 'track', chars: [{ id: 'pinyu', x: 52, emo: 'happy' }, { id: 'xiaoyu', x: 140, emo: 'neutral' }],
    speaker: 'pinyu', text: '小雨，你怎麼跑那麼快！可以教我起跑嗎？' },
  { speaker: 'xiaoyu', emo: 'happy', text: '好啊。你要先把重心放低，聽到「砰」再衝。',
    effect: { courage: 5, kind: 1 } },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '照著做，再跑一次。',
      effect: { courage: 5 },
      then: [
        { speaker: 'narrator', emo: 'happy', anim: 'run', text: '你蹲低，「砰」一響就衝出去。快了一秒！' },
        { speaker: 'xiaoyu', emo: 'happy', text: '你看，快很多吧！', inner: '換一群人在一起，原來也可以這麼開心。' },
      ] },
    { text: '「明天可以再跟我一起練嗎？」',
      effect: { courage: 5 },
      then: [
        { speaker: 'pinyu', emo: 'neutral', text: '明天可以再跟我一起練嗎？' },
        { speaker: 'xiaoyu', emo: 'happy', text: '好啊，下課的時候。', inner: '我是不是交到新朋友了？' },
      ] },
    { text: '跟她說：「謝謝你，你人好好。」',
      then: [
        { speaker: 'pinyu', emo: 'happy', text: '謝謝你，你人好好。' },
        { speaker: 'narrator', text: '小雨有點不好意思，把外套拉鍊拉下來一點點。' },
      ] },
  ] },
  { speaker: 'narrator', emo: 'happy', text: '今天，你不用想辦法躲開誰。', inner: '如果每天都像今天就好了。' },

  // ---------------- 週四（白天在學校，晚上和家人）----------------
  { k: 'day', day: '週四', title: '午餐的空位', bg: 'classroom',
    diary: ['朋友把你的位子佔走時，你最想轉身去哪裡？', '為了做對的事而覺得孤單時，誰的話能讓你重新站穩？'],
    recap: '午餐時，欣儀把外套放在品妤原本的位子上，說「這裡有人要坐了」。佳佳低著頭沒說話。爸媽加班還沒回家。讀國二的姊姊看到品妤盯著手機發呆，拿了一瓶牛奶坐到她旁邊。',
    help: [
      { text: '端著便當坐到她對面：「這裡有人坐嗎？」', result: '她驚訝地抬起頭，你們聊起了便當的菜。' },
      { text: '跟佔位子的人說：「這桌本來就是四個人的。」', result: '那個女生有點不好意思，把外套拿開了。' },
      { text: '傳訊息給她：「明天練接力，我幫你計時！」', result: '她回了一個笑臉和握拳。' },
      { text: '決定明天早上主動跟她說早安', result: '隔天聽到你的早安，她笑得很開心。' },
    ] },
  { bg: 'classroom', chars: [{ id: 'pinyu', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '午餐時間。以前你都和佳佳、欣儀把桌子併在一起吃。' },
  { bg: 'classroom', chars: [{ id: 'pinyu', x: 52, emo: 'surprised' }, { id: 'xinyi', x: 140, emo: 'neutral' }],
    speaker: 'narrator', text: '你端著便當走過去，欣儀把外套丟在你原本的位子上。' },
  { speaker: 'xinyi', text: '這裡有人要坐了喔，你去別的地方啦。',
    effect: { courage: -10, witness: 6 } },
  { speaker: 'narrator', emo: 'sad', text: '佳佳低著頭戳飯，什麼都沒說。好幾雙眼睛在看你。' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '默默回到自己的位子吃。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你一個人坐在角落。滷肉一點味道都沒有。', inner: '大家都看到我被趕走了，好丟臉……' }] },
    { text: '回自己的位子，打開小說邊吃邊看。',
      then: [{ speaker: 'narrator', emo: 'neutral', text: '你翻到上次看到的那一頁。故事裡的主角，也一個人走過很難的路。',
        inner: '我不用擠進那個位子，也可以好好吃飯。' }] },
    { text: '問阿明：「你旁邊有人坐嗎？」', need: 50, flag: 'satWithAming',
      fear: '坐過去，會不會連我也一起被笑？',
      effect: { courage: 5 },
      then: [
        { speaker: 'pinyu', emo: 'neutral', text: '阿明，你旁邊有人坐嗎？' },
        { bg: 'classroom', chars: [{ id: 'pinyu', x: 52, emo: 'neutral' }, { id: 'aming', x: 140, emo: 'happy' }],
          speaker: 'aming', text: '沒有！可以坐啊！' },
        { speaker: 'narrator', emo: 'happy', text: '阿明把桌上的課本收起來，讓出位子。', inner: '坐在這裡，我覺得心安。' },
      ] },
  ] },
  // 背景一瞥（不影響能量和分支）
  { speaker: 'narrator', glimpse: 'xiaoyu', seenEmo: 'sad', text: '下課時，佳佳發邀請卡走到小雨的座位，停了一秒，又走開了。',
    react: [
      { text: '悄悄放一顆糖在小雨的桌角。', result: '小雨愣了一下，把糖收進口袋。' },
      { text: '走過去時，對小雨點點頭。', result: '小雨看了你一眼，又低下頭。' },
      { text: '把課本收進抽屜，不說話。', result: '你想起被移出群組的那一晚，心裡也酸酸的。', none: true },
    ] },

  // 晚上
  { bg: 'home', chars: [{ id: 'pinyu', x: 64, emo: 'sad' }, { id: 'sister', x: 128, emo: 'neutral' }],
    speaker: 'narrator', text: '晚上八點，爸媽還在公司加班。桌上留著便當錢。' },
  { speaker: 'narrator', text: '讀國二的姊姊洗完澡，看到你盯著手機發呆。她拿了牛奶坐過來。' },
  { speaker: 'sister', text: '是不是女生的小圈圈又在作怪？你的表情跟我國一的時候一樣。' },
  { speaker: 'narrator', text: '你看著很有主見的姊姊。',
    inner: '被踢出群組、位子被佔走、被當成空氣……' },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「沒事啦，女生的小圈圈很無聊。」',
      effect: { courage: -5 },
      then: [
        { speaker: 'pinyu', emo: 'neutral', text: '沒什麼啦，女生的小圈圈就是很煩。' },
        { speaker: 'sister', emo: 'neutral', text: '好吧。想聊隨時說，不要自己憋著。', inner: '我不想讓姊姊覺得，我連朋友都處理不好。' },
      ] },
    { text: '「姊……替別人說話，代價真的這麼大嗎？」', need: 20,
      fear: '姊姊會不會笑我太天真？',
      then: [
        { speaker: 'pinyu', emo: 'sad', text: '姊，替被笑的人說話，真的會倒楣嗎？' },
        { speaker: 'sister', emo: 'neutral', text: '可能會難過一陣子。可是你沒有做錯。' },
        { speaker: 'sister', emo: 'happy', text: '而且，被你幫的人一定會記得。',
          effect: { courage: 5, kind: 1 } },
      ] },
    { text: '把這個禮拜的事，全部告訴姊姊。', need: 30, flag: 'toldMom',
      fear: '承認被排擠，家人會不會覺得我很沒用？',
      then: [
        { speaker: 'pinyu', emo: 'cry', zoom: true, text: '我替阿明說話，欣儀就把大家拉走，還把我踢出群組……' },
        { speaker: 'sister', emo: 'sad', text: '……謝謝你告訴我。這不是你的錯。' },
        { speaker: 'sister', emo: 'neutral', text: '我們跟爸媽說，在聯絡簿寫給老師。這要讓大人知道。',
          effect: { courage: 15, kind: 1 } },
      ] },
  ] },

  // ---------------- 週五 ----------------
  { k: 'day', day: '週五', title: '椰子糖', bg: 'classroom',
    recap: '林老師私下找品妤談，也對全班說排擠就是霸凌。放學後，阿明拿了媽媽做的椰子糖來謝謝她。',
    diary: ['知道「做對的事，有人看在眼裡」的時候，你心裡有什麼變化？'],
    help: [
      { text: '練跑時幫她計時', result: '她衝過終點，開心地跟你擊掌。' },
      { text: '有人斜眼看她時，自然地走到她旁邊', result: '那幾個人轉開了視線。' },
      { text: '問她：「下禮拜要不要一起去圖書館？」', result: '她用力點頭：「好！我正想借小說！」' },
      { text: '陪她一起去學務處送班級日誌', result: '你們沿路聊天，腳步很輕快。' },
    ] },
  { bg: 'classroom', chars: [{ id: 'pinyu', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'neutral' }],
    speaker: 'narrator', text: '早自習的時候，林老師把你叫到走廊上。' },
  { speaker: 'teacher', text: '品妤，老師這幾天有注意到午餐座位和群組的事。' },
  { k: 'if', flag: 'toldMom', then: [
    { speaker: 'teacher', text: '姊姊和爸媽也在聯絡簿寫給老師了。謝謝你願意告訴家人。' },
  ] },
  { k: 'if', flag: 'satWithAming', then: [
    { speaker: 'teacher', text: '昨天你坐到阿明旁邊，老師都看到了。' },
  ] },
  { k: 'if', flag: 'talkedBack', then: [
    { speaker: 'teacher', text: '週一你大聲回她們，老師知道你是被逼急了。' },
    { speaker: 'teacher', text: '生氣沒有錯。下次可以先來找老師，讓老師幫你。' },
  ] },
  { speaker: 'teacher', emo: 'happy', text: '替別人說話很不容易。這不是你的錯，老師會處理。',
    effect: { courage: 10, kind: 1 } },
  { speaker: 'teacher', text: '老師不會讓大家知道是你說的。' },
  { speaker: 'narrator', text: '第一節課，老師沒有點任何人的名字，只對全班說：\n「故意不讓同學一起坐、把人踢出群組，也是霸凌。」' },
  { k: 'if', flag: 'toldMom', then: [
    { speaker: 'narrator', emo: 'happy', text: '你想起昨天晚上，姊姊遞給你的那瓶牛奶。',
      effect: { courage: 5 } },
  ] },
  { time: 'dusk', bg: 'classroom', chars: [{ id: 'pinyu', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '放學打掃完，大家都在收書包。' },
  { time: 'dusk', bg: 'classroom', chars: [{ id: 'pinyu', x: 52, emo: 'surprised' }, { id: 'aming', x: 140, emo: 'happy' }],
    speaker: 'aming', text: '品妤！禮拜一謝謝你替我說話。' },
  { speaker: 'aming', text: '這是我媽媽做的椰子糖，送給你！',
    effect: { courage: 20, kind: 1 } },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「謝謝！我最喜歡椰子糖了！」',
      effect: { courage: 5 },
      then: [{ speaker: 'pinyu', emo: 'happy', text: '謝謝！好香喔，我明天運動會帶去吃！', inner: '原來那一句話，真的被聽見了。' }] },
    { text: '「你這個禮拜，還好嗎？」', need: 20, flag: 'friend',
      fear: '問了，他會不會又想起難過的事？',
      effect: { courage: 10 },
      then: [
        { speaker: 'pinyu', emo: 'neutral', text: '阿明，你這幾天還好嗎？' },
        { speaker: 'aming', emo: 'neutral', text: '好多了！老師有處理，冠宇也有來問我春捲的事。' },
        { speaker: 'aming', emo: 'happy', text: '明天運動會，我們一起大聲喊加油！' },
      ] },
    { text: '收下糖果，用力點點頭。',
      then: [{ speaker: 'narrator', emo: 'happy', text: '夕陽照在桌上，暖暖的。', inner: '這就是有朋友的感覺。' }] },
  ] },
];

// 運動會：只有一個結局。欣儀和佳佳的反應在每條路徑都一樣
const ENDING = [
  { k: 'day', day: '週六', title: '真正的隊伍', bg: 'sportsday',
    recap: '檢錄處，欣儀假裝沒看到品妤；佳佳跟她說「對不起，之前我不敢說話」。品妤跑第六棒，把棒子穩穩交給冠宇。老師約她下禮拜一午休聊聊。' },
  { bg: 'sportsday', chars: [{ id: 'pinyu', x: 52, emo: 'neutral' }, { id: 'xinyi', x: 140, emo: 'neutral' }],
    speaker: 'narrator', text: '大隊接力檢錄處，全班換上了一樣的號碼衣。' },
  { speaker: 'narrator', text: '欣儀走過你旁邊，假裝沒看到你。',
    inner: '沒關係。我知道自己是誰。' },
  { bg: 'sportsday', chars: [{ id: 'pinyu', x: 52, emo: 'surprised' }, { id: 'jiajia', x: 140, emo: 'sad' }],
    speaker: 'jiajia', text: '品妤……對不起，之前我不敢說話。' },
  { speaker: 'narrator', text: '你看著佳佳，點了點頭。' },
  { k: 'if', flag: 'toldMom', then: [
    { bg: 'sportsday', chars: [{ id: 'pinyu', x: 52, emo: 'happy' }, { id: 'sister', x: 140, emo: 'happy' }],
      speaker: 'sister', anim: 'cheer', text: '品妤，衝啊！' },
  ] },
  { bg: 'sportsday', chars: [{ id: 'pinyu', x: 52, emo: 'happy' }, { id: 'aming', x: 140, emo: 'happy' }],
    speaker: 'narrator', anim: 'run', text: '「砰！」\n你是第六棒。從阿凱手中接過棒子，一路往前衝。' },
  { speaker: 'aming', anim: 'cheer', text: '品妤——超帥的！' },
  { k: 'if', flag: 'friend', then: [
    { speaker: 'aming', text: '椰子糖的力量！衝啊！' },
  ] },
  { speaker: 'narrator', emo: 'happy', text: '你把棒子穩穩交給第七棒的冠宇。',
    inner: '我再也不用為了討好誰，假裝沒看見了。' },
  { bg: 'sportsday', chars: [{ id: 'pinyu', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'happy' }],
    speaker: 'teacher', text: '品妤，跑得真好！下禮拜一午休，要不要來找老師聊聊？',
    inner: '這個禮拜很痛。可是我找到了真正的朋友。' },
];

export default {
  id: 'pinyu',
  name: '品妤',
  blurb: '成績普通，個性普通。原本是在旁邊看的那個人。',
  pronoun: '她',
  story: STORY,
  ending: ENDING,
  // 結尾的對照頁「同一天，在別人眼中」：上面是自己週一看到的一瞥，下面是對方那天的真相
  contrast: { who: 'azhe', day: '週一', seen: '數學課，你看見阿哲在書包裡翻了好久，耳朵都紅了。',
    truth: '阿哲前一天明明寫完作業了，只是忘了放進書包。志豪還小聲叫他「過動兒」。',
    lead: '大家看到的是粗心，沒看到他有多想把事情做好。' },
  // 對照頁的第二件：另一則一瞥，那天在對方身上的事
  contrast2: { who: 'xiaoyu', day: '週四', seen: '下課時，佳佳發邀請卡走到小雨的座位，停了一秒，又走開了。',
    truth: '旁邊的女生小聲說：「她哪有錢買禮物。」這個禮拜，小雨的外套已經被笑過好幾次了。',
    lead: '沒收到邀請卡的那一秒，可能不是她第一次被跳過。' },
};
