import { articles } from '../data/articles';
import { CATEGORY_LABEL } from '../data/types';
import { href } from '../lib/router';

export default function ArticlePage({ id }: { id: string }) {
  const article = articles.find((a) => a.slug === id);
  if (!article) {
    return (
      <>
        <h1 className="content-h1">記事が見つかりません</h1>
        <p className="content-p">
          <a href={href('/articles/')}>記事一覧へ戻る</a>
        </p>
      </>
    );
  }

  return (
    <article className="article">
      <p className="article__zone">{CATEGORY_LABEL[article.category]}</p>
      <h1 className="content-h1">{article.title}</h1>
      <p className="article__dek">{article.dek}</p>
      {article.sections.map((s) => (
        <section key={s.heading} className="article__section">
          <h2>{s.heading}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      ))}
      <footer className="article__sources">
        <h2>出典</h2>
        <ul>
          {article.sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
