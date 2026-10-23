// 《五年三班大隊接力》：第一人稱，你是被欺負的那個人
//
// 設計原則
// - 欺負你的人和旁觀者怎麼做，是固定劇情；你控制不了別人，現實中也是這樣
// - 你的選擇只改變你的感受、你找誰說，不決定你「該不該」被欺負
// - 勇氣太低時，有些選項會被劃掉：不是不想說，是說不出口
//
// 每個角色的故事放在 stories/，步驟格式：
// { speaker, text, inner?, emo?, bg?, chars?, effect? }   一句台詞；inner 是你心裡真正的想法
// { k: 'day', day, title, bg }                            每天開始的標題卡
// { k: 'choice', prompt, options: [...] }                 你的選擇
//   option: { text, need?, effect?, flag?, then: [步驟...] }
// { k: 'if', flag, then: [步驟...] }                       有某個旗標才會發生
// effect: { courage, witness, kind }                      勇氣變化、旁觀沉默的人數、善意的次數

import azhe from './stories/azhe.js';
import xiaoyu from './stories/xiaoyu.js';
import aming from './stories/aming.js';

export const STORIES = [azhe, xiaoyu, aming];

// 玩家扮演的角色在對話中顯示為「你」
export const CHARACTERS = {
  azhe:    { name: '阿哲' },
  xiaoyu:  { name: '小雨' },
  aming:   { name: '阿明' },
  zhihao:  { name: '志豪' },
  jiajia:  { name: '佳佳' },
  teacher: { name: '林老師' },
  mom:     { name: '媽媽' },
  momX:    { name: '媽媽' },
  momM:    { name: '媽媽' },
  class:   { name: '同學們' },
  narrator:{ name: '' },
};

export const START_COURAGE = 70;
// 每天早上睡了一覺，勇氣會回來一點點
export const OVERNIGHT = 5;
export const BRAVE_THRESHOLD = 70;

// 結局後揭露：帶頭的人也可能在害怕
export const ZHIHAO_INNER = '其實……四年級的時候，被大家笑的人是我。\n我發現只要大家在笑別人，就不會有人笑我了。';
