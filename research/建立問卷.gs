/**
 * 《五年三班大隊接力》試玩問卷：自動建立兩份 Google 表單
 *
 * 用法（只要做一次）：
 *   1. 打開 https://script.google.com ，按「新專案」
 *   2. 把這個檔案的內容全部貼上，取代原本的程式碼，按儲存
 *   3. 上方選單選函式 createAllForms，按「執行」
 *   4. 第一次會要求授權：選你的 Google 帳號 →「進階」→「前往（不安全）」→ 允許
 *      （這是你自己寫的程式，Google 才會這樣提醒）
 *   5. 執行完，下方「執行記錄」會列出兩份表單的填寫網址、編輯網址，以及收集回覆的試算表
 *
 * 會建立：
 *   A. 成人版：大學生、研究生、家長、老師（SUS 系統可用性 + 情意量表 + 開放題）
 *   B. 學童版：國小五、六年級（簡短量表 + 開放題 + 心情打勾，勾選需要幫忙的會看到求助說明）
 *
 * 兩份表單都不收集姓名和 email。
 */

const SCALE_5 = ['1 非常不同意', '2 不同意', '3 普通', '4 同意', '5 非常同意'];

const CHARACTERS = [
  '阿哲（愛畫畫，坐不住，常常忘東忘西）',
  '小雨（跑步很快，話不多，每天放學去接弟弟）',
  '阿明（數學很好，媽媽來自越南，在家說越南話）',
  '阿凱（喜歡跳舞，說話輕聲）',
  '小晴（最喜歡恐龍，對聲音很敏感）',
  '品妤（原本在旁邊看，替同學說話後被小圈圈冷落）',
];

const HELP_TEXT =
  '如果你在現實生活中也遇到類似的事，這不是你的錯。\n' +
  '可以告訴你信任的大人：爸爸媽媽、導師、輔導室或學務處的老師。\n' +
  '教育部防制校園霸凌專線 1953（24 小時）\n' +
  '安心專線 1925（24 小時，心情很不好的時候）';

function createAllForms() {
  const adult = createAdultForm();
  const child = createChildForm();
  [adult, child].forEach((f) => {
    Logger.log('====== %s ======', f.form.getTitle());
    Logger.log('填寫網址（給受試者）：%s', f.form.getPublishedUrl());
    Logger.log('編輯網址（給你）：%s', f.form.getEditUrl());
    Logger.log('回覆試算表：%s', f.sheet.getUrl());
  });
}

// 回覆自動寫進一份新的試算表
function linkSheet(form, name) {
  const sheet = SpreadsheetApp.create(name);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  return sheet;
}

// 同意才繼續；不同意就直接結束
function addConsent(form, title, helpText) {
  const item = form.addMultipleChoiceItem().setTitle(title).setHelpText(helpText).setRequired(true);
  item.setChoices([
    item.createChoice('我同意，開始填寫', FormApp.PageNavigationType.CONTINUE),
    item.createChoice('我不同意（直接結束，其他題目都不會出現）', FormApp.PageNavigationType.SUBMIT),
  ]);
}

function addLikertGrid(form, title, helpText, rows) {
  form.addGridItem()
    .setTitle(title)
    .setHelpText(helpText || '')
    .setRows(rows)
    .setColumns(SCALE_5)
    .setRequired(true);
}

// ========== A. 成人版 ==========

