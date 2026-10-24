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
  { k: 'day', day: '週一', title: '忘記帶的作業本', bg: 'classroom',
    diary: ['志豪叫你「過動兒」的那一刻，你腦中第一個想法是什麼？', '如果可以暫停時間，你希望大家怎麼看你？'],
    recap: '阿哲忘了帶數學作業本。志豪小聲叫他「過動兒」，老師制止了，可是後面還是有人在偷笑。',
    help: [
      { text: '下課陪他去找老師，說他其實有寫完', result: '老師說：「那明天記得帶來就好。」阿哲鬆了一口氣，偷偷對你比了一個讚。' },
      { text: '小聲跟志豪說：「不要這樣叫他。」', result: '志豪聳聳肩，沒有再說話。後面的笑聲停了。' },
      { text: '下課問他：「你昨天是不是有寫完？」', result: '他眼睛亮了起來：「真的有寫完！只是忘在桌上。」' },
      { text: '不跟著笑', result: '後面的笑聲少了一個。阿哲抬頭的時候，看到你沒有在笑。' },
    ] },
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
  { speaker: 'narrator', zoom: true, text: '你感覺到大家都在看你。' },
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
  { k: 'day', day: '週二', title: '起跑線', bg: 'track',
    diary: ['聽到「跟他同一隊很倒楣」時，你的身體有什麼感覺？', '大家把眼睛轉開，你覺得他們心裡在怕什麼？'],
    recap: '練大隊接力時，阿哲起跑太早。志豪說「跟他同一隊真的很倒楣」，有人跟著笑，其他人都把眼睛轉開。',
    help: [
      { text: '跟他說：「我陪你練起跑，我幫你喊『砰』。」', result: '你們練了三次。第三次，他等到「砰」才出發。' },
      { text: '跟大家說：「練習本來就會犯規，再一次啦。」', result: '有幾個人點點頭。志豪沒有再說什麼。' },
      { text: '走到操場角落，坐在他旁邊', result: '你們都沒說話。過了一會兒，他說：「謝謝你過來。」' },
      { text: '下課去告訴老師志豪說的話', result: '老師說：「謝謝你告訴我，老師會注意。」' },
    ] },
  { bg: 'track', chars: [{ id: 'azhe', x: 52, emo: 'happy' }, { id: 'jiajia', x: 140, emo: 'neutral' }],
    speaker: 'jiajia', text: '這禮拜六就是運動會了！今天練大隊接力，每個人都要跑喔。' },
  { speaker: 'azhe', emo: 'happy', text: '（你站上起跑線。你其實很喜歡跑步，跑步的時候不用坐著不動。）' },
  { speaker: 'narrator', emo: 'surprised', anim: 'run', text: '「預備——」\n哨聲還沒響，你的腳就自己衝出去了。' },
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

  // ---------------- 週三（好的一天：連續兩天被欺負之後，這一天不會再被欺負）----------------
  { k: 'day', day: '週三', title: '午休的筆記本', bg: 'classroom',
    diary: ['今天有人喜歡你畫的東西時，你心裡是什麼感覺？'],
    recap: '午休時，冠宇看到阿哲筆記本裡的閃電，請他教自己畫。兩個人畫了一整個午休。',
    help: [
      { text: '也湊過去看他畫畫', result: '他多畫了一隻閃電給你看，畫得超快。' },
      { text: '跟他說：「你的筆記本可以借我看嗎？」', result: '他有點害羞，還是把筆記本推到你面前。' },
      { text: '請他幫你們組的作業畫插圖', result: '那份作業，被老師拿起來給全班看。' },
      { text: '跟他說：「下次也教我畫。」', result: '他說：「好啊，閃電要先畫鋸齒。」' },
    ] },
  { bg: 'classroom', chars: [{ id: 'azhe', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '午休的時候，你偷偷在筆記本上畫閃電。' },
  { bg: 'classroom', chars: [{ id: 'azhe', x: 52, emo: 'surprised' }, { id: 'guanyu', x: 140, emo: 'happy' }],
    speaker: 'guanyu', text: '哇，這是你畫的喔？好帥。可以教我嗎？',
    effect: { courage: 5, kind: 1 } },
  { speaker: 'narrator', emo: 'happy', text: '你愣了一下。好久沒有人這樣問你了。' },
  { k: 'choice', prompt: '你會怎麼回答？', options: [
    { text: '「好啊！閃電要先畫鋸齒。」',
      effect: { courage: 5 },
      then: [
        { speaker: 'azhe', emo: 'happy', text: '好啊！閃電要先畫鋸齒，再畫亮亮的邊。' },
        { speaker: 'narrator', emo: 'happy', text: '你們畫了一整個午休，連鐘響都沒聽到。', inner: '原來我也可以教別人。' },
      ] },
    { text: '把筆記本推過去，讓他自己翻。',
      effect: { courage: 5 },
      then: [{ speaker: 'narrator', emo: 'happy', text: '冠宇一頁一頁翻，一直說「好厲害」。', inner: '他看得好認真。' }] },
    { text: '「我畫得不好啦……」',
      then: [
        { speaker: 'azhe', emo: 'neutral', text: '我畫得不好啦……' },
        { speaker: 'guanyu', emo: 'happy', text: '哪有，比我好一百倍。', inner: '真的嗎？' },
      ] },
  ] },
  { speaker: 'narrator', emo: 'happy', text: '今天，沒有人笑你。', inner: '如果每天都像今天就好了。' },

  // ---------------- 週四（白天在學校，晚上和家人）----------------
  { k: 'day', day: '週四', title: '加油海報', bg: 'classroom',
    diary: ['整節課只能遞彩色筆時，你在想什麼？', '看著媽媽煮的飯，哪一句話最難說出口？'],
    recap: '分組做加油海報，沒有人找阿哲一組。他明明最會畫畫，卻被叫去旁邊遞彩色筆。這個禮拜的事都還壓在阿哲心裡。晚上媽媽問他學校怎麼樣，他看著碗裡的飯，不知道該怎麼說。',
    help: [
      { text: '邀他來你們這一組', result: '他愣了一下，抱著筆記本跑過來。' },
      { text: '跟組員說：「讓阿哲畫閃電，他畫得超好。」', result: '那張海報的閃電，後來被貼在教室最前面。' },
      { text: '傳訊息給他：「明天要不要一起練起跑？」', result: '過了很久，他回了一個字：「好。」後面加了一個閃電。' },
      { text: '決定明天早上在校門口等他', result: '隔天早上，他看到你的時候，愣了一下，然後笑了。' },
    ] },
  { bg: 'classroom', chars: [{ id: 'teacher', x: 96, emo: 'happy' }],
    speaker: 'teacher', text: '今天分組做運動會的加油海報！四個人一組，自己找組員。' },
  { bg: 'classroom', chars: [{ id: 'azhe', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '大家很快就湊成一組一組。你站在原地，不知道要去哪裡。',
    effect: { courage: -10, witness: 6 } },
  { speaker: 'narrator', emo: 'sad', text: '最後，老師把你分到志豪那一組。' },
  { bg: 'classroom', chars: CLASS_CHARS('sad', 'neutral'),
    speaker: 'zhihao', props: ['poster'], text: '好啦好啦。你不要亂畫就好，在旁邊遞彩色筆。' },
  { speaker: 'narrator', text: '你其實是全班最會畫畫的人。你的筆記本裡畫滿了閃電和賽跑的人。',
    inner: '我可以畫一隻超帥的閃電……' },
  { k: 'choice', prompt: '你會怎麼做？', options: [
    { text: '默默把彩色筆遞給他們。',
      effect: { courage: -5 },
      then: [{ speaker: 'narrator', emo: 'sad', text: '你遞了一整節課的彩色筆。', inner: '算了，反正他們也不會想用我的畫。' }] },
    { text: '小聲問：「我可以畫閃電嗎？」', need: 40,
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
  { bg: 'classroom', chars: [{ id: 'azhe', x: 52, emo: 'surprised' }, { id: 'guanyu', x: 140, emo: 'neutral' }],
    speaker: 'narrator', props: ['goldpen'], text: '下課前，隔壁組的冠宇偷偷把一支金色的筆推到你桌上。' },
  { speaker: 'guanyu', text: '（小聲）給你。我看過你畫的閃電，超帥的。',
    effect: { courage: 5, kind: 1 } },

  // 晚上
  { bg: 'home', chars: [{ id: 'azhe', x: 64, emo: 'neutral' }, { id: 'mom', x: 128, emo: 'happy' }],
    speaker: 'mom', text: '今天在學校怎麼樣？運動會快到了吧？' },
  { speaker: 'narrator', text: '你看著碗裡的飯。',
    inner: '星期一、星期二、今天……' },
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
        { speaker: 'azhe', emo: 'cry', zoom: true, text: '媽媽……大家都說跟我同一隊很倒楣。他們不讓我畫畫。' },
        { speaker: 'mom', emo: 'sad', text: '……謝謝你告訴我。這不是你的錯。' },
        { speaker: 'mom', emo: 'neutral', text: '明天媽媽會跟老師聯絡。你不用一個人面對。',
          effect: { courage: 15, kind: 1 } },
      ] },
  ] },

  // ---------------- 週五 ----------------
  { k: 'day', day: '週五', title: '收接力棒', bg: 'classroom',
    diary: ['阿明來跟你說話時，心裡哪裡放鬆了一點？', '明天站上起跑線，你最大的力量是什麼？'],
    recap: '放學後，大家都走了，阿哲一個人留在操場收接力棒。',
    help: [
      { text: '留下來幫他收接力棒', result: '收完的時候，他說：「其實……我很怕明天又犯規。」' },
      { text: '問一句：「你還好嗎？」', result: '他想了很久，說：「現在好一點了。」' },
      { text: '跟他說：「明天我會幫你喊加油。」', result: '他笑了：「那你要喊大聲一點。」' },
      { text: '陪他一起走到校門口', result: '一路上，他跟你說了好多他畫的閃電。' },
    ] },
  { bg: 'classroom', chars: [{ id: 'azhe', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'neutral' }],
    speaker: 'narrator', text: '早自習的時候，林老師把你叫到走廊上。' },
  { speaker: 'teacher', text: '阿哲，老師這幾天有注意到，練跑和分組的時候，你好像很不開心。' },
  { k: 'if', flag: 'toldMom', then: [
    { speaker: 'teacher', text: '媽媽昨天也打電話給老師了。謝謝你願意告訴媽媽。' },
  ] },
  { k: 'if', flag: 'toldTeacher', then: [
    { speaker: 'teacher', text: '也謝謝你昨天來找老師。' },
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
        { speaker: 'aming', emo: 'sad', text: '會啊。他們叫我外星阿明。所以我知道那種感覺。' },
        { speaker: 'aming', emo: 'happy', text: '明天，我會在終點幫你喊加油。' },
      ] },
    { text: '什麼都沒說，點點頭。',
      then: [{ speaker: 'narrator', emo: 'neutral', text: '阿明也沒再說什麼，陪你把接力棒收完。', inner: '有人陪著，好像沒那麼難過了。' }] },
  ] },
];

