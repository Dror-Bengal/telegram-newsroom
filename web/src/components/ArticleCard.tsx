"use client";

import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/articles";
import { categoryLabels } from "@/lib/constants";

// Format time ago in a simple way
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${diffDays}d ago`;
}

// Category colors for badges
const categoryColors: Record<string, string> = {
  news: "bg-red-50 text-red-700",
  politics: "bg-blue-50 text-blue-700",
  economy: "bg-green-50 text-green-700",
  sport: "bg-orange-50 text-orange-700",
  culture: "bg-purple-50 text-purple-700",
  world: "bg-cyan-50 text-cyan-700",
  society: "bg-pink-50 text-pink-700",
  technology: "bg-yellow-50 text-yellow-700",
  gossip: "bg-pink-50 text-pink-700",
};

interface ArticleCardProps {
  article: Article;
  size?: "medium" | "large";
}

// Featured card - large prominent display
export function FeaturedCard({ article }: { article: Article }) {
  const timeAgo = getTimeAgo(article.published_at);
  const colorClass = categoryColors[article.category] || "bg-gray-50 text-gray-700";

  return (
    <Link href={`/article/${article.slug}`} className="group block">
      <article className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
          {article.primary_media_url ? (
            article.primary_media_type === "video" ? (
              <video
                src={article.primary_media_url}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                muted
                playsInline
              />
            ) : (
              <Image
                src={article.primary_media_url}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${colorClass}`}>
              {categoryLabels[article.category] || article.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.subtitle && (
            <p className="text-gray-500 text-sm mt-2 line-clamp-2">
              {article.subtitle}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-gray-400">{timeAgo}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// Standard card - medium size
export function ArticleCard({ article, size = "medium" }: ArticleCardProps) {
  const timeAgo = getTimeAgo(article.published_at);
  const colorClass = categoryColors[article.category] || "bg-gray-50 text-gray-700";
  const isLarge = size === "large";

  return (
    <Link
      href={`/article/${article.slug}`}
      className={`group block ${isLarge ? "md:col-span-2" : ""}`}
    >
      <article className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 h-full">
        {/* Image */}
        <div className={`relative overflow-hidden bg-gray-100 ${isLarge ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
          {article.primary_media_url ? (
            article.primary_media_type === "video" ? (
              <video
                src={article.primary_media_url}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                muted
                playsInline
              />
            ) : (
              <Image
                src={article.primary_media_url}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${colorClass}`}>
            {categoryLabels[article.category] || article.category}
          </span>
          <h3 className={`font-semibold text-gray-900 leading-snug group-hover:text-red-600 transition-colors ${isLarge ? "text-lg line-clamp-2" : "text-sm line-clamp-2"}`}>
            {article.title}
          </h3>
          <span className="text-xs text-gray-400 mt-2 block">{timeAgo}</span>
        </div>
      </article>
    </Link>
  );
}

// List card - compact horizontal layout
export function ListCard({ article }: { article: Article }) {
  const timeAgo = getTimeAgo(article.published_at);
  const colorClass = categoryColors[article.category] || "bg-gray-50 text-gray-700";

  return (
    <Link href={`/article/${article.slug}`} className="group block">
      <article className="flex gap-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
        {/* Thumbnail */}
        <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {article.primary_media_url ? (
            article.primary_media_type === "video" ? (
              <video
                src={article.primary_media_url}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                muted
                playsInline
              />
            ) : (
              <Image
                src={article.primary_media_url}
                alt=""
                fill
                sizes="96px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <span className={`inline-block w-fit px-2 py-0.5 rounded text-xs font-medium mb-1.5 ${colorClass}`}>
            {categoryLabels[article.category] || article.category}
          </span>
          <h3 className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
            {article.title}
          </h3>
          <span className="text-xs text-gray-400 mt-1.5">{timeAgo}</span>
        </div>
      </article>
    </Link>
  );
}

// Compact card for sidebars/related articles
export function CompactCard({ article }: { article: Article }) {
  const timeAgo = getTimeAgo(article.published_at);

  return (
    <Link href={`/article/${article.slug}`} className="group block">
      <article className="py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
        <span className="text-red-600 text-xs font-semibold uppercase tracking-wide">
          {categoryLabels[article.category] || article.category}
        </span>
        <h3 className="font-medium text-sm text-gray-900 leading-snug mt-1 group-hover:text-red-600 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <span className="text-xs text-gray-400 mt-1 block">{timeAgo}</span>
      </article>
    </Link>
  );
}

// Horizontal card (alias for ListCard for backwards compatibility)
export function HorizontalCard({ article }: { article: Article }) {
  return <ListCard article={article} />;
}

// Ticker item - minimal text-only for news ticker
export function TickerItem({ article }: { article: Article }) {
  const timeAgo = getTimeAgo(article.published_at);

  return (
    <Link href={`/article/${article.slug}`} className="group block">
      <article className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-red-50 -mx-2 px-2 rounded transition-colors">
        <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-red-500 animate-pulse" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
            {article.title}
          </h4>
          <span className="text-xs text-gray-400 mt-1 block">{timeAgo}</span>
        </div>
      </article>
    </Link>
  );
}
