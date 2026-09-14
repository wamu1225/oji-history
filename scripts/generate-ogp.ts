// scripts/generate-ogp.ts — OGP画像（1200×630）を public/ogp.png に生成する。
// 実行: npx tsx scripts/generate-ogp.ts
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const FONT_SERIF = "'Hiragino Mincho ProN','Yu Mincho',serif";
const FONT_SANS = "-apple-system,'Hiragino Sans','Yu Gothic UI',sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f0ede3"/>
  <rect x="0" y="0" width="1200" height="14" fill="#35547a"/>
  <rect x="80" y="420" width="130" height="130" fill="#a0522d"/>
  <rect x="210" y="420" width="130" height="130" fill="#8b4226"/>
  <rect x="80" y="550" width="260" height="40" fill="#6b3419"/>
  <circle cx="1040" cy="150" r="34" fill="#35547a"/>
  <circle cx="1110" cy="190" r="26" fill="#35547a" opacity="0.75"/>
  <circle cx="1055" cy="230" r="20" fill="#35547a" opacity="0.55"/>
  <text x="80" y="230" font-family="${FONT_SERIF}" font-size="60" font-weight="700" fill="#262420">王子の歴史と文化ガイド</text>
  <text x="80" y="290" font-family="${FONT_SANS}" font-size="26" fill="#6b6259">地名の由来から製紙業、王子田楽、赤レンガ図書館まで</text>
  <text x="80" y="390" font-family="${FONT_SANS}" font-size="22" fill="#35547a" font-weight="600">study-apps.com/oji-history/</text>
</svg>`;

async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  const outPath = path.join(PUBLIC_DIR, 'ogp.png');
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`✓ ogp.png (1200x630) を生成: ${outPath}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
