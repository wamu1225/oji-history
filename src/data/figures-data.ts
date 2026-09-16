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

const figures: Record<string, string> = {
  meguru: buildRouteMapSvg(),
};

export function figureHtml(slug: string): string | null {
  return figures[slug] ?? null;
}
