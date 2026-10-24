/**
 * 《五年三班大隊接力》試玩問卷：自動建立三份 Google 表單
 *
 * 用法：
 *   1. 打開 https://script.google.com ，按「新專案」
 *   2. 把這個檔案的內容全部貼上，取代原本的程式碼，按儲存
 *   3. 上方選單選要執行的函式，按「執行」：
 *        createAllForms     三份一起建立
 *        createAdultOnly    只建一般成人版
 *        createExpertOnly   只建教育專業版
 *        createChildOnly    只建學童版
 *        createAdultEnglishOnly  只建一般成人版（英文，給外國受試者）
 *   4. 第一次會要求授權：選你的 Google 帳號 →「進階」→「前往（不安全）」→ 允許
 *      （這是你自己寫的程式，Google 才會這樣提醒）
 *   5. 下方「執行記錄」會列出每份表單的填寫網址、編輯網址，以及收集回覆的試算表
 *
 * 三份表單：
 *   A. 一般成人版：大學生、研究生、家長。以「玩家」身分回答遊玩感受
 *   B. 教育專業版：國小教師、輔導教師、特教教師、師培生。以「專家」身分評估教育適切性與課堂可行性
 *   C. 學童版：國小五、六年級。簡短量表 + 開放題 + 心情打勾（勾選需要幫忙的會看到求助說明）
 *
 * 遊戲操作 5 題（7 點量尺）是針對這個遊戲自編的題目；已建好的表單可以用 updateGameItems 原地更新
 * 三份表單都不收集姓名和 email。
 */

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
  [createAdultForm(), createExpertForm(), createChildForm()].forEach(logForm);
}

function createAdultOnly() { logForm(createAdultForm()); }
function createExpertOnly() { logForm(createExpertForm()); }
function createChildOnly() { logForm(createChildForm()); }

function logForm(f) {
  Logger.log('====== %s ======', f.form.getTitle());
  Logger.log('填寫網址（給受試者）：%s', f.form.getPublishedUrl());
  Logger.log('編輯網址（給你）：%s', f.form.getEditUrl());
  Logger.log('回覆試算表：%s', f.sheet.getUrl());
}

// 回覆自動寫進一份新的試算表
function linkSheet(form, name) {
  const sheet = SpreadsheetApp.create(name);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  return sheet;
}

function newForm(title, description) {
  const form = FormApp.create(title);
  form.setDescription(description);
  form.setCollectEmail(false);
  form.setProgressBar(true);
  return form;
}

// 同意才繼續；不同意就直接結束
function addConsent(form, title, helpText) {
  const item = form.addMultipleChoiceItem().setTitle(title).setHelpText(helpText).setRequired(true);
  item.setChoices([
    item.createChoice('我同意，開始填寫', FormApp.PageNavigationType.CONTINUE),
    item.createChoice('我不同意（直接結束，其他題目都不會出現）', FormApp.PageNavigationType.SUBMIT),
  ]);
}

const CONSENT_TEXT =
  '．匿名：不收集姓名、email 或任何可以辨識你的資料。\n' +
  '．用途：只用於學術研究統計，預計投稿第四屆情意教育國際研討會（ICAE4）。\n' +
  '．自願：你可以隨時停止填寫，停止不會有任何影響。\n' +
  '．遊戲和問卷都談到校園霸凌，如果回想起不舒服的經驗，請隨時停下來。\n' +
  '研究聯絡人：（請填上你的姓名與聯絡方式）';

function addScale(form, title, max = 5) {
  return form.addScaleItem()
    .setTitle(title)
    .setBounds(1, max)
    .setLabels('非常不同意', '非常同意')
    .setRequired(true);
}

// 一組題目：一題一題的量尺。組名只寫在程式裡，不放進表單
// （不用「選擇題格」：表格左邊的題目欄寬度固定，題目一長就擠成一直條；
//   也不用「標題說明」當組名：在表單上看起來像一張沒有選項的題目卡，容易讓人以為漏填）
// 需要說明的組，說明放在該組第一題底下的小字
function addGroup(form, title, helpText, rows) {
  rows.forEach((row, n) => {
    const item = addScale(form, row);
    if (n === 0 && helpText) item.setHelpText(helpText);
  });
}

// 遊戲操作，共 5 題、7 點量尺，全部針對這個遊戲自己設計，用來找出要修改的地方
// （不用 UMUX-Lite / SUS 的標準題：「功能符合我的需求」這類軟體量表的說法，放在遊戲上受試者看不懂）
const GAME_ITEMS = [
  'G1. 這個遊戲很容易使用。',
  'G2. 我知道每個畫面該按哪裡（繼續、選擇、上一句、暫停）。',
  'G3. 字的大小和出現的速度，讀起來很舒服。',
  'G4. 一個角色玩一週的長度（含每天的日記）剛好，不會太長。',
  'G5. 遊戲的畫面風格（日記本、手繪）讓我想繼續玩下去。',
];

