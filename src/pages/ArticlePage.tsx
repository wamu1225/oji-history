import type { ReactNode } from 'react';
import { articles } from '../data/articles';
import { CATEGORY_LABEL } from '../data/types';
import { href } from '../lib/router';
import { figureHtml } from '../data/figures-data';

// 本文中の [text](/articles/slug/) をリンクに変換する（他記事とつなぐための最小限のインライン記法）。
function renderParagraph(text: string): ReactNode[] {
  const re = /\[([^\]]+)\]\((\/articles\/[a-z0-9-]+\/)\)/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push(
      <a key={key++} href={href(m[2])}>
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

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
      {article.sections.length >= 2 && (
        <nav className="article__toc" aria-label="目次">
          <p className="article__toc-label">目次</p>
          <ol>
            {article.sections.map((s, i) => (
              <li key={s.heading}>
                <a href={`#sec-${i}`}>{s.heading}</a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      {article.sections.map((s, i) => (
        <section key={s.heading} id={`sec-${i}`} className="article__section">
          <h2>{s.heading}</h2>
          {s.paragraphs.map((p, i2) => (
            <p key={i2}>{renderParagraph(p)}</p>
          ))}
        </section>
      ))}
      {figureHtml(article.slug) && (
        <div dangerouslySetInnerHTML={{ __html: figureHtml(article.slug)! }} />
      )}
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
