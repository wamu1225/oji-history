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

  const legM = pts.map((p, i) =>
    i === 0 ? 0 : Math.round(Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) / 10) * 10,
  );
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
      ${pts.map((p) => `<li><span class="fig-map__dot fig-map__dot--${p.category}">${p.order}</span>${esc(p.name)}${legM[p.order - 1] ? `<span class="fig-map__leg">前の地点から直線約${legM[p.order - 1]}m</span>` : ''}</li>`).join('\n      ')}
    </ol>
    <p class="fig-map__key">
      <span class="fig-map__key-item"><span class="fig-map__dot fig-map__dot--faith">●</span>社寺・信仰</span>
      <span class="fig-map__key-item"><span class="fig-map__dot fig-map__dot--heritage">●</span>公園・近代遺産</span>
    </p>
  </div>
  <figcaption>6地点の位置関係を、各施設の公表座標から算出して描いた図。測量精度ではなく、実座標にもとづく相対位置の目安。凡例の距離は地点間の直線で、6区間の合計は約1.9km。道のりは道路により長くなる。</figcaption>
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
    `<figcaption>家康の寄進から北区の誕生まで。近代は製紙と軍需が並んでいました。</figcaption>` +
    `</figure>`
  );
}

// 抄紙会社の3年（拡大）と、社名の移り変わり76年（縮小）を年に比例した2段で見せる
function buildSeishiTimelineSvg(): string {
  const ax = (yr: number) => 20 + (yr - 1872) * (280 / 6);
  const bx = (yr: number) => 20 + (yr - 1873) * (280 / 76);
  const t = (x: number, y: number, s: string, anchor = 'middle', bold = false) =>
    `<text x="${x.toFixed(1)}" y="${y}" font-size="10" ${bold ? 'font-weight="700" ' : ''}fill="#262420" text-anchor="${anchor}">${s}</text>`;
  const dot = (x: number, color: string) => `<circle cx="${x.toFixed(1)}" cy="64" r="5" fill="${color}"/>`;
  const leader = (x: number, y1: number, y2: number) => `<line x1="${x.toFixed(1)}" y1="${y1}" x2="${x.toFixed(1)}" y2="${y2}" stroke="#8a8170" stroke-width="1"/>`;
  let a = '';
  a += t(20, 14, '1872〜1877年の6年を拡大', 'start', true);
  a += `<line x1="20" y1="64" x2="300" y2="64" stroke="#8a8170" stroke-width="2"/>`;
  for (let y = 1872; y <= 1878; y++) a += `<line x1="${ax(y).toFixed(1)}" y1="60" x2="${ax(y).toFixed(1)}" y2="68" stroke="#8a8170" stroke-width="1"/>`;
  const up = (yr: number, l1: string, l2: string, anchor: string, tx: number, color: string) =>
    leader(ax(yr), 54, 64) + dot(ax(yr), color) + t(tx, 36, l1, anchor, true) + t(tx, 48, l2, anchor);
  const down = (yr: number, l1: string, l2: string, anchor: string, tx: number, color: string) =>
    leader(ax(yr), 64, 76) + dot(ax(yr), color) + t(tx, 90, l1, anchor, true) + t(tx, 102, l2, anchor);
  a += up(1872.87, '1872年11月', '12名が出願', 'start', 20, '#8a8170');
  a += down(1873.12, '1873年2月', '抄紙会社の設立', 'start', 20, '#35547a');
  a += up(1874.5, '1874年', '外国人技師2人', 'start', 100, '#b8923f');
  a += down(1875.96, '1875年12月', '開業式', 'middle', ax(1875.96), '#b0463a');
  a += up(1877.5, '1877年', '2人が退社', 'middle', 262, '#262420');
  // 下段：社名の移り変わり（1873〜1949）
  let b = '';
  b += t(20, 128, '1873〜1949年の76年を縮小', 'start', true);
  const seg = (y0: number, y1: number, fill: string, label: string) =>
    `<rect x="${bx(y0).toFixed(1)}" y="138" width="${(bx(y1) - bx(y0)).toFixed(1)}" height="22" fill="${fill}"/>` +
    (label ? `<text x="${((bx(y0) + bx(y1)) / 2).toFixed(1)}" y="153" font-size="10" fill="#fff" text-anchor="middle">${label}</text>` : '');
  b += seg(1873, 1876, '#35547a', '') + seg(1876, 1893, '#8a8170', '製紙会社') + seg(1893, 1949, '#b0463a', '王子製紙（56年）');
  const tick = (yr: number, y: number, s: string, anchor: string, tx: number) =>
    `<line x1="${bx(yr).toFixed(1)}" y1="160" x2="${bx(yr).toFixed(1)}" y2="${y - 10}" stroke="#8a8170" stroke-width="1"/>` + t(tx, y, s, anchor);
  b += tick(1873, 176, '1873 設立', 'start', 20);
  b += tick(1893, 190, '1893 王子製紙へ改称', 'start', bx(1893));
  b += tick(1933, 176, '1933 富士製紙と合併', 'middle', bx(1933));
  b += tick(1949, 190, '1949 3社に分割', 'end', 300);
  return (
    `<figure class="fig">` +
    `<svg class="diagram-single" viewBox="0 0 320 200" width="100%" role="img" aria-label="抄紙会社の設立から開業までの3年と、1949年の3社分割までの社名の移り変わりを、年に比例して描いた図">` +
    `<title>抄紙会社の3年と社名の移り変わりの図</title>` +
    `<rect width="320" height="200" fill="#f0ede3"/>` + a + b +
    `</svg>` +
    `<figcaption>上は出願から開業までの3年。出願・設立・開業は3つの別の年で、外国人技師が雇われたのは設立の翌年でした。下は社名の移り変わりで、「抄紙会社」と呼ばれたのは3年ほどです。</figcaption>` +
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
    `<figcaption>弾丸工場の建物が、米軍・自衛隊を経て図書館になりました。</figcaption>` +
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
    `<figcaption>大正の工場の建物を、そのまま図書館に使っています。</figcaption>` +
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
    node(40, '1720頃', '吉宗が桜を|約1000本植樹', '#35547a') +
    node(140, '1737', '王子権現社へ|寄進・庶民に開放', '#b8923f') +
    node(260, '1873', '太政官布達で|公園に指定', '#262420') +
    `</svg>` +
    `<figcaption>桜を植え始めてから庶民に開くまで、約17年。</figcaption>` +
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
    node(40, '1917〜18', '晩香廬が|竣工（諸説）', '#b8923f') +
    node(125, '1925', '青淵文庫が|竣工', '#b8923f') +
    node(200, '1931', '渋沢栄一|没する', '#262420') +
    node(260, '2005', '晩香廬・青淵文庫|重要文化財に', '#35547a') +
    `</svg>` +
    `<figcaption>晩香廬の竣工年は、資料によって1917年と1918年に分かれます。</figcaption>` +
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
    `<figcaption>狐の行列は、伝承にちなんで平成に始まった新しい行事です。</figcaption>` +
    `</figure>`
  );
}