function addGameItems(form) {
  form.addPageBreakItem().setTitle('遊戲操作')
    .setHelpText('請依照剛剛操作遊戲的感受作答（1 非常不同意，7 非常同意）。');
  GAME_ITEMS.forEach((text) => addScale(form, text, 7));
}

/**
 * 已經建好的一般成人版、教育專業版，原地修正，表單網址不變：
 *   1. 把「遊戲操作」的 5 題換成上面的新題目
 *   2. 拿掉看起來像空白題目的組名卡；組名卡上的說明移到下一題底下的小字
 * 用法：選函式 fixExistingForms，按「執行」
 */
function fixExistingForms() {
  updateGameItems();
  removeGroupHeaders();
}

function removeGroupHeaders() {
  Object.entries(EXISTING_FORMS).forEach(([name, id]) => {
    const form = FormApp.openById(id);
    const headers = form.getItems(FormApp.ItemType.SECTION_HEADER);
    // 從後面往前刪，前面題目的位置才不會跑掉
    headers.reverse().forEach((header) => {
      const help = header.getHelpText();
      const at = header.getIndex();
      const next = form.getItems()[at + 1];
      if (help && next && next.getType() === FormApp.ItemType.SCALE) next.asScaleItem().setHelpText(help);
      form.deleteItem(at);
    });
    Logger.log('%s：拿掉 %s 個組名卡', name, headers.length);
  });
}

const EXISTING_FORMS = {
  '一般成人版': '14IZT2qjo5EhLl3AM98ioSSp7nDvaA3qalG82U60TpWc',
  '教育專業版': '1MmNkIvozTDxO3XGXdwaIkHDfyHrGG9PkBI0FqEsGQpE',
};

function updateGameItems() {
  Object.entries(EXISTING_FORMS).forEach(([name, id]) => {
    const form = FormApp.openById(id);
    const old = form.getItems(FormApp.ItemType.SCALE)
      .filter((item) => /^(U1|U2|G1|G2|G3)\. /.test(item.getTitle()));
    if (old.length !== GAME_ITEMS.length) {
      Logger.log('%s：找到 %s 題，不是 5 題，沒有修改', name, old.length);
      return;
    }
    old.forEach((item, n) => item.setTitle(GAME_ITEMS[n]));
    Logger.log('%s：已更新遊戲操作 5 題', name);
  });
}

function addPlayedQuestions(form) {
  form.addCheckboxItem().setTitle('你這次玩了哪些角色？（可複選）').setRequired(true)
    .setChoiceValues(CHARACTERS);
  form.addMultipleChoiceItem().setTitle('你有把至少一個角色的一週從頭玩到最後一頁嗎？').setRequired(true)
    .setChoiceValues(['有，玩到最後一頁', '沒有，中途停下來']);
}

// ========== A. 一般成人版 ==========