// 運動會：只有一個結局。欺負的人和旁觀者在每條路徑都一樣（後面一樣有人小聲說話）
// 依前面發生的事加入細節：有告訴媽媽，媽媽就在觀眾席；和阿明聊過，他會提起約定
const ENDING = [
  { k: 'day', day: '週六', title: '運動會', bg: 'sportsday' },
  { bg: 'sportsday', chars: [{ id: 'azhe', x: 52, emo: 'neutral' }],
    speaker: 'narrator', text: '你站上起跑線。腿有一點抖。' },
  { speaker: 'narrator', text: '後面有人小聲說：「拜託不要又犯規。」',
    inner: '不要聽。只要聽「砰」就好。' },
  { k: 'if', flag: 'toldMom', then: [
    { bg: 'sportsday', chars: [{ id: 'azhe', x: 52, emo: 'surprised' }, { id: 'mom', x: 140, emo: 'happy' }],
      speaker: 'narrator', anim: 'cheer', text: '你看到媽媽站在觀眾席最前面，用力對你揮手。' },
  ] },
  { speaker: 'narrator', text: '「預備——」\n你在心裡數：等「砰」，再數一。' },
  { bg: 'sportsday', chars: [{ id: 'azhe', x: 52, emo: 'happy' }, { id: 'aming', x: 140, emo: 'happy' }],
    speaker: 'narrator', anim: 'run', text: '「砰！」\n你衝了出去。風從耳朵旁邊呼呼吹過。' },
  { speaker: 'aming', anim: 'cheer', text: '阿哲——衝啊！' },
  { k: 'if', flag: 'friend', then: [
    { speaker: 'aming', text: '我說過會在終點幫你喊的！' },
  ] },
  { speaker: 'narrator', emo: 'happy', text: '你把接力棒交到下一個人手上。沒有犯規。',
    inner: '我做到了。' },
  { bg: 'sportsday', chars: [{ id: 'azhe', x: 52, emo: 'neutral' }, { id: 'teacher', x: 140, emo: 'happy' }],
    speaker: 'teacher', text: '阿哲，下禮拜一午休，要不要來找老師聊聊？可以帶你的畫冊來。',
    inner: '這個禮拜很難。可是我不是一個人。' },
];

export default {
  id: 'azhe',
  name: '阿哲',
  blurb: '愛畫畫，坐不住。常常忘東忘西。',
  story: STORY,
  ending: ENDING,
};