const chimeiFigure = () => {
  const t = (x: number, y: number, v: string, anchor = 'middle', bold = false) =>
    `<text x="${x.toFixed(1)}" y="${y}" font-size="11" ${bold ? 'font-weight="700" ' : ''}fill="#262420" text-anchor="${anchor}">${v}</text>`;
  const ax = (yr: number) => 24 + (yr - 1300) * (272 / 200);
  const a = ax(1322);
  const b = ax(1478);
  let g = t(24, 16, '「王子」の始まりは、資料で156年ずれる', 'start', true);
  g += `<line x1="24" y1="62" x2="296" y2="62" stroke="#8a8170" stroke-width="2"/>`;
  g += `<line x1="${a.toFixed(1)}" y1="62" x2="${b.toFixed(1)}" y2="62" stroke="#b0463a" stroke-width="6"/>`;
  g += `<circle cx="${a.toFixed(1)}" cy="62" r="5" fill="#b8923f"/><circle cx="${b.toFixed(1)}" cy="62" r="5" fill="#35547a"/>`;
  g += t(a, 42, '1322年', 'start', true) + t(a, 84, '元亨2年・勧請', 'start');
  g += t(a, 98, '（通説・豊島氏）', 'start');
  g += t(b, 42, '1478年', 'end', true) + t(b, 84, '文明10年・鎮座', 'end');
  g += t(b, 98, '（『水府志料』）', 'end');
  g += t((a + b) / 2, 62 + 22, '', 'middle');
  g += t(24, 118, '1300', 'start') + t(296, 118, '1500年', 'end');
  return (
    `<figure class="fig"><svg class="diagram-single" viewBox="0 0 320 126" width="100%" role="img" aria-labelledby="chimei-title chimei-desc">` +
    `<title id="chimei-title">王子の地名が生まれた年の二つの説の図</title>` +
    `<desc id="chimei-desc">1322年と1478年の2つの年を、年に比例して並べた図。間は156年。</desc>` +
    `<rect width="320" height="126" fill="#f0ede3"/>${g}</svg>` +
    `<figcaption>どちらの年も勧請・鎮座の年で、岸村から王子村への改称の時期は確定していません。</figcaption></figure>`
  );
};