function createAdultForm() {
  const form = newForm('《五年三班大隊接力》試玩回饋問卷（一般成人版）',
    '感謝你試玩反霸凌情意體驗遊戲《五年三班大隊接力》。遊戲以國小高年級的校園生活為背景，' +
    '用第一人稱呈現被嘲笑、被排擠時的處境。\n\n' +
    '這份問卷想了解你玩的時候的感受，約需 6 分鐘。\n' +
    '如果你是國小教師、輔導教師或師培生，請改填「教育專業版」。');
  form.setConfirmationMessage('謝謝你的回饋！\n\n' + HELP_TEXT);

  addConsent(form, '研究說明與同意', CONSENT_TEXT);

  form.addPageBreakItem().setTitle('基本資料');
  form.addMultipleChoiceItem().setTitle('你的年齡').setRequired(true)
    .setChoiceValues(['18–22 歲', '23–29 歲', '30–39 歲', '40–49 歲', '50 歲以上']);
  form.addMultipleChoiceItem().setTitle('你的性別').setRequired(true)
    .setChoiceValues(['男', '女', '其他／不想說']);
  form.addMultipleChoiceItem().setTitle('你的身分').setRequired(true)
    .setChoiceValues(['大學生', '研究生', '家長', '其他']).showOtherOption(true);
  addPlayedQuestions(form);
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

  addGameItems(form);

  form.addPageBreakItem().setTitle('玩的時候的感受')
    .setHelpText('請評估你在遊玩過程中的感受與想法（1 非常不同意，5 非常同意）。');
  addGroup(form, '換位思考與同理', '', [
    'E1. 第一人稱「你」的視角，讓我覺得自己好像就在那間教室或操場。',
    'E2. 我能體會主角被嘲笑、被孤立時心裡的委屈、緊張與無力。',
  ]);
  addGroup(form, '「說不出口」的設計', '心靈能量太低時，部分選項會被劃掉，並顯示主角心裡在怕什麼。', [
    'C1. 看到選項被劃掉、寫出主角在怕什麼，讓我更能理解被欺負的人為什麼沒有求助。',
    'C2. 我能理解主角有時候為什麼會低頭、跟著笑，或說「沒事」。',
    'C3. 這個設計讓我重新思考「被欺負的人只要勇敢說出來就好」這種想法。',
  ]);
  addGroup(form, '責任在誰', '', [
    'R1. 遊戲清楚傳達：被欺負是做出傷害行為的人的責任，不是被欺負的人的錯。',
    'R2. 週五老師主動介入，讓我感受到被欺負的人不需要一個人承擔。',
  ]);
  addGroup(form, '旁觀者可以做什麼', '', [
    'B1. 「換你想一想」讓我意識到，一句「你還好嗎？」或不跟著笑，也有很大的力量。',
    'B2. 普通同學冠宇的小善意（給一支筆、傳一句「我沒有笑」），讓我覺得旁觀者真的可以做點什麼。',
  ]);
  addGroup(form, '每天的日記', '每天結束時，選一格心情、替情緒取名字，再回答一個問題。', [
    'D1. 寫日記（選心情、替情緒取名字）讓我停下來，注意到角色當下的感受。',
  ]);
  addGroup(form, '玩的時候的心情', '這一題用來確認遊戲對玩家是否安全，請照實回答。', [
    'S1. 遊玩過程中，有讓我覺得難以承受的不舒服。',
  ]);

  form.addPageBreakItem().setTitle('你的想法（選填）');
  form.addParagraphTextItem().setTitle('哪一個場景、對話或心裡話讓你印象最深？為什麼？');
  form.addParagraphTextItem().setTitle('有什麼讓你覺得不真實、不舒服，或可以改進的地方？');

  return { form, sheet: linkSheet(form, '《五年三班大隊接力》一般成人版回覆') };
}

// ========== A2. 一般成人版（英文）：給外國受試者，玩英文版遊戲（網址加 ?lang=en） ==========
// 題目代號（E1、C1……）和中文成人版相同，兩份資料可以合併分析；分析時加一欄「語言」

function addScaleEn(form, title, max = 5, helpText = '') {
  const item = form.addScaleItem()
    .setTitle(title)
    .setBounds(1, max)
    .setLabels('Strongly disagree', 'Strongly agree')
    .setRequired(true);
  if (helpText) item.setHelpText(helpText);
  return item;
}

