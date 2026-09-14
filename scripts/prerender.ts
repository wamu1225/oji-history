// scripts/prerender.ts：SSG。トップ（分野別の入口）、記事一覧、記事本体、about/privacyの
// 静的フォールバックHTML、per-page meta、JSON-LDを焼き込み、sitemap.xmlを生成する。
// 実行: npx tsx scripts/prerender.ts（npm run predeploy 内）
import * as fs from 'fs';
import * as path from 'path';
import { articles } from '../src/data/articles';
import { ABOUT_CONTENT, PRIVACY_CONTENT, SITE_NAME } from '../src/data/static-pages';
import { CATEGORY_LABEL, type Category } from '../src/data/types';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const BASE = '/oji-history';
const BASE_URL = 'https://study-apps.com/oji-history';
const SITE_UPDATED_AT = '2026-09-15';

console.log('--- oji-history SSG Pre-rendering ---');
if (!fs.existsSync(INDEX_HTML_PATH)) {
  console.error('Error: dist/index.html not found. Run "npm run build" first.');
  process.exit(1);
}

const templateHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');
function templateForDepth(depth: number): string {
  if (depth === 0) return templateHtml;
  const up = '../'.repeat(depth);
  return templateHtml
    .replace(/href="\.\/assets\//g, `href="${up}assets/`)
    .replace(/src="\.\/assets\//g, `src="${up}assets/`)
    .replace(/href="\.\/favicon\.svg"/g, `href="${up}favicon.svg"`);
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function mdToHtml(content: string): string {
  return content
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => (b.startsWith('## ') ? `<h2>${esc(b.slice(3))}</h2>` : `<p>${esc(b)}</p>`))
    .join('\n');
}

function applyMeta(html: string, title: string, description: string, urlPath: string): string {
  const fullTitle = urlPath === '/' ? SITE_NAME : `${title}｜${SITE_NAME}`;
  const url = `${BASE_URL}${urlPath}`;
  return html
    .replace(/<title>.*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${esc(description)}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${esc(fullTitle)}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${esc(description)}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${esc(fullTitle)}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${esc(description)}" />`);
}

function writePage(subpath: string, html: string) {
  const dir = subpath === '' ? DIST_DIR : path.join(DIST_DIR, subpath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

const footerNav = `<nav style="margin-top:24px;display:flex;gap:16px;flex-wrap:wrap"><a href="${BASE}/about/" style="color:#35547a">このサイトについて</a><a href="${BASE}/privacy/" style="color:#35547a">プライバシーポリシー</a></nav>`;

const shellStyle =
  'font-family:sans-serif;line-height:1.85;max-width:720px;margin:0 auto;padding:24px 20px;color:#262420';
const h1Style = 'font-size:1.5rem;border-bottom:3px solid #35547a;padding-bottom:8px;margin-bottom:16px;color:#35547a';

function wrap(depth: number, title: string, desc: string, urlPath: string, bodyHtml: string, jsonLd: object) {
  let html = applyMeta(templateForDepth(depth), title, desc, urlPath);
  html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`);
  return html;
}

const CATEGORY_ORDER: Category[] = ['name-origin', 'history', 'shrine', 'food', 'industry', 'culture', 'spots', 'faq'];

// ── トップ（分野別の入口＝亀戸型） ──
const homeDesc =
  '東京都北区王子の歴史と文化を一次資料でまとめる。地名の由来、王子田楽、製紙業と軍需産業、飛鳥山公園、装束稲荷の狐火伝承まで。';
const groupedHtml = CATEGORY_ORDER.map((cat) => {
  const list = articles.filter((a) => a.category === cat);
  if (list.length === 0) return '';
  const rows = list
    .map(
      (a) =>
        `<li><a href="${BASE}/articles/${a.slug}/" style="color:#35547a"><strong>${esc(a.title)}</strong></a><br/><span style="color:#6b6259;font-size:0.88rem">${esc(a.dek)}</span></li>`,
    )
    .join('\n');
  return `<h2 style="font-size:1.15rem;margin:24px 0 8px;color:#35547a">${esc(CATEGORY_LABEL[cat])}</h2>\n<ul style="padding-left:18px">${rows}</ul>`;
}).join('\n');
const homeBody = `<article style="${shellStyle}">
  <p style="color:#6b6259;font-size:0.8rem">東京都北区 王子</p>
  <h1 style="${h1Style}">王子の歴史と文化</h1>
  <p>${esc(homeDesc)}</p>
  ${groupedHtml}
  ${footerNav}
</article>`;
writePage(
  '',
  wrap(0, '', homeDesc, '/', homeBody, {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${BASE_URL}/`,
    description: homeDesc,
    inLanguage: 'ja',
  }),
);
console.log('✓ トップページ');

// ── 記事一覧 ──
{
  const desc = '王子の地名の由来から、王子田楽、製紙業、軍需産業、飛鳥山公園、狐火伝承までをまとめた記事一覧です。';
  const rows = articles
    .map(
      (a) =>
        `<li>[${CATEGORY_LABEL[a.category]}] <a href="${BASE}/articles/${a.slug}/" style="color:#35547a">${esc(a.title)}</a>：${esc(a.dek)}</li>`,
    )
    .join('\n');
  const body = `<article style="${shellStyle}">
    <h1 style="${h1Style}">記事一覧</h1>
    <p>${esc(desc)}</p>
    <ul style="padding-left:18px">${rows}</ul>
    ${footerNav}
  </article>`;
  writePage(
    'articles',
    wrap(1, '記事一覧', desc, '/articles/', body, {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: '記事一覧',
      url: `${BASE_URL}/articles/`,
      inLanguage: 'ja',
    }),
  );
}
console.log('✓ /articles/');

// ── 記事本体 ──
for (const a of articles) {
  const sectionsHtml = a.sections
    .map(
      (s) =>
        `<h2 style="font-size:1.05rem;margin-top:24px">${esc(s.heading)}</h2>${s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n')}`,
    )
    .join('\n');
  const sourcesHtml = a.sources.map((s) => `<li>${esc(s)}</li>`).join('\n');
  const body = `<article style="${shellStyle}">
    <p style="display:inline-block;font-size:0.74rem;padding:3px 10px;border-radius:12px;color:#fff;background:#35547a">${esc(CATEGORY_LABEL[a.category])}</p>
    <h1 style="${h1Style}">${esc(a.title)}</h1>
    <p style="color:#6b6259">${esc(a.dek)}</p>
    ${sectionsHtml}
    <div style="margin-top:24px;padding:14px 16px;background:#fff;border:1px solid #8a8170;border-radius:6px">
      <strong>出典</strong>
      <ul style="margin:6px 0 0;padding-left:18px">${sourcesHtml}</ul>
    </div>
    <p style="margin-top:20px"><a href="${BASE}/articles/" style="color:#35547a">← 記事一覧に戻る</a></p>
    ${footerNav}
  </article>`;
  writePage(
    `articles/${a.slug}`,
    wrap(2, a.title, a.dek, `/articles/${a.slug}/`, body, {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.title,
      description: a.dek,
      dateModified: a.updatedAt,
      url: `${BASE_URL}/articles/${a.slug}/`,
      inLanguage: 'ja',
    }),
  );
}
console.log(`✓ /articles/<slug>/ 全${articles.length}件`);

// ── about / privacy ──
for (const [slug, title, desc, content] of [
  ['about', 'このサイトについて', `${SITE_NAME}のデータの出典と編集方針を説明します。`, ABOUT_CONTENT],
  ['privacy', 'プライバシーポリシー', `${SITE_NAME}のプライバシーポリシー。`, PRIVACY_CONTENT],
] as const) {
  const body = `<article style="${shellStyle}">
    <h1 style="${h1Style}">${esc(title)}</h1>
    ${mdToHtml(content)}
    ${footerNav}
  </article>`;
  writePage(
    slug,
    wrap(1, title, desc, `/${slug}/`, body, {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description: desc,
      url: `${BASE_URL}/${slug}/`,
      inLanguage: 'ja',
    }),
  );
}
console.log('✓ /about/ /privacy/');

// ── sitemap.xml（lastmodはページ単位＝O-2-27の教訓。全URL一律の日付にしない） ──
const urls = [
  { loc: `${BASE_URL}/`, priority: '1.0', lastmod: SITE_UPDATED_AT },
  { loc: `${BASE_URL}/articles/`, priority: '0.8', lastmod: SITE_UPDATED_AT },
  ...articles.map((a) => ({ loc: `${BASE_URL}/articles/${a.slug}/`, priority: '0.7', lastmod: a.updatedAt })),
  { loc: `${BASE_URL}/about/`, priority: '0.3', lastmod: SITE_UPDATED_AT },
  { loc: `${BASE_URL}/privacy/`, priority: '0.2', lastmod: SITE_UPDATED_AT },
];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml);
console.log(`✓ sitemap.xml（全${urls.length}URL）`);

console.log('--- Done ---');