// 扇屋：開業の年の食い違い（拡大前）と、広重の絵までの年表を、年に比例した2段で描く
function buildOgiyaSvg(): string {
  const t = (x: number, y: number, s: string, anchor = 'middle', bold = false) =>
    `<text x="${x.toFixed(1)}" y="${y}" font-size="10" ${bold ? 'font-weight="700" ' : ''}fill="#262420" text-anchor="${anchor}">${s}</text>`;
  const ax = (yr: number) => 20 + (yr - 1640) * (280 / 170);
  const bx = (yr: number) => 20 + (yr - 1795) * (280 / 100);
  let a = t(20, 14, '開業の年は、資料で151年ずれる', 'start', true);
  a += `<line x1="20" y1="52" x2="300" y2="52" stroke="#8a8170" stroke-width="2"/>`;
  a += `<line x1="${ax(1648).toFixed(1)}" y1="52" x2="${ax(1799).toFixed(1)}" y2="52" stroke="#b0463a" stroke-width="5"/>`;
  a += `<circle cx="${ax(1648).toFixed(1)}" cy="52" r="5" fill="#8a8170"/><circle cx="${ax(1799).toFixed(1)}" cy="52" r="5" fill="#35547a"/>`;
  a += t(ax(1648), 34, '1648年', 'start', true) + t(ax(1648), 74, '店の案内の創業', 'start');
  a += t(ax(1799), 34, '1799年', 'end', true) + t(ax(1799), 74, '北区の資料の開業', 'end');
  a += t((ax(1648) + ax(1799)) / 2, 94, '151年', 'middle', true);
  let b = t(20, 124, '1795〜1895年の100年を拡大', 'start', true);
  b += `<line x1="20" y1="150" x2="300" y2="150" stroke="#8a8170" stroke-width="2"/>`;
  b += `<rect x="${bx(1804).toFixed(1)}" y="144" width="${(bx(1830) - bx(1804)).toFixed(1)}" height="12" fill="#b8923f"/>`;
  b += `<circle cx="${bx(1799).toFixed(1)}" cy="150" r="5" fill="#35547a"/><circle cx="${bx(1839).toFixed(1)}" cy="150" r="5" fill="#b0463a"/><circle cx="${bx(1887).toFixed(1)}" cy="150" r="5" fill="#8a8170"/>`;
  b += t(bx(1799), 136, '1799年 開業', 'start') + t(bx(1817), 172, '文化・文政期 番付で上位', 'start');
  b += t(bx(1839), 136, '1838〜40年頃 広重の絵', 'start') + t(bx(1887), 185, '明治中ごろ 海老屋が消える', 'end');
  return (
    `<figure class="fig">` +
    `<svg class="diagram-single" viewBox="0 0 320 194" width="100%" role="img" aria-label="扇屋の開業年が資料で151年ずれることと、1799年の開業から明治中ごろまでの年表を、年に比例して描いた図">` +
    `<title>扇屋の開業年と、広重の絵までの年表の図</title>` +
    `<rect width="320" height="194" fill="#f0ede3"/>` + a + b +
    `</svg>` +
    `<figcaption>上は、北区の資料（1799年）と店の案内（1648年）の開き。下は開業と伝わる1799年から、広重が描いた1838〜40年頃、海老屋が消えた明治中ごろまでです。</figcaption>` +
    `</figure>`
  );
}

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

