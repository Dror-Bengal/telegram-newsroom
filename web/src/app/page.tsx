import { getArticles, type Article } from "@/lib/articles";
import { FeaturedCard, ListCard, ArticleCard } from "@/components/ArticleCard";
import { NewsTicker } from "@/components/NewsTicker";
import { LoadMoreArticles } from "@/components/LoadMoreArticles";
import { ui, CATEGORIES } from "@/lib/constants";

// Look up the current edition on each request.
export const dynamic = "force-dynamic";

// Helper to check if article has media
function hasMedia(article: Article): boolean {
  return !!article.primary_media_url;
}

export default async function HomePage() {
  // Fetch more articles to have enough for both sections
  const allArticles = await getArticles(40);

  if (allArticles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {CATEGORIES.news.label}
        </h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2">{ui.noArticles}</p>
            <p className="text-gray-400 text-sm">Check back soon for the latest news</p>
          </div>
        </div>
      </div>
    );
  }

  // Separate articles with and without images
  const articlesWithMedia = allArticles.filter(hasMedia);
  const articlesWithoutMedia = allArticles.filter((a) => !hasMedia(a));

  // Split articles with media: first 2 featured, rest in list
  const featuredArticles = articlesWithMedia.slice(0, 2);
  const listArticles = articlesWithMedia.slice(2, 10);
  const moreArticles = articlesWithMedia.slice(10, 18);
  const extraArticles = [...articlesWithMedia.slice(18), ...articlesWithoutMedia.slice(10)];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {CATEGORIES.news.label}
        </h1>
        <p className="text-gray-500">
          {ui.latestNewsDesc}
        </p>
      </div>

      {/* Main Layout: Content + Ticker Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {articlesWithMedia.length === 0 && (
            <section aria-label="Latest reports" className="mb-8">
              {articlesWithoutMedia.slice(0, 10).map(article => <ListCard key={article.id} article={article} />)}
            </section>
          )}
          {/* Featured Articles */}
          {featuredArticles.length > 0 && (
            <section className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredArticles.map((article) => (
                  <FeaturedCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* Latest News List */}
          {listArticles.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                {ui.latestNews}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <div>
                  {listArticles.slice(0, 4).map((article) => (
                    <ListCard key={article.id} article={article} />
                  ))}
                </div>
                <div>
                  {listArticles.slice(4).map((article) => (
                    <ListCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* More Articles Grid */}
          {moreArticles.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                {ui.moreInCategory}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {moreArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* News Ticker Sidebar */}
        <div id="bulletins" className="lg:w-[300px] flex-shrink-0 scroll-mt-36">
          <div className="lg:sticky lg:top-24">
            <NewsTicker
              articles={articlesWithoutMedia.slice(0, 10)}
              topArticles={articlesWithMedia.slice(0, 5)}
            />
          </div>
        </div>
      </div>

      {/* Load More */}
      <LoadMoreArticles articles={extraArticles} buttonText={ui.moreInCategory} />
    </div>
  );
}