function createAdultForm() {
  const form = FormApp.create('《五年三班大隊接力》試玩回饋問卷（成人版）');
  form.setDescription(
    '感謝你試玩反霸凌情意體驗遊戲《五年三班大隊接力》。遊戲以國小高年級的校園生活為背景，' +
    '用第一人稱呈現被嘲笑、被排擠時的處境。\n\n' +
    '這份問卷想了解你在遊玩時的操作感受、情感共鳴，以及對遊戲設計的看法，約需 8 分鐘。'
  );
  form.setCollectEmail(false);
  form.setProgressBar(true);
  form.setConfirmationMessage('謝謝你的回饋！\n\n' + HELP_TEXT);

  addConsent(form, '研究說明與同意',
    '．匿名：不收集姓名、email 或任何可以辨識你的資料。\n' +
    '．用途：只用於學術研究統計，預計投稿第四屆情意教育國際研討會（ICAE4）。\n' +
    '．自願：你可以隨時停止填寫，停止不會有任何影響。\n' +
    '．遊戲和問卷都談到校園霸凌，如果回想起不舒服的經驗，請隨時停下來。\n' +
    '研究聯絡人：（請填上你的姓名與聯絡方式）');

  form.addPageBreakItem().setTitle('第一部分：基本資料');
  form.addMultipleChoiceItem().setTitle('你的年齡').setRequired(true)
    .setChoiceValues(['18–22 歲', '23–29 歲', '30–39 歲', '40–49 歲', '50 歲以上']);
  form.addMultipleChoiceItem().setTitle('你的性別').setRequired(true)
    .setChoiceValues(['男', '女', '其他／不想說']);
  form.addMultipleChoiceItem().setTitle('你的身分').setRequired(true)
    .setChoiceValues(['大學生', '研究生', '國小教師或師培生', '家長', '其他']).showOtherOption(true);
  form.addCheckboxItem().setTitle('你這次玩了哪些角色？（可複選）').setRequired(true)
    .setChoiceValues(CHARACTERS);
  form.addMultipleChoiceItem().setTitle('你有把至少一個角色的一週從頭玩到最後一頁嗎？').setRequired(true)
    .setChoiceValues(['有，玩到最後一頁', '沒有，中途停下來']);
  form.addMultipleChoiceItem()
    .setTitle('求學時期，你比較接近哪一種經驗？')
    .setHelpText('這一題可以選「不想回答」。')
    .setRequired(true)
    .setChoiceValues([
      '曾經被同學嘲笑、孤立或排擠',
      '大多是旁觀者（看過別人被排擠，但沒有直接涉入）',
      '沒有特別感受到霸凌或排擠',
      '不想回答',
    ]);

  // SUS：維持標準題序與正反題交錯，計分方式才能和其他研究比較
  form.addPageBreakItem().setTitle('第二部分：操作感受')
    .setHelpText('請依照剛剛操作遊戲的真實感受作答。這部分是國際通用的「系統可用性量表（SUS）」。');
  addLikertGrid(form, '操作感受', '', [
    '1. 我想我會願意經常使用這個遊戲（例如在課堂上再次使用）。',
    '2. 我覺得這個遊戲不必要地複雜。',
    '3. 我覺得這個遊戲很容易使用。',
    '4. 我覺得需要有人在旁邊協助，我才能使用這個遊戲。',
    '5. 我覺得這個遊戲的各項功能（對話、選擇、日記）整合得很好。',
    '6. 我覺得這個遊戲有太多不一致的地方。',
    '7. 我想大部分的人都能很快學會使用這個遊戲。',
    '8. 我覺得這個遊戲用起來很笨拙、很麻煩。',
    '9. 使用這個遊戲時，我覺得很有信心。',
    '10. 我需要先學很多東西，才能開始使用這個遊戲。',
  ]);

  form.addPageBreakItem().setTitle('第三部分：遊玩時的感受')
    .setHelpText('請評估你在遊玩過程中的感受與想法。');
  addLikertGrid(form, '換位思考與同理', '', [
    'E1. 第一人稱「你」的視角，讓我覺得自己好像就在那間教室或操場。',
    'E2. 我能體會主角被嘲笑、被孤立時心裡的委屈、緊張與無力。',
    'E3. 遊戲的情節讓我想起自己求學時期，或身邊同學類似的經歷。',
  ]);
  addLikertGrid(form, '「說不出口」的設計', '心靈能量太低時，部分選項會被劃掉，並顯示主角心裡在怕什麼。', [
    'C1. 看到選項被劃掉、寫出主角在怕什麼，讓我更能理解被欺負的人為什麼沒有求助。',
    'C2. 我能理解主角有時候為什麼會低頭、跟著笑，或說「沒事」。',
    'C3. 這個設計讓我重新思考「被欺負的人只要勇敢說出來就好」這種想法。',
  ]);
  addLikertGrid(form, '責任在誰', '', [
    'R1. 遊戲清楚傳達：被欺負是做出傷害行為的人的責任，不是被欺負的人的錯。',
    'R2. 主角不管怎麼選，欺負的人和旁觀者都不會突然改變，這讓我覺得情境很真實。',
    'R3. 週五老師主動介入，讓我感受到被欺負的人不需要一個人承擔。',
  ]);
  addLikertGrid(form, '旁觀者可以做什麼', '', [
    'B1. 「換你想一想」讓我意識到，一句「你還好嗎？」或不跟著笑，也有很大的力量。',
    'B2. 普通同學冠宇的小善意（給一支筆、傳一句「我沒有笑」），讓我覺得旁觀者真的可以做點什麼。',
    'B3. 玩完後，如果在現實中看到有人被孤立，我會更願意給他一點友善的關注。',
  ]);
  addLikertGrid(form, '每天的日記', '每天結束時，選一格心情、替情緒取名字，再回答一個問題。', [
    'D1. 寫日記讓我停下來，注意到角色當下的感受。',
    'D2. 替情緒取名字（例如「委屈」「被冷落」）讓我更清楚角色的心情。',
  ]);
  addLikertGrid(form, '玩的時候的心情', '這一題用來確認遊戲對玩家是否安全，請照實回答。', [
    'S1. 遊玩過程中，有讓我覺得難以承受的不舒服。',
  ]);

  form.addPageBreakItem().setTitle('第四部分：你的想法（選填）');
  form.addParagraphTextItem().setTitle('哪一個場景、對話或心裡話讓你印象最深？為什麼？');
  form.addParagraphTextItem().setTitle('你對「說不出口」（選項被劃掉、寫出主角在怕什麼）這個設計有什麼感受？');
  form.addParagraphTextItem().setTitle('以成年人的眼光回頭看，這個遊戲有沒有真實反映校園人際的困難？有什麼可以改進的地方？');

  return { form, sheet: linkSheet(form, '《五年三班大隊接力》成人版回覆') };
}

