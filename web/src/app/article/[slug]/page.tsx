import { getArticleBySlug, getArticles, type Article } from "@/lib/articles";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES, ui } from "@/lib/constants";
import { ListCard } from "@/components/ArticleCard";
import { NewsTicker } from "@/components/NewsTicker";

export const revalidate = 60;

// Dynamic pages - no static generation to avoid build-time storage access
export const dynamic = "force-dynamic";

// Helper to check if article has media
function hasMedia(article: Article): boolean {
  return !!article.primary_media_url;
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: `${article.title} | Pressroom`,
    description: article.subtitle || article.title,
  };
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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [article, allArticles] = await Promise.all([
    getArticleBySlug(slug),
    getArticles(30),
  ]);

  if (!article) {
    notFound();
  }

  // Format date consistently
  const day = article.published_at.getDate();
  const month = (article.published_at.getMonth() + 1).toString().padStart(2, "0");
  const year = article.published_at.getFullYear();
  const hours = article.published_at.getHours().toString().padStart(2, "0");
  const minutes = article.published_at.getMinutes().toString().padStart(2, "0");
  const formattedDate = `${day}.${month}.${year} ${hours}:${minutes}`;

  // Filter out current article and separate by media
  const otherArticles = allArticles.filter((a) => a.id !== article.id);
  const articlesWithMedia = otherArticles.filter(hasMedia);
  const articlesWithoutMedia = otherArticles.filter((a) => !hasMedia(a));

  // Related articles for bottom section
  const relatedArticles = articlesWithMedia.slice(0, 4);

  // Get category label and color
  const category = CATEGORIES[article.category as keyof typeof CATEGORIES];
  const categoryLabel = category?.label || article.category;
  const colorClass = categoryColors[article.category] || "bg-gray-50 text-gray-700";

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      {article.primary_media_url && (
        <div className="relative w-full max-w-5xl mx-auto">
          <div className="relative aspect-video bg-gray-100 overflow-hidden">
            {article.primary_media_type === "video" ? (
              <video
                src={article.primary_media_url}
                controls
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <Image
                src={article.primary_media_url}
                alt={article.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            )}
          </div>
        </div>
      )}

      {/* Main Layout: Article + Ticker Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Article Content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-6">
              <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <span className="text-gray-300">/</span>
              <Link
                href={`/category/${article.category}`}
                className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                {categoryLabel}
              </Link>
            </nav>

            {/* Article Header */}
            <header className="mb-8">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
                {article.title}
              </h1>

              {article.subtitle && (
                <p className="text-gray-500 text-lg leading-relaxed mb-6">
                  {article.subtitle}
                </p>
              )}

              <div className="flex items-center gap-4 py-4 border-y border-gray-200">
                <Image
                  src="/1.png"
                  alt="Pressroom"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <div>
                  <p className="font-semibold text-gray-900">Pressroom</p>
                  <p className="text-sm text-gray-500">{formattedDate}</p>
                </div>
                <span className={`ml-auto px-3 py-1.5 rounded-lg text-sm font-medium ${colorClass}`}>
                  {categoryLabel}
                </span>
              </div>
            </header>

            {/* Article Content */}
            <div
              className="prose max-w-none mb-10
                prose-headings:font-bold prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900
                prose-ul:my-4 prose-ol:my-4
                prose-li:text-gray-700"
              dangerouslySetInnerHTML={{ __html: article.content_html }}
            />

          </div>

          {/* News Ticker Sidebar */}
          <div className="lg:w-[300px] flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <NewsTicker
                articles={articlesWithoutMedia.slice(0, 10)}
                topArticles={articlesWithMedia.slice(0, 5)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{ui.moreInCategory}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
            <div>
              {relatedArticles.slice(0, 2).map((related) => (
                <ListCard key={related.id} article={related} />
              ))}
            </div>
            <div>
              {relatedArticles.slice(2).map((related) => (
                <ListCard key={related.id} article={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
