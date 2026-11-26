export interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  content_html: string;
  category: string;
  slug: string;
  primary_media_url: string | null;
  primary_media_type: "image" | "video" | null;
  published_at: Date;
}

type WireArticle = Omit<Article, "id" | "primary_media_type" | "published_at"> & { published_at: string };

export async function readDesk(path: string) {
  const response = await fetch(`http://desk:8000${path}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`News desk returned ${response.status}`);
  return response.json();
}

function toArticle(row: WireArticle): Article {
  return { ...row, id: row.slug, primary_media_type: row.primary_media_url ? "image" : null,
    published_at: new Date(row.published_at) };
}

export async function getArticles(limit = 40): Promise<Article[]> {
  return (await readDesk(`/articles?limit=${limit}`)).map(toArticle);
}

export async function getArticlesByCategory(name: string, limit = 50): Promise<Article[]> {
  return (await readDesk(`/articles?limit=${limit}&category=${encodeURIComponent(name)}`)).map(toArticle);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const row = await readDesk(`/articles/${encodeURIComponent(slug)}`);
  return row ? toArticle(row) : null;
}
