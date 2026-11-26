"use client";

import Link from "next/link";
import type { Article } from "@/lib/articles";
import { TickerItem } from "./ArticleCard";

interface NewsTickerProps {
  articles: Article[];
  topArticles?: Article[];
  title?: string;
}

export function NewsTicker({ articles, topArticles, title }: NewsTickerProps) {
  const hasBreaking = articles.length > 0;
  const hasTop5 = topArticles && topArticles.length > 0;

  if (!hasBreaking && !hasTop5) return null;

  return (
    <aside className="space-y-4">
      {/* Breaking News */}
      {hasBreaking && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 flex items-center gap-2">
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-white animate-pulse" />
            <h3 className="text-white font-bold text-sm uppercase tracking-wide">
              {title || "Breaking updates"}
            </h3>
          </div>

          {/* Ticker Items */}
          <div className="p-2 max-h-[300px] overflow-y-auto">
            {articles.map((article) => (
              <TickerItem key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      {/* Top stories */}
      {hasTop5 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h3 className="text-white font-bold text-sm uppercase tracking-wide">
              Top stories
            </h3>
          </div>

          {/* Top stories Items */}
          <div className="p-2">
            {topArticles.slice(0, 5).map((article, index) => (
              <Top5Item key={article.id} article={article} rank={index + 1} />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

// Top stories item with rank number
function Top5Item({ article, rank }: { article: Article; rank: number }) {
  return (
    <Link href={`/article/${article.slug}`} className="group block">
      <article className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-sky-50 -mx-2 px-2 rounded transition-colors">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-sm flex items-center justify-center">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-sky-600 transition-colors">
            {article.title}
          </h4>
        </div>
      </article>
    </Link>
  );
}