// トップの絵：左に桜の飛鳥山、中ほどに王子神社・王子稲荷の鳥居と社殿、右に赤レンガの建物（弾丸工場→図書館）、手前に石神井川（音無川）（模式図）
export function heroSceneSvg(): string {
  const tree = (x: number, y: number, r: number) =>
    `<rect x="${x - 1.5}" y="${y}" width="3" height="${r + 4}" fill="#6b5a48"/>` +
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#e7c3cb"/><circle cx="${x - r * 0.6}" cy="${y + 3}" r="${r * 0.7}" fill="#efd3d9"/>`;
  let windows = '';
  for (let i = 0; i < 6; i++) {
    const x = 236 + i * 18;
    windows += `<path d="M${x} 146 v-16 a5 5 0 0 1 10 0 v16 z" fill="#f3e3cf"/>`;
  }
  let bricks = '';
  for (let y = 112; y < 150; y += 7) bricks += `<line x1="226" y1="${y}" x2="346" y2="${y}" stroke="#8f4733" stroke-width="0.8"/>`;
  return `<svg viewBox="0 0 360 210" width="100%" role="img" aria-label="王子の町の模式的な絵。左に桜の咲く飛鳥山、中ほどに神社の鳥居と社殿、右に赤レンガの建物、手前に石神井川の流れ">
  <rect width="360" height="210" fill="#e8eef5"/>
  <circle cx="300" cy="40" r="16" fill="#f3d9a4"/>
  <path d="M0 150 L0 104 Q40 72 84 70 Q128 72 168 150 Z" fill="#9fb39a"/>
  ${tree(28, 98, 11)}${tree(56, 82, 12)}${tree(88, 78, 12)}${tree(118, 92, 11)}${tree(142, 116, 10)}
  <g transform="translate(160,104)"><path d="M6 20 L34 6 L62 20 Z" fill="#35547a"/><rect x="12" y="20" width="44" height="26" fill="#efe6d6" stroke="#35547a" stroke-width="1.2"/><rect x="28" y="30" width="12" height="16" fill="#35547a"/></g>
  <g transform="translate(176,118)" fill="#b0463a"><rect x="3" y="7" width="3" height="25"/><rect x="25" y="7" width="3" height="25"/><path d="M-3 2 Q15.5 5 34 2 L34 6 Q15.5 9 -3 6 Z"/><rect x="0" y="11" width="31" height="3"/></g>
  <path d="M222 108 L232 98 L340 98 L350 108 Z" fill="#5a4a3e"/>
  <rect x="226" y="108" width="120" height="42" fill="#b35e45"/>
  ${bricks}${windows}
  <rect x="0" y="150" width="360" height="10" fill="#cbbf9f"/>
  <path d="M0 160 H360 V210 H0 Z" fill="#7d9bb8"/>
  <path d="M0 160 Q60 168 120 162 T240 164 T360 160" fill="none" stroke="#a9c0d6" stroke-width="2"/>
  <path d="M24 182 h44 M110 194 h56 M214 180 h48 M290 198 h46" stroke="#a9c0d6" stroke-width="2" stroke-linecap="round"/>
</svg>`;
}

const figures: Record<string, string> = {
  meguru: buildRouteMapSvg(),
  chimei: chimeiFigure(),
  ogiya: buildOgiyaSvg(),
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
