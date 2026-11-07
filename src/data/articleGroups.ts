// 記事一覧の まとまり（読む順）。一覧のページと prerender の両方が使う（2026-11-07 監督）
export const ARTICLE_GROUPS: { title: string; lead: string; slugs: string[] }[] = [
  { title: 'はじめに：地名と歩み', lead: '熊野の神を迎えた土地の、千年の歩み。', slugs: ['chimei', 'history'] },
  { title: '神社と伝承', lead: '王子神社・王子稲荷、狐火、そして滝。', slugs: ['oji-jinja', 'sozoku-inari', 'nanushi-no-taki'] },
  { title: '近代の工場の町', lead: '洋紙の製造と陸軍の工場。いまに残る建物も。', slugs: ['seishi', 'gunju', 'akarenga-library', 'star-house'] },
  { title: '飛鳥山と渋沢栄一', lead: '吉宗の桜の山と、渋沢の邸の跡。', slugs: ['asukayama', 'shibusawa-tei'] },
  { title: '歩く・食べる', lead: '順路、老舗の味、境目のまぎらわしさ。', slugs: ['meguru', 'ogiya', 'wagashi', 'faq'] },
];
