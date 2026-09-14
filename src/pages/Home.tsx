import { href } from '../lib/router';
import { articles } from '../data/articles';
import { CATEGORY_LABEL, type Category } from '../data/types';

const CATEGORY_ORDER: Category[] = ['name-origin', 'history', 'shrine', 'food', 'industry', 'culture', 'spots', 'faq'];

export default function Home() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    list: articles.filter((a) => a.category === cat),
  })).filter((g) => g.list.length > 0);

  return (
    <>
      <section className="hero">
        <p className="hero__eyebrow">東京都北区 王子</p>
        <h1 className="hero__title">王子の歴史と文化</h1>
        <p className="hero__lead">
          熊野の神を勧請した地名の由来から、渋沢栄一が興した製紙業、23区で最も軍用地率が高かった軍需産業、そして軍需工場を図書館に転用した戦後まで。王子の歴史と文化を、一次資料にもとづいて分野別にまとめている。
        </p>
      </section>

      <section className="article-groups" aria-labelledby="articles-title">
        <h2 id="articles-title" className="section-title">
          分野から読む
        </h2>
        {grouped.map(({ category, list }) => (
          <div key={category} className="article-group">
            <h3 className="article-group__title">{CATEGORY_LABEL[category]}</h3>
            <ul className="article-group__list">
              {list.map((a) => (
                <li key={a.slug}>
                  <a href={href(`/articles/${a.slug}/`)}>{a.title}</a>
                  <p className="article-group__dek">{a.dek}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}
