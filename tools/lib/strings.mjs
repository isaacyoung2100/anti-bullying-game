// 收集遊戲中所有會顯示給玩家的劇本文字（翻譯表必須涵蓋這些字串）

import { STORIES, CHARACTERS, ZHIHAO_INNER, HELP_LINES } from '../../frontend/js/story.js';

export function storyStrings() {
  const out = new Set();
  const add = (s) => { if (typeof s === 'string' && s.trim()) out.add(s); };
  const walk = (list) => {
    for (const s of list) {
      add(s.text); add(s.inner); add(s.prompt); add(s.day); add(s.title); add(s.recap);
      (s.help || []).forEach((h) => { add(h.text); add(h.result); });
      (s.diary || []).forEach(add);
      if (s.k === 'choice') s.options.forEach((o) => { add(o.text); add(o.fear); walk(o.then); });
      if (s.k === 'if') walk(s.then);
    }
  };
  for (const st of STORIES) {
    add(st.name); add(st.blurb); add(st.pronoun);
    walk(st.story); walk(st.ending);
  }
  Object.values(CHARACTERS).forEach((c) => add(c.name));
  add(ZHIHAO_INNER);
  HELP_LINES.forEach((h) => { add(h.name); add(h.note); });
  return [...out];
}
