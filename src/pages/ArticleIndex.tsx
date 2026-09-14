import { articles } from '../data/articles';
import { CATEGORY_LABEL } from '../data/types';
import { href } from '../lib/router';

export default function ArticleIndex() {
  return (
    <>
      <h1 className="content-h1">記事一覧</h1>
      <ul className="article-index">
        {articles.map((a) => (
          <li key={a.slug} className="article-index__item">
            <span className="article-index__zone">{CATEGORY_LABEL[a.category]}</span>
            <a href={href(`/articles/${a.slug}/`)}>{a.title}</a>
            <p>{a.dek}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
