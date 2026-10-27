// 記事本文に付随する自作SVG図のSSOT。React（ArticlePage.tsx）と prerender.ts が
// 同じHTML文字列を共有する（単一ソース化＝prerender-svg-guard対策）。
import { routeStops } from './route';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 実座標地図：routeStops の緯度経度を正距円筒図法（経度をcos(緯度)で補正）で
// 平面に投影する。座標は施設の公表座標にもとづく概算であり、測量精度ではない
// 相対位置の目安（route.ts の注記を参照）。
function buildRouteMapSvg(): string {
  const R_EARTH_M = 111_320;
  const lat0 = routeStops.reduce((s, p) => s + p.lat, 0) / routeStops.length;
  const cosLat = Math.cos((lat0 * Math.PI) / 180);

  const toXY = (lat: number, lng: number) => ({
    x: lng * cosLat * R_EARTH_M,
    y: -lat * R_EARTH_M,
  });

  const pts = routeStops.map((s) => ({ ...s, ...toXY(s.lat, s.lng) }));
  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));

  const PAD = 30;
  const W = 300;
  const H = 340;
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2 - 40) / spanY);

  const px = (x: number) => PAD + (x - minX) * scale;
  const py = (y: number) => PAD + (y - minY) * scale;

  const line = pts.map((p) => `${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ');

  const dots = pts
    .map((p) => {
      const cx = px(p.x).toFixed(1);
      const cy = py(p.y).toFixed(1);
      const color = p.category === 'faith' ? '#8a4a2f' : '#35547a';
      return `<g>
        <circle cx="${cx}" cy="${cy}" r="11" fill="${color}" stroke="#fff" stroke-width="2" />
        <text x="${cx}" y="${cy}" font-size="12" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">${p.order}</text>
      </g>`;
    })
    .join('\n');

  const barMeters = 200;
  const barPx = barMeters * scale;
  const barX0 = PAD;
  const barY = H - 40;

  return `<figure class="fig fig--map">
  <svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="oji-map-title oji-map-desc">
    <title id="oji-map-title">王子の見どころ6地点、実座標にもとづく位置関係図</title>
    <desc id="oji-map-desc">各地点の緯度経度から算出した相対位置を示す図。測量精度の地図ではなく、公表されている座標にもとづく概略図。番号は下の凡例と対応する。</desc>
    <polyline points="${line}" fill="none" stroke="#b5aa8f" stroke-width="2" stroke-dasharray="3 5" />
    ${dots}
    <g transform="translate(${W - 26}, 26)">
      <line x1="0" y1="16" x2="0" y2="0" stroke="#262420" stroke-width="2" marker-end="url(#oji-map-n-arrow)" />
      <text x="0" y="-4" font-size="13" text-anchor="middle" fill="#262420">N</text>
    </g>
    <g transform="translate(${barX0}, ${barY})">
      <line x1="0" y1="0" x2="${barPx.toFixed(1)}" y2="0" stroke="#262420" stroke-width="2" />
      <line x1="0" y1="-4" x2="0" y2="4" stroke="#262420" stroke-width="2" />
      <line x1="${barPx.toFixed(1)}" y1="-4" x2="${barPx.toFixed(1)}" y2="4" stroke="#262420" stroke-width="2" />
      <text x="${(barPx / 2).toFixed(1)}" y="16" font-size="11" text-anchor="middle" fill="#262420">${barMeters}m</text>
    </g>
    <defs>
      <marker id="oji-map-n-arrow" markerWidth="8" markerHeight="8" refX="4" refY="1" orient="auto">
        <path d="M0,8 L4,0 L8,8 Z" fill="#262420" />
      </marker>
    </defs>
  </svg>
  <div class="fig-map__legend">
    <ol>
      ${pts.map((p) => `<li><span class="fig-map__dot fig-map__dot--${p.category}">${p.order}</span>${esc(p.name)}</li>`).join('\n      ')}
    </ol>
    <p class="fig-map__key">
      <span class="fig-map__key-item"><span class="fig-map__dot fig-map__dot--faith">●</span>社寺・信仰</span>
      <span class="fig-map__key-item"><span class="fig-map__dot fig-map__dot--heritage">●</span>公園・近代遺産</span>
    </p>
  </div>
  <figcaption>6地点の位置関係を、各施設の公表座標から算出して描いた図。測量精度ではなく、実座標にもとづく相対位置の目安。実際の道のりは道路事情により図の直線と異なる。</figcaption>
</figure>`;
}

// 通史の年表（4点）
function buildHistoryTimelineSvg(): string {
  const node = (x: number, year: string, label: string, color: string) =>
    `<circle cx="${x}" cy="54" r="9" fill="${color}"/>` +
    `<text x="${x}" y="34" font-size="11" font-weight="700" fill="#262420" text-anchor="middle">${year}</text>` +
    `<text x="${x}" y="80" font-size="10.5" fill="#262420" text-anchor="middle">${label.split('|')[0]}</text>` +
    (label.includes('|') ? `<text x="${x}" y="92" font-size="10.5" fill="#262420" text-anchor="middle">${label.split('|')[1]}</text>` : '');
  return (
    `<figure class="fig">` +
    `<svg class="diagram-single" viewBox="0 0 300 110" width="100%" role="img" aria-label="王子の通史年表の図">` +
    `<rect width="300" height="110" fill="#f0ede3"/>` +
    `<line x1="34" y1="54" x2="266" y2="54" stroke="#8a8170" stroke-width="2.2"/>` +
    `<path d="M266 54 l-8 -4 M266 54 l-8 4" stroke="#8a8170" stroke-width="2.2" fill="none"/>` +
    node(40, '1591', '徳川家康が|朱印地を寄進', '#35547a') +
    node(125, '1737', '吉宗が桜を寄進|庶民の行楽地に', '#b8923f') +
    node(200, '1873〜', '製紙業・軍需産業|が並び立つ', '#35547a') +
    node(260, '1947', '北区誕生', '#262420') +
    `</svg>` +
    `<figcaption>王子の通史（模式図）。徳川家康の朱印地寄進（1591年）、8代将軍吉宗による桜の寄進と庶民への開放（1737年）を経て、明治以降は製紙業（1873年・抄紙会社設立）と軍需産業（1904年ごろ〜）という二つの近代産業が並び立ち、昭和22年（1947年）の北区誕生に至る。</figcaption>` +
    `</figure>`
  );
}

// 抄紙会社→王子製紙の社名変遷（4点）
function buildSeishiTimelineSvg(): string {
  const node = (x: number, year: string, label: string, color: string) =>
    `<circle cx="${x}" cy="54" r="9" fill="${color}"/>` +
    `<text x="${x}" y="34" font-size="11" font-weight="700" fill="#262420" text-anchor="middle">${year}</text>` +
    `<text x="${x}" y="80" font-size="10.5" fill="#262420" text-anchor="middle">${label.split('|')[0]}</text>` +
    (label.includes('|') ? `<text x="${x}" y="92" font-size="10.5" fill="#262420" text-anchor="middle">${label.split('|')[1]}</text>` : '');
  return (
    `<figure class="fig">` +
    `<svg class="diagram-single" viewBox="0 0 300 110" width="100%" role="img" aria-label="抄紙会社から王子製紙への年表の図">` +
    `<rect width="300" height="110" fill="#f0ede3"/>` +
    `<line x1="34" y1="54" x2="266" y2="54" stroke="#8a8170" stroke-width="2.2"/>` +
    `<path d="M266 54 l-8 -4 M266 54 l-8 4" stroke="#8a8170" stroke-width="2.2" fill="none"/>` +
    node(40, '1873', '抄紙会社が|設立される', '#35547a') +
    node(125, '1893', '「王子製紙」|へ改称', '#b8923f') +
    node(200, '1933', '富士製紙合併|洋紙8割超', '#35547a') +
    node(260, '1949', '財閥解体で|3社に分割', '#262420') +
    `</svg>` +
    `<figcaption>抄紙会社から王子製紙への社名変遷（模式図）。明治6年（1873年）設立の抄紙会社は、明治8年（1875年）に操業を始め、明治26年（1893年）に「王子製紙」へ改称。昭和8年（1933年）の富士製紙・樺太工業合併で洋紙生産の8割以上を占めたが、昭和24年（1949年）の過度経済力集中排除法により3社に分割された。</figcaption>` +
    `</figure>`
  );
}

// 陸軍造兵廠から赤レンガ図書館への年表（4点）
function buildGunjuTimelineSvg(): string {
  const node = (x: number, year: string, label: string, color: string) =>
    `<circle cx="${x}" cy="54" r="9" fill="${color}"/>` +
    `<text x="${x}" y="34" font-size="11" font-weight="700" fill="#262420" text-anchor="middle">${year}</text>` +
    `<text x="${x}" y="80" font-size="10.5" fill="#262420" text-anchor="middle">${label.split('|')[0]}</text>` +
    (label.includes('|') ? `<text x="${x}" y="92" font-size="10.5" fill="#262420" text-anchor="middle">${label.split('|')[1]}</text>` : '');
  return (
    `<figure class="fig">` +
    `<svg class="diagram-single" viewBox="0 0 300 110" width="100%" role="img" aria-label="陸軍造兵廠から赤レンガ図書館への年表の図">` +
    `<rect width="300" height="110" fill="#f0ede3"/>` +
    `<line x1="34" y1="54" x2="266" y2="54" stroke="#8a8170" stroke-width="2.2"/>` +
    `<path d="M266 54 l-8 -4 M266 54 l-8 4" stroke="#8a8170" stroke-width="2.2" fill="none"/>` +
    node(40, '1904', '日露戦争|弾丸不足で設置', '#35547a') +
    node(125, '1919', '弾丸工場の|建物が竣工', '#b8923f') +
    node(200, '1945', '敗戦・|米軍が接収', '#262420') +
    node(260, '2008', '赤レンガ|図書館へ転用', '#35547a') +
    `</svg>` +
    `<figcaption>陸軍造兵廠から赤レンガ図書館への年表（模式図）。日露戦争（1904年）前後の弾丸不足を受けて十条台に弾丸工場が設置され、大正8年（1919年）に建物が竣工。敗戦後は米軍に接収され、のちに陸上自衛隊十条駐屯地として使用されたが、平成20年（2008年）に北区立中央図書館（赤レンガ図書館）として生まれ変わった。</figcaption>` +
    `</figure>`
  );
}

// 弾丸工場から赤レンガ図書館への年表（4点）
function buildAkarengaTimelineSvg(): string {
  const node = (x: number, year: string, label: string, color: string) =>
    `<circle cx="${x}" cy="54" r="9" fill="${color}"/>` +
    `<text x="${x}" y="34" font-size="11" font-weight="700" fill="#262420" text-anchor="middle">${year}</text>` +
    `<text x="${x}" y="80" font-size="10.5" fill="#262420" text-anchor="middle">${label.split('|')[0]}</text>` +
    (label.includes('|') ? `<text x="${x}" y="92" font-size="10.5" fill="#262420" text-anchor="middle">${label.split('|')[1]}</text>` : '');
  return (
    `<figure class="fig">` +
    `<svg class="diagram-single" viewBox="0 0 300 110" width="100%" role="img" aria-label="赤レンガ図書館の年表の図">` +
    `<rect width="300" height="110" fill="#f0ede3"/>` +
    `<line x1="34" y1="54" x2="266" y2="54" stroke="#8a8170" stroke-width="2.2"/>` +
    `<path d="M266 54 l-8 -4 M266 54 l-8 4" stroke="#8a8170" stroke-width="2.2" fill="none"/>` +
    node(40, '1919', '弾丸工場の|建物が竣工', '#35547a') +
    node(150, '2008', '図書館として|再生', '#b8923f') +
    node(260, '2013', 'キーン蔵書の|コーナー開設', '#262420') +
    `</svg>` +
    `<figcaption>赤レンガ図書館の年表（模式図）。大正8年（1919年）に建てられた旧陸軍の弾丸工場の建物を保存活用し、平成20年（2008年）6月28日に図書館として再生。平成25年（2013年）にはドナルド・キーンの寄贈図書を閲覧できるコーナーが開設されました。</figcaption>` +
    `</figure>`
  );
}

// 飛鳥山公園の年表（4点）
function buildAsukayamaTimelineSvg(): string {
  const node = (x: number, year: string, label: string, color: string) =>
    `<circle cx="${x}" cy="54" r="9" fill="${color}"/>` +
    `<text x="${x}" y="34" font-size="11" font-weight="700" fill="#262420" text-anchor="middle">${year}</text>` +
    `<text x="${x}" y="80" font-size="10.5" fill="#262420" text-anchor="middle">${label.split('|')[0]}</text>` +
    (label.includes('|') ? `<text x="${x}" y="92" font-size="10.5" fill="#262420" text-anchor="middle">${label.split('|')[1]}</text>` : '');
  return (
    `<figure class="fig">` +
    `<svg class="diagram-single" viewBox="0 0 300 110" width="100%" role="img" aria-label="飛鳥山公園の年表の図">` +
    `<rect width="300" height="110" fill="#f0ede3"/>` +
    `<line x1="34" y1="54" x2="266" y2="54" stroke="#8a8170" stroke-width="2.2"/>` +
    `<path d="M266 54 l-8 -4 M266 54 l-8 4" stroke="#8a8170" stroke-width="2.2" fill="none"/>` +
    node(40, '1720頃', '吉宗が桜を|1200本以上植樹', '#35547a') +
    node(140, '1737', '王子権現社へ|寄進・庶民に開放', '#b8923f') +
    node(260, '1873', '太政官布達で|公園に指定', '#262420') +
    `</svg>` +
    `<figcaption>飛鳥山公園の年表（模式図）。8代将軍吉宗が享保5年（1720年）ごろから桜を植え、元文2年（1737年）に庶民へ開放。明治6年（1873年）1月15日、太政官布達第16号により日本最初期の公園の一つに指定されました。</figcaption>` +
    `</figure>`
  );
}

// 渋沢栄一の飛鳥山邸の年表（4点）
function buildShibusawaTeiTimelineSvg(): string {
  const node = (x: number, year: string, label: string, color: string) =>
    `<circle cx="${x}" cy="54" r="9" fill="${color}"/>` +
    `<text x="${x}" y="34" font-size="11" font-weight="700" fill="#262420" text-anchor="middle">${year}</text>` +
    `<text x="${x}" y="80" font-size="10.5" fill="#262420" text-anchor="middle">${label.split('|')[0]}</text>` +
    (label.includes('|') ? `<text x="${x}" y="92" font-size="10.5" fill="#262420" text-anchor="middle">${label.split('|')[1]}</text>` : '');
  return (
    `<figure class="fig">` +
    `<svg class="diagram-single" viewBox="0 0 300 110" width="100%" role="img" aria-label="渋沢栄一の飛鳥山邸の年表の図">` +
    `<rect width="300" height="110" fill="#f0ede3"/>` +
    `<line x1="34" y1="54" x2="266" y2="54" stroke="#8a8170" stroke-width="2.2"/>` +
    `<path d="M266 54 l-8 -4 M266 54 l-8 4" stroke="#8a8170" stroke-width="2.2" fill="none"/>` +
    node(40, '1901', '渋沢栄一が|飛鳥山に本邸', '#35547a') +
    node(125, '1917〜18', '晩香廬が|竣工（諸説）', '#b8923f') +
    node(200, '1931', '渋沢栄一|没する', '#262420') +
    node(260, '2005', '晩香廬・青淵文庫|重要文化財に', '#35547a') +
    `</svg>` +
    `<figcaption>渋沢栄一の飛鳥山邸の年表（模式図）。明治34年（1901年）から昭和6年（1931年）に没するまで本邸を構え、晩香廬は資料によって大正6〜7年（1917〜1918年）とされています。戦災を免れた晩香廬・青淵文庫は平成17年（2005年）12月27日に国の重要文化財に一括指定されました。</figcaption>` +
    `</figure>`
  );
}

// 装束稲荷の狐火伝承から「狐の行列」までの年表
function buildSozokuInariTimelineSvg(): string {
  const node = (x: number, year: string, label: string, color: string) =>
    `<circle cx="${x}" cy="54" r="9" fill="${color}"/>` +
    `<text x="${x}" y="34" font-size="11" font-weight="700" fill="#262420" text-anchor="middle">${year}</text>` +
    `<text x="${x}" y="80" font-size="10.5" fill="#262420" text-anchor="middle">${label.split('|')[0]}</text>` +
    (label.includes('|') ? `<text x="${x}" y="92" font-size="10.5" fill="#262420" text-anchor="middle">${label.split('|')[1]}</text>` : '');
  return (
    `<figure class="fig">` +
    `<svg class="diagram-single" viewBox="0 0 300 110" width="100%" role="img" aria-label="装束稲荷の狐火伝承の年表の図">` +
    `<rect width="300" height="110" fill="#f0ede3"/>` +
    `<line x1="34" y1="54" x2="266" y2="54" stroke="#8a8170" stroke-width="2.2"/>` +
    `<path d="M266 54 l-8 -4 M266 54 l-8 4" stroke="#8a8170" stroke-width="2.2" fill="none"/>` +
    node(40, '伝承', '大晦日に狐が|装束を整える', '#35547a') +
    node(150, '1857', '広重が「名所|江戸百景」に描く', '#b8923f') +
    node(260, '1993', '「狐の行列」|が始まる', '#262420') +
    `</svg>` +
    `<figcaption>装束稲荷の狐火伝承の年表（模式図）。大晦日に狐が装束を整えるという伝承は、安政4年（1857年）に歌川広重が「名所江戸百景」に描きました。平成5年（1993年）の大晦日から、伝承にちなむ「狐の行列」という新しい行事が始まっています。</figcaption>` +
    `</figure>`
  );
}

// 年表図の共通ヘルパー（ラベルは1節点あたり最大3行）
function buildLinearTimeline(
  id: string,
  title: string,
  desc: string,
  nodes: { x: number; year: string; lines: string[]; color: string }[],
  caption: string,
): string {
  const parts = nodes
    .map(
      (n) =>
        `<circle cx="${n.x}" cy="54" r="9" fill="${n.color}"/>` +
        `<text x="${n.x}" y="34" font-size="12" font-weight="700" fill="#262420" text-anchor="middle">${n.year}</text>` +
        n.lines.map((l, i) => `<text x="${n.x}" y="${80 + i * 13}" font-size="11.5" fill="#262420" text-anchor="middle">${l}</text>`).join(''),
    )
    .join('');
  return (
    `<figure class="fig">` +
    `<svg class="diagram-single" viewBox="0 0 320 124" width="100%" role="img" aria-labelledby="${id}-title ${id}-desc">` +
    `<title id="${id}-title">${title}</title><desc id="${id}-desc">${desc}</desc>` +
    `<rect width="320" height="124" fill="#f0ede3"/>` +
    `<line x1="24" y1="54" x2="296" y2="54" stroke="#8a8170" stroke-width="2.2"/>` +
    `<path d="M296 54 l-8 -4 M296 54 l-8 4" stroke="#8a8170" stroke-width="2.2" fill="none"/>` +
    parts +
    `</svg><figcaption>${caption}</figcaption></figure>`
  );
}

const chimeiFigure = () =>
  buildLinearTimeline('chimei', '王子の地名が生まれるまでの年表の図', '源氏武将の伝承、元亨2年の若一王子の勧請、岸村から王子村への改称までの年表。', [
    { x: 56, year: '11世紀', lines: ['源氏の武将が', '慰霊（伝承）'], color: '#8a8170' },
    { x: 160, year: '1322', lines: ['熊野から', '若一王子を勧請'], color: '#b8923f' },
    { x: 262, year: '改称', lines: ['岸村から', '王子村へ', '（時期は諸説）'], color: '#35547a' },
  ], '勧請は元亨2年（1322年）と伝わりますが、資料によって年代に揺れがあり、改称の時期も確定していません。');

const ogiyaFigure = () =>
  buildLinearTimeline('ogiya', '扇屋の年表の図', '慶安元年の掛茶屋としての創業、寛政11年頃の料理屋への転身、現在の玉子焼き専門店までの年表。', [
    { x: 56, year: '1648', lines: ['弥左ェ門が', '掛茶屋を創業'], color: '#35547a' },
    { x: 160, year: '1799頃', lines: ['料理屋へ転身', '玉子焼きで有名に'], color: '#b8923f' },
    { x: 262, year: '現在', lines: ['玉子焼き', '専門店'], color: '#262420' },
  ], '慶安元年（1648年）に王子稲荷の門前で掛茶屋として始まった店は、料理屋を経て玉子焼き専門店になりました。創業は伝承にもとづきます。');

// 王子七滝の現況（名主の滝の記事用）
function buildNanushiSvg(): string {
  const rows: { name: string; note: string; color: string }[] = [
    { name: '名主の滝', note: '現存（園内は男滝のみ）', color: '#35547a' },
    { name: '権現の滝', note: '音無親水公園に復元', color: '#b8923f' },
    { name: '不動の滝', note: '現存せず', color: '#8a8170' },
    { name: '弁天の滝', note: '現存せず', color: '#8a8170' },
    { name: '稲荷の滝', note: '現存せず', color: '#8a8170' },
    { name: '大工の滝', note: '現存せず', color: '#8a8170' },
    { name: '見晴らしの滝', note: '現存せず', color: '#8a8170' },
  ];
  const body = rows
    .map((r, i) => {
      const y = 30 + i * 26;
      return `<circle cx="20" cy="${y - 4}" r="6" fill="${r.color}"/>` +
        `<text x="36" y="${y}" font-size="12" font-weight="700" fill="#262420">${r.name}</text>` +
        `<text x="128" y="${y}" font-size="11.5" fill="#262420">${r.note}</text>`;
    })
    .join('');
  return `<figure class="fig">` +
    `<svg class="diagram-single" viewBox="0 0 300 210" width="100%" role="img" aria-label="王子七滝の現況の図">` +
    `<title>王子七滝の現況の図</title>` +
    `<rect width="300" height="210" fill="#f0ede3"/>` +
    body +
    `</svg>` +
    `<figcaption>王子七滝のうち、いまも水が落ちるのは名主の滝だけです。権現の滝は音無親水公園に復元されたものです。</figcaption>` +
    `</figure>`;
}

const figures: Record<string, string> = {
  meguru: buildRouteMapSvg(),
  chimei: chimeiFigure(),
  ogiya: ogiyaFigure(),
  history: buildHistoryTimelineSvg(),
  seishi: buildSeishiTimelineSvg(),
  gunju: buildGunjuTimelineSvg(),
  'akarenga-library': buildAkarengaTimelineSvg(),
  'sozoku-inari': buildSozokuInariTimelineSvg(),
  asukayama: buildAsukayamaTimelineSvg(),
  'shibusawa-tei': buildShibusawaTeiTimelineSvg(),
  'nanushi-no-taki': buildNanushiSvg(),
};

export function figureHtml(slug: string): string | null {
  return figures[slug] ?? null;
}