// ========== B. 學童版 ==========

function createChildForm() {
  const form = FormApp.create('五年三班大隊接力：遊戲回饋單');
  form.setDescription(
    '辛苦你過完五年三班同學的一週！\n\n' +
    '這不是考試，沒有分數，也沒有標準答案。請照你剛剛玩遊戲時真實的想法回答。\n' +
    '這份回饋單不寫名字，沒有人會知道是你寫的。'
  );
  form.setCollectEmail(false);
  form.setProgressBar(true);
  form.setConfirmationMessage('謝謝你！\n\n' + HELP_TEXT);

  const willing = form.addMultipleChoiceItem().setTitle('你願意填這份回饋單嗎？').setRequired(true);
  willing.setChoices([
    willing.createChoice('我願意', FormApp.PageNavigationType.CONTINUE),
    willing.createChoice('我不想填（直接結束）', FormApp.PageNavigationType.SUBMIT),
  ]);

  form.addPageBreakItem().setTitle('關於你');
  form.addMultipleChoiceItem().setTitle('你現在讀幾年級？').setRequired(true)
    .setChoiceValues(['五年級', '六年級', '其他']);
  form.addMultipleChoiceItem().setTitle('你是').setRequired(true)
    .setChoiceValues(['男生', '女生', '不想說']);
  form.addMultipleChoiceItem().setTitle('你剛剛扮演的是哪一位同學？').setRequired(true)
    .setChoiceValues(CHARACTERS);

  form.addPageBreakItem().setTitle('玩完後的想法')
    .setHelpText('讀一讀每一句話，選一個最像你現在想法的數字。');
  const childItems = [
    '玩完這個故事，我更能體會被同學嘲笑或排擠時，心裡有多難受。',
    '我明白被欺負的人不敢說出來，是因為當時太害怕，不是因為他膽小。',
    '我知道被同學嘲笑或排擠，不是被欺負的人的錯。',
    '每天的日記，讓我練習說出角色真正的心情。',
    '如果看到同學被冷落，我會更願意走過去問一句「你還好嗎？」。',
    '我覺得在旁邊「不跟著大家一起笑」，也是一種幫忙。',
    '我覺得這個故事很真實，像學校裡會發生的事。',
    '我會想推薦這個遊戲給其他同學玩。',
  ];
  // 學童版用一題一題的量尺，手機上比表格好點
  childItems.forEach((text, n) => {
    form.addScaleItem()
      .setTitle(`${n + 1}. ${text}`)
      .setBounds(1, 5)
      .setLabels('完全不同意', '非常同意')
      .setRequired(true);
  });

  form.addPageBreakItem().setTitle('想說的話（可以不寫）');
  form.addParagraphTextItem().setTitle('故事裡的哪一幕，讓你最難忘？');
  form.addParagraphTextItem().setTitle('如果可以對你扮演的那位同學說一句話，你想說什麼？');

  // 心情打勾：選「想找老師聊」的人會看到怎麼找老師（回饋單是匿名的，老師不知道是誰勾的）
  form.addPageBreakItem().setTitle('最後一題');
  const feel = form.addMultipleChoiceItem().setTitle('玩完遊戲之後，你現在的心情是？').setRequired(true);

  const restPage = form.addPageBreakItem().setTitle('休息一下')
    .setHelpText(
      '有一點難過是很正常的，因為你很認真地體會了故事裡同學的心情。\n' +
      '你可以深呼吸幾次、喝口水，或跟旁邊的同學、老師說說話。\n' +
      '如果難過一直沒有變好，也可以去找老師聊一聊。'
    );
  const talkPage = form.addPageBreakItem().setTitle('我們一起找老師聊聊')
    .setHelpText(
      '謝謝你願意說出來，這需要勇氣，也不是你的錯。\n\n' +
      '這份回饋單沒有寫名字，所以老師不知道是誰勾了這一格。\n' +
      '交出回饋單後，請你舉手，或下課走到老師旁邊說：「我想聊聊。」\n' +
      '如果不想在學校說，也可以告訴爸爸媽媽，或打 1953（24 小時，免費）。'
    );
  // 「休息一下」這一頁看完就結束
  talkPage.setGoToPage(FormApp.PageNavigationType.SUBMIT);

  feel.setChoices([
    feel.createChoice('心情很平靜，我覺得很好。', FormApp.PageNavigationType.SUBMIT),
    feel.createChoice('有一點點難過，但我自己休息一下就好。', restPage),
    feel.createChoice('我想起自己在學校不開心的事，我想找老師聊一聊。', talkPage),
  ]);

  return { form, sheet: linkSheet(form, '五年三班大隊接力：學童回饋單回覆') };
}
