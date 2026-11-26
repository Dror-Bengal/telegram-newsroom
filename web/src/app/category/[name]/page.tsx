import { getArticlesByCategory, type Article } from "@/lib/articles";
import { FeaturedCard, ListCard, ArticleCard } from "@/components/ArticleCard";
import { NewsTicker } from "@/components/NewsTicker";
import { LoadMoreArticles } from "@/components/LoadMoreArticles";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, categoryDescriptions, validCategories, ui } from "@/lib/constants";

export const revalidate = 60;

// Dynamic pages - categories are validated at runtime
export const dynamic = "force-dynamic";

// Helper to check if article has media
function hasMedia(article: Article): boolean {
  return !!article.primary_media_url;
}

interface CategoryPageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { name } = await params;

  if (!validCategories.includes(name as typeof validCategories[number])) {
    return { title: "Category Not Found" };
  }

  const category = CATEGORIES[name as keyof typeof CATEGORIES];

  return {
    title: `${category?.label || name} | Pressroom`,
    description: categoryDescriptions[name],
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { name } = await params;

  if (!validCategories.includes(name as typeof validCategories[number])) {
    notFound();
  }

  const category = CATEGORIES[name as keyof typeof CATEGORIES];
  const allArticles = await getArticlesByCategory(name, 50);

  if (allArticles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {category?.label || name}
        </h1>
        {categoryDescriptions[name] && (
          <p className="text-gray-500 mb-8">
            {categoryDescriptions[name]}
          </p>
        )}
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2">{ui.noArticles}</p>
            <p className="text-gray-400 text-sm mb-6">Check back soon for updates</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              {ui.backToHome}
            </Link>
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
  const listArticles = articlesWithMedia.slice(2, 14);
  const moreArticles = articlesWithMedia.slice(14, 26);
  const extraArticles = [...articlesWithMedia.slice(26), ...articlesWithoutMedia.slice(10)];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {category?.label || name}
        </h1>
        {categoryDescriptions[name] && (
          <p className="text-gray-500">
            {categoryDescriptions[name]}
          </p>
        )}
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

          {/* Article List */}
          {listArticles.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                {ui.latestNews}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <div>
                  {listArticles.slice(0, 6).map((article) => (
                    <ListCard key={article.id} article={article} />
                  ))}
                </div>
                <div>
                  {listArticles.slice(6).map((article) => (
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
        <div className="lg:w-[300px] flex-shrink-0">
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
