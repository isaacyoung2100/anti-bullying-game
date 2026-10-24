// 英文版的檢查：劇本每一句都有翻譯、介面兩種語言的項目一樣、英文裡沒有漏掉的中文

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORY_EN } from '../../frontend/js/lang/story_en.js';
import { UI_KEYS, t, setLang } from '../../frontend/js/i18n.js';
import { storyStrings } from '../lib/strings.mjs';

const CJK = /[一-鿿]/;

test('英文版：劇本裡每一句都有翻譯', () => {
  const missing = storyStrings().filter((s) => !STORY_EN[s]);
  assert.deepEqual(missing, [], `缺少翻譯（改了中文劇本後要補上英文）：\n${missing.join('\n')}`);
});

test('英文版：翻譯表沒有已經不用的舊句子', () => {
  const used = new Set(storyStrings());
  const stale = Object.keys(STORY_EN).filter((s) => !used.has(s));
  assert.deepEqual(stale, [], `這些中文句子已經不在劇本裡，可以從翻譯表刪掉：\n${stale.join('\n')}`);
});

test('英文版：翻譯裡沒有中文字，多行台詞的行數和中文一樣', () => {
  for (const [zh, en] of Object.entries(STORY_EN)) {
    assert.ok(!CJK.test(en), `英文翻譯裡有中文：${en}`);
    assert.equal(en.split('\n').length, zh.split('\n').length, `行數不同：${zh}`);
  }
});

test('英文版：介面文字兩種語言的項目一樣', () => {
  assert.deepEqual([...UI_KEYS.en].sort(), [...UI_KEYS.zh].sort());
});

test('日記：兩種語言的情緒象限、情緒詞、每天的引導問題數量一樣', () => {
  const shape = () => ({
    quads: Object.fromEntries(Object.entries(t('quads')).map(([k, q]) => [k, q.words.length])),
    prompts: t('diaryPrompts').length,
  });
  setLang('zh');
  const zh = shape();
  setLang('en');
  const en = shape();
  setLang('zh');
  assert.deepEqual(en, zh);
  assert.deepEqual(Object.keys(zh.quads), ['red', 'yellow', 'blue', 'green']);
  assert.equal(zh.prompts, 5, '週一到週五，每天一題');
});

// 英文版一致性：人名、數字、標點（逐句和中文比對）
const NAMES_EN = { 阿哲: 'Azhe', 小雨: 'Xiaoyu', 阿明: 'Aming', 阿凱: 'Kai', 小晴: 'Qing', 品妤: 'Pinyu', 志豪: 'Zhihao', 冠宇: 'Guanyu', 佳佳: 'Jiajia', 欣儀: 'Xinyi' };

test('英文版：中文提到的人名，英文也要提到（同一個拼法）', () => {
  const bad = [];
  for (const zh of storyStrings()) {
    const en = STORY_EN[zh];
    for (const [z, e] of Object.entries(NAMES_EN)) if (zh.includes(z) && !en.includes(e)) bad.push(`${e}：${zh} ⇒ ${en}`);
  }
  assert.deepEqual(bad, []);
});

test('英文版：數字和中文一樣（350 元、24 人、14.2 秒、專線號碼）', () => {
  const bad = [];
  // 中文寫成阿拉伯數字的（350、24、1953……），英文一定要有；中文數字（五年三班、八點半）英文可以寫成 5-3、8:30
  for (const zh of storyStrings()) {
    const en = STORY_EN[zh];
    for (const n of zh.match(/\d+(\.\d+)?/g) || []) if (!en.includes(n)) bad.push(`少了 ${n}：${zh} ⇒ ${en}`);
  }
  assert.deepEqual(bad, []);
});

test('英文版：用彎引號，沒有全形標點、多餘空白、重複的字', () => {
  const bad = [];
  for (const zh of storyStrings()) {
    const en = STORY_EN[zh];
    if (/[　-〿＀-￯]/.test(en)) bad.push(`全形標點：${en}`);
    if (/"/.test(en)) bad.push(`直引號：${en}`);
    if (/ {2,}| [,.!?]|^\s|\s$/.test(en)) bad.push(`空白：「${en}」`);
    if (/\b(\w+) \1\b/i.test(en) && !/\b(Bang|ha|no) \1\b/i.test(en)) bad.push(`重複字：${en}`);
    if ((en.match(/“/g) || []).length !== (en.match(/”/g) || []).length) bad.push(`引號沒有成對：${en}`);
  }
  assert.deepEqual(bad, []);
});
