// 《五年三班大隊接力》：第一人稱，你是被欺負的那個人（開場不直接說破，讓玩家在故事中發現）
//
// 設計原則
// - 欺負你的人和旁觀者怎麼做，是固定劇情；你控制不了別人，現實中也是這樣
// - 你的選擇只改變你的感受、你找誰說，不決定你「該不該」被欺負
// - 勇氣不夠時，選項一樣可以選，旁邊用括號寫出心裡在怕什麼；選了就演出害怕、但還是做到了
//   （勇敢不是不害怕。心靈能量不顯示在畫面上，只用來決定要不要寫出害怕、回顧時每天的天氣）
// - 被欺負的那幾天，選項大致有三種：退縮、保護自己（不用正面衝突，例如走開、找大人）、堅定說出來；
//   阿哲、阿凱、品妤各有一個「回嗆」的選項，劇情直接演出後果（大人常常只看到回嗆的那一刻）
//
// 每個角色的故事放在 stories/，步驟格式：
// { speaker, text, inner?, emo?, bg?, chars?, effect? }   一句台詞；inner 是你心裡真正的想法
// { k: 'day', day, title, bg }                            每天開始的標題卡
// { k: 'choice', prompt, options: [...] }                 你的選擇
//   option: { text, need?, fear?, effect?, flag?, then: [步驟...] }   need：需要多少勇氣，不夠時顯示 fear
// { k: 'if', flag, then: [步驟...] }                       有某個旗標才會發生
// effect: { courage, witness, kind }                      勇氣變化、旁觀沉默的人數、善意的次數

import azhe from './stories/azhe.js?v=dev';
import xiaoyu from './stories/xiaoyu.js?v=dev';
import aming from './stories/aming.js?v=dev';
import kai from './stories/kai.js?v=dev';
import qing from './stories/qing.js?v=dev';
import pinyu from './stories/pinyu.js?v=dev';

export const STORIES = [azhe, xiaoyu, aming, kai, qing, pinyu];

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
  kai:     { name: '阿凱' },
  qing:    { name: '小晴' },
  pinyu:   { name: '品妤' },
  guanyu:  { name: '冠宇' },
  xinyi:   { name: '欣儀' },
  grandma: { name: '阿嬤' },
  dadQ:    { name: '爸爸' },
  sister:  { name: '姊姊' },
  class:   { name: '同學們' },
  narrator:{ name: '' },
};

export const START_COURAGE = 60;
// 每天早上睡了一覺，心靈能量會回來一點點
export const OVERNIGHT = 5;

// 勇氣不夠、還是選了：先演出這一句，心裡想的是那個選項的 fear
export const SCARED_LINE = '你的心跳得好快，手心都是汗。可是你還是做了。';

// 求助資源（已查證：教育部防制校園霸凌專線自 111 年 8 月 30 日起改為 1953，24 小時）
export const HELP_LINES = [
  { name: '教育部防制校園霸凌專線', number: '1953', note: '24 小時，被欺負或看到別人被欺負都可以打' },
  { name: '安心專線', number: '1925', note: '24 小時，心情很不好、想傷害自己的時候' },
  { name: '保護專線', number: '113', note: '在家裡或其他地方被大人傷害的時候' },
  // 已確認官網 https://i.win.org.tw/ 有「我要申訴」與網路霸凌專區；電話號碼未能確認，所以只列網站
  { name: 'iWIN 網路內容防護機構', number: 'i.win.org.tw', note: '網路上被欺負（例如在群組被嘲笑、照片被亂傳），可以上網申訴' },
];
