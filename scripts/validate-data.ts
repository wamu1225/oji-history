import { articles } from '../src/data/articles';

let errors = 0;

function fail(msg: string) {
  console.error(`✗ ${msg}`);
  errors++;
}

const slugs = new Set<string>();
for (const a of articles) {
  if (slugs.has(a.slug)) fail(`記事slug重複: ${a.slug}`);
  slugs.add(a.slug);
  if (!a.title || !a.dek) fail(`記事の必須フィールド欠落: ${a.slug}`);
  if (a.sources.length === 0) fail(`出典が0件: ${a.slug}`);
  if (a.sections.length === 0) fail(`本文セクションが0件: ${a.slug}`);
  const totalChars = a.sections.reduce((sum, s) => sum + s.paragraphs.join('').length, 0);
  if (totalChars < 300) fail(`本文が短すぎる（300字未満・${totalChars}字）: ${a.slug}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.updatedAt)) fail(`updatedAtの形式不正: ${a.slug}`);
  for (const s of a.sections) {
    if (s.paragraphs.length === 0) fail(`セクション「${s.heading}」の段落が0件: ${a.slug}`);
  }
}

console.log('--- oji-history データ検証 ---');
console.log(`記事: ${articles.length}本`);

if (errors > 0) {
  console.error(`\n❌ ${errors}件のエラー`);
  process.exit(1);
}
console.log('\n✅ All checks passed!');
