// 英文版的檢查：劇本每一句都有翻譯、介面兩種語言的項目一樣、英文裡沒有漏掉的中文

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORY_EN } from '../../frontend/js/lang/story_en.js';
import { UI_KEYS } from '../../frontend/js/i18n.js';
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
