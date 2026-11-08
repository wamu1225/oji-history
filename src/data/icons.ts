// つかみの部品に使う線画アイコン（2026-11-08 ユーザー「アイコン使うとか」）。絵文字は使いません。
// どれも viewBox 0 0 24 24、同じ線の太さ。色は currentColor（置いた場所の文字色）に従う。
// 主題を見分けるのに効くものだけを、記事ごとに1つ割り当てる。

const PATHS = {
  // 地名＝地図のピン
  pin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  // 通史＝巻物
  scroll: '<path d="M6 4h11a2 2 0 0 1 2 2v12"/><path d="M6 4a2 2 0 0 0-2 2v1h4V6a2 2 0 0 0-2-2z"/><path d="M8 7v11a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1H12v1a2 2 0 0 1-2 2"/><path d="M11 9h5M11 12h5"/>',
  // 神社＝鳥居
  torii: '<path d="M3 5.5c3 .8 15 .8 18 0"/><path d="M5 9h14"/><path d="M7 6.5V21M17 6.5V21"/><path d="M12 9v-2.6"/>',
  // 狐火＝炎
  flame: '<path d="M12 21c-3.6 0-6-2.4-6-5.6 0-3.6 3-5.4 3.6-9.4 2.4 1.6 3.4 3.8 3.2 6 1-.6 1.8-1.6 2-2.8 1.6 1.6 3.2 3.8 3.2 6.2 0 3.2-2.4 5.6-6 5.6z"/><path d="M12 21c-1.4 0-2.4-1-2.4-2.4 0-1.6 1.4-2.4 2.4-4 1 1.6 2.4 2.4 2.4 4 0 1.4-1 2.4-2.4 2.4z"/>',
  // 製紙＝紙の束
  paper: '<path d="M7 3h8l4 4v11H7z"/><path d="M15 3v4h4"/><path d="M4 7v14h12"/><path d="M10 11h6M10 14h6"/>',
  // 軍需＝のこぎり屋根の工場
  factory: '<path d="M3 21V11l5 3v-3l5 3v-3l5 3V4h3v17z"/><path d="M7 18h2M12 18h2"/>',
  // 赤レンガ＝れんがの壁
  brick: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9.7h18M3 14.3h18"/><path d="M9 5v4.7M15 5v4.7M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6M9 14.3V19M15 14.3V19"/>',
  // スターハウス＝Y字の住棟（上から見た形）
  star: '<path d="M14.3 20.5 L9.7 20.5 L9.7 13.3 L3.5 9.7 L5.8 5.8 L12 9.3 L18.2 5.8 L20.5 9.7 L14.3 13.3 Z"/>',
  // 飛鳥山＝桜の花
  sakura: '<circle cx="12" cy="12" r="1.6"/><path d="M12 10.4C9.6 7.6 10.4 4.4 12 3.6c1.6.8 2.4 4 0 6.8z"/><path d="M13.5 11.5c3.4-1.5 6.2.2 6.5 2-.6 1.6-3.8 2.6-6.5 0z"/><path d="M13 13.4c1.3 3.4-.6 6.1-2.4 6.3-1.4-1-2-4.2.8-6.4z"/><path d="M10.6 13.2c-3.5 1-6-1.1-6.2-2.9.8-1.5 4.1-2.3 6.4.4z"/>',
  // 渋沢邸＝家
  house: '<path d="M3 11 12 4l9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
  // 滝＝崖から流れ落ちる水
  waterfall: '<path d="M3 5h9v3"/><path d="M8 8v9M12 8v11M16 8v9"/><path d="M12 5h9"/><path d="M4 20c2.5-1.5 5.5-1.5 8 0s5.5 1.5 8 0"/>',
  // 順路＝足あと
  steps: '<ellipse cx="8" cy="15" rx="2.4" ry="3.6"/><path d="M6.8 20.4h2.4"/><ellipse cx="16" cy="7" rx="2.4" ry="3.6"/><path d="M14.8 12.4h2.4"/>',
  // 名物＝玉子焼き（巻いた切り口）
  tamagoyaki: '<rect x="3" y="5" width="18" height="14" rx="4"/><rect x="7" y="9" width="10" height="6" rx="2"/><path d="M11 12h2"/>',
  // 和菓子＝だんご
  dango: '<path d="M3 21 21 3"/><circle cx="8" cy="16" r="2.6"/><circle cx="12" cy="12" r="2.6"/><circle cx="16" cy="8" r="2.6"/>',
  // よくある誤解＝問い
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6v.6"/><path d="M12 17h.01"/>',
} as const;

export type IconName = keyof typeof PATHS;

export function iconSvg(name: IconName, size = 24): string {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${PATHS[name]}</svg>`;
}

export const ARTICLE_ICON: Record<string, IconName> = {
  chimei: 'pin',
  history: 'scroll',
  'oji-jinja': 'torii',
  'sozoku-inari': 'flame',
  seishi: 'paper',
  gunju: 'factory',
  'akarenga-library': 'brick',
  'star-house': 'star',
  asukayama: 'sakura',
  'shibusawa-tei': 'house',
  'nanushi-no-taki': 'waterfall',
  meguru: 'steps',
  ogiya: 'tamagoyaki',
  wagashi: 'dango',
  faq: 'question',
};