function createAdultEnglishForm() {
  const form = newForm('Class 5-3 Relay: Player Feedback Survey (English)',
    'Thank you for playing Class 5-3 Relay, an anti-bullying story game set in a Taiwanese elementary school ' +
    '(grades 5–6). You play in the first person as a student who is being teased and left out during the week before Sports Day.\n\n' +
    'This survey asks how the game felt to you. It takes about 6 minutes.\n' +
    'Please play the English version of the game: https://isaacyoung2100.github.io/anti-bullying-game/?lang=en');
  form.setConfirmationMessage(
    'Thank you for your feedback!\n\n' +
    'If the game or this survey brought up difficult feelings, please talk to someone you trust, ' +
    'or contact a local support service. In Taiwan, you can call the Taiwan Mental Health Hotline at 1925 (24 hours).');

  const consent = form.addMultipleChoiceItem().setTitle('About this study and consent').setRequired(true)
    .setHelpText(
      '- Anonymous: we do not collect your name, email, or anything that could identify you.\n' +
      '- Purpose: academic research only. Results will be submitted to the 4th International Conference on Affective Education (ICAE4).\n' +
      '- Voluntary: you can stop at any time, with no consequences.\n' +
      '- The game and this survey are about school bullying. If you recall upsetting experiences, please feel free to stop.\n' +
      'Researcher contact: (please add your name and contact information)');
  consent.setChoices([
    consent.createChoice('I agree. Start the survey.', FormApp.PageNavigationType.CONTINUE),
    consent.createChoice('I do not agree. (The survey ends here.)', FormApp.PageNavigationType.SUBMIT),
  ]);

  form.addPageBreakItem().setTitle('About you');
  form.addMultipleChoiceItem().setTitle('Your age').setRequired(true)
    .setChoiceValues(['18–22', '23–29', '30–39', '40–49', '50 or older']);
  form.addMultipleChoiceItem().setTitle('Your gender').setRequired(true)
    .setChoiceValues(['Male', 'Female', 'Other / prefer not to say']);
  form.addMultipleChoiceItem().setTitle('You are a…').setRequired(true)
    .setChoiceValues(['Undergraduate student', 'Graduate student', 'Parent', 'Other']).showOtherOption(true);
  form.addCheckboxItem().setTitle('Which characters did you play? (Select all that apply)').setRequired(true)
    .setChoiceValues([
      'Azhe (loves drawing, can’t sit still, forgets things a lot)',
      'Xiaoyu (fast runner, quiet, picks up her little brother every day)',
      'Aming (great at math; his mom is from Vietnam and they speak Vietnamese at home)',
      'Kai (loves to dance, speaks softly)',
      'Qing (loves dinosaurs, very sensitive to sound)',
      'Pinyu (used to watch from the side; left out after standing up for a classmate)',
    ]);
  form.addMultipleChoiceItem().setTitle('Did you play at least one character’s whole week to the last page?').setRequired(true)
    .setChoiceValues(['Yes, to the last page', 'No, I stopped partway']);
  form.addMultipleChoiceItem()
    .setTitle('When you were in school, which was closest to your experience?')
    .setHelpText('You may choose “Prefer not to say.”')
    .setRequired(true)
    .setChoiceValues([
      'I was teased, isolated, or left out by classmates',
      'I was mostly a bystander (I saw others left out but wasn’t directly involved)',
      'I didn’t notice much bullying or exclusion',
      'Prefer not to say',
    ]);
  form.addMultipleChoiceItem().setTitle('Where did you go to elementary school?').setRequired(true)
    .setChoiceValues(['Taiwan', 'Another country']);

  form.addPageBreakItem().setTitle('Playing the game')
    .setHelpText('Please answer based on how the game felt to use (1 = strongly disagree, 7 = strongly agree).');
  [
    'G1. The game was easy to use.',
    'G2. I knew what to tap on each screen (continue, choices, back, pause).',
    'G3. The text size and typing speed were comfortable to read.',
    'G4. One character’s week (including the daily diary) was a good length, not too long.',
    'G5. The visual style (diary notebook, hand-drawn) made me want to keep playing.',
  ].forEach((text) => addScaleEn(form, text, 7));

  form.addPageBreakItem().setTitle('How the game felt')
    .setHelpText('Please rate how you felt while playing (1 = strongly disagree, 5 = strongly agree).');
  addScaleEn(form, 'E1. The first-person “you” made me feel like I was really in that classroom or on that field.');
  addScaleEn(form, 'E2. I could feel the main character’s hurt, nervousness, and helplessness when teased or isolated.');
  addScaleEn(form, 'C1. Seeing choices crossed out, with what the character was afraid of, helped me understand why bullied students often don’t ask for help.', 5,
    'When the character’s Heart Energy is too low, some choices are crossed out and the game shows what they are afraid of.');
  addScaleEn(form, 'C2. I understood why the main character sometimes looked down, laughed along, or said “I’m fine.”');
  addScaleEn(form, 'C3. This design made me rethink the idea that bullied students just need to be brave and speak up.');
  addScaleEn(form, 'R1. The game clearly showed that bullying is the responsibility of the person doing the harm, not the person being bullied.');
  addScaleEn(form, 'R2. The teacher stepping in on Friday made me feel the bullied student didn’t have to carry this alone.');
  addScaleEn(form, 'B1. “Your turn to think” made me realize that asking “Are you okay?” or not laughing along can make a big difference.');
  addScaleEn(form, 'B2. The small kindnesses of an ordinary classmate, Guanyu (lending a marker, messaging “I didn’t laugh”), showed me that bystanders really can do something.');
  addScaleEn(form, 'D1. Writing the diary (choosing a mood and naming the feeling) made me pause and notice how the character felt.', 5,
    'At the end of each day, you choose a mood box, name the feeling, and answer a question.');
  addScaleEn(form, 'S1. At some point while playing, I felt overwhelmingly uncomfortable.', 5,
    'This question checks whether the game is safe for players. Please answer honestly.');

  form.addPageBreakItem().setTitle('Your thoughts (optional)');
  form.addParagraphTextItem().setTitle('Which scene, line, or inner thought stayed with you the most? Why?');
  form.addParagraphTextItem().setTitle('Was anything unrealistic, uncomfortable, or worth improving?');

  return { form, sheet: linkSheet(form, 'Class 5-3 Relay: English adult responses') };
}

