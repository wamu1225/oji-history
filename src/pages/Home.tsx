import { href } from '../lib/router';
import { articles } from '../data/articles';
import { ARTICLE_GROUPS } from '../data/articleGroups';
import { HOOK } from '../data/hooks';
import { heroSceneSvg } from '../data/figures-data';
import { ARTICLE_ICON, iconSvg } from '../data/icons';

// アイコン（線画・装飾）。読み上げでは飛ばす
function Icon({ slug, size }: { slug: string; size: number }) {
  const name = ARTICLE_ICON[slug];
  if (!name) return null;
  return <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSvg(name, size) }} />;
}

// トップ：最初の1画面に、この町ならではの事実（つかみ）と町の絵。説明文から始めない（2026-11-08）
export default function Home() {
  const titleOf = (slug: string) => articles.find((a) => a.slug === slug)?.title ?? '';
  return (
    <>
      <section className="hook">
        <p className="hook__eyebrow">王子の歴史と文化ガイド　東京都北区 王子</p>
        <h1 className="hook__catch">{HOOK.catch}</h1>
        <p className="hook__sub">{HOOK.sub}</p>
        <div className="hook__scene" dangerouslySetInnerHTML={{ __html: heroSceneSvg() }} />
      </section>

      <section className="hook-numbers" aria-label="数字で見る王子">
        {HOOK.numbers.map((x) => (
          <a key={x.label} className="hook-number" href={href(`/articles/${x.slug}/`)}>
            <span className="hook-number__icon"><Icon slug={x.slug} size={22} /></span>
            <span className="hook-number__n">{x.n}<small>{x.unit}</small></span>
            <span className="hook-number__label">{x.label}</span>
          </a>
        ))}
      </section>

      <section className="hook-questions" aria-labelledby="q-title">
        <h2 id="q-title" className="section-title">気になる問いから読む</h2>
        <ul>
          {HOOK.questions.map((x) => (
            <li key={x.q}>
              <a href={href(`/articles/${x.slug}/`)}>
                <span className="hook-q-icon"><Icon slug={x.slug} size={22} /></span>
                <span className="hook-q-body">
                  <span className="hook-q">{x.q}</span>
                  <span className="hook-a">{x.a}</span>
                  <span className="hook-more">{titleOf(x.slug)} →</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="article-groups" aria-labelledby="articles-title">
        <h2 id="articles-title" className="section-title">記事をぜんぶ見る</h2>
        {ARTICLE_GROUPS.map((g) => (
          <div key={g.title} className="article-group">
            <h3 className="article-group__title">{g.title}</h3>
            <ul className="article-group__list article-group__list--icons">
              {g.slugs.map((s) => (
                <li key={s}>
                  <Icon slug={s} size={20} />
                  <a href={href(`/articles/${s}/`)}>{titleOf(s)}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}
