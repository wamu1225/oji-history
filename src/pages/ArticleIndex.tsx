import { articles } from '../data/articles';
import { ARTICLE_GROUPS } from '../data/articleGroups';
import { CATEGORY_LABEL } from '../data/types';
import { href } from '../lib/router';

// 記事を「読む順」のまとまりに分けて並べる。どのまとまりにも入っていない記事は最後に
export default function ArticleIndex() {
  const grouped = new Set(ARTICLE_GROUPS.flatMap((g) => g.slugs));
  const groups = [
    ...ARTICLE_GROUPS.map((g) => ({ ...g, items: g.slugs.map((s) => articles.find((a) => a.slug === s)).filter((a) => a !== undefined) })),
    { title: 'そのほか', lead: '', slugs: [], items: articles.filter((a) => !grouped.has(a.slug)) },
  ].filter((g) => g.items.length);
  return (
    <>
      <h1 className="content-h1">記事一覧</h1>
      {groups.map((g) => (
        <section key={g.title} className="article-index__group">
          <h2>{g.title}</h2>
          {g.lead && <p className="article-index__lead">{g.lead}</p>}
          <ul className="article-index">
            {g.items.map((a) => (
              <li key={a.slug} className="article-index__item">
                <span className="article-index__zone">{CATEGORY_LABEL[a.category]}</span>
                <a href={href(`/articles/${a.slug}/`)}>{a.title}</a>
                <p>{a.dek}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