function createAdultEnglishOnly() { logForm(createAdultEnglishForm()); }

// ========== B. 教育專業版 ==========

function createExpertForm() {
  const form = newForm('《五年三班大隊接力》教育專業評估問卷',
    '感謝你以教育專業的角度試玩《五年三班大隊接力》。這是一款給國小五、六年級的反霸凌情意體驗遊戲：' +
    '學生以第一人稱度過一位被欺負同學運動會前的一週，每天結束時寫一篇情緒日記。\n\n' +
    '這份問卷想請你評估遊戲是否適合給國小高年級學生使用，約需 8 分鐘。你的專業意見會直接用來修改遊戲。');
  form.setConfirmationMessage('謝謝你的專業回饋！');

  addConsent(form, '研究說明與同意', CONSENT_TEXT);

  form.addPageBreakItem().setTitle('基本資料');
  form.addMultipleChoiceItem().setTitle('你的身分').setRequired(true)
    .setChoiceValues(['國小教師（導師或科任）', '輔導教師', '特殊教育教師', '師資培育生', '其他']).showOtherOption(true);
  form.addMultipleChoiceItem().setTitle('你在國小現場的年資（師培生請選「未滿 1 年」）').setRequired(true)
    .setChoiceValues(['未滿 1 年', '1–5 年', '6–10 年', '11–20 年', '20 年以上']);
  form.addMultipleChoiceItem().setTitle('你是否處理過校園霸凌或學生人際衝突的事件？').setRequired(true)
    .setChoiceValues(['有，多次', '有，一兩次', '沒有']);
  addPlayedQuestions(form);

  addGameItems(form);

  form.addPageBreakItem().setTitle('教育適切性評估')
    .setHelpText('請以國小五、六年級學生為對象來評估（1 非常不同意，5 非常同意）。');
  addGroup(form, '情境與語言', '', [
    'P1. 故事中的霸凌情境（取綽號、排擠、班級群組、模仿嘲笑）符合台灣國小高年級的實際狀況。',
    'P2. 角色的台詞符合五、六年級學生的說話方式。',
  ]);
  addGroup(form, '角色描寫', '角色涵蓋 ADHD 特質、單親經濟弱勢、新住民家庭、性別氣質、自閉症類群，以及替同學說話的普通學生。', [
    'P3. 角色的描寫尊重差異，不會強化對這些學生的刻板印象。',
    'P4. 每個角色都有自己的優點和力量，不只是被同情的對象。',
  ]);
  addGroup(form, '教育設計', '', [
    'P5. 「說不出口」機制（選項被劃掉並顯示主角在怕什麼）能幫助學生理解受害者求助的困難。',
    'P6. 故事中老師的處理方式（主動察覺、私下晤談、對全班不點名提醒）符合校園實務。',
    'P7. 每天的日記（情緒象限、替情緒命名）適合讓學生練習自我覺察。',
    'P8. 「換你想一想」能引導學生思考旁觀者可以做的小事。',
  ]);
  addGroup(form, '安全', '', [
    'P9. 遊戲的安全設計（開場提醒、隨時暫停、求助專線、最多連續兩天被欺負）足以保護學生。',
    'P10. 我擔心這個遊戲可能讓有被欺負經驗的學生感到二度傷害。',
  ]);
  addGroup(form, '課堂可行性', '', [
    'P11. 學生可以在一節課（40 分鐘）內完成一個角色的一週並進行討論。',
    'P12. 如果條件允許，我願意在課堂上使用這個遊戲。',
  ]);

  form.addPageBreakItem().setTitle('專業建議（選填，但非常寶貴）');
  form.addParagraphTextItem().setTitle('劇情、台詞或角色描寫中，最需要修改的地方是什麼？');
  form.addParagraphTextItem().setTitle('如果在課堂上使用，你會怎麼安排（前導活動、分組討論、綜合活動）？');
  form.addParagraphTextItem().setTitle('有沒有需要特別注意的風險，或應該加上的安全措施？');

  return { form, sheet: linkSheet(form, '《五年三班大隊接力》教育專業版回覆') };
}

// ========== C. 學童版 ==========

function createChildForm() {
  const form = newForm('五年三班大隊接力：遊戲回饋單',
    '辛苦你過完五年三班同學的一週！\n\n' +
    '這不是考試，沒有分數，也沒有標準答案。請照你剛剛玩遊戲時真實的想法回答。\n' +
    '這份回饋單不寫名字，沒有人會知道是你寫的。');
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
