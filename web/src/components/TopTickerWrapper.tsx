import { getArticles } from "@/lib/articles";
import { TopTicker } from "./TopTicker";

export async function TopTickerWrapper() {
  try {
    const articles = await getArticles(10);

    const headlines = articles.map((article) => ({
      title: article.title,
      slug: article.slug,
    }));

    return <TopTicker headlines={headlines} />;
  } catch (error) {
    // If fetching fails, return empty ticker
    console.error("TopTickerWrapper error:", error);
    return <TopTicker headlines={[]} />;
  }
}
