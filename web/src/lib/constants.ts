// News desks and navigation labels

export const CATEGORIES = {
  news: { label: "News", slug: "news", color: "red" },
  politics: { label: "Studios", slug: "politics", color: "blue" },
  economy: { label: "Materials", slug: "economy", color: "green" },
  sport: { label: "Events", slug: "sport", color: "orange" },
  culture: { label: "Exhibitions", slug: "culture", color: "purple" },
  world: { label: "Travel", slug: "world", color: "cyan" },
  society: { label: "Community", slug: "society", color: "pink" },
  technology:{ label: "Tools", slug: "technology", color: "yellow" },
  gossip: { label: "Notebook", slug: "gossip", color: "pink" },
} as const;

export type CategorySlug = keyof typeof CATEGORIES;

export const categoryLabels: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORIES).map(([key, value]) => [key, value.label])
);

export const categoryColors: Record<string, string> = {
  news: "bg-red-600",
  politics: "bg-blue-600",
  economy: "bg-green-600",
  sport: "bg-orange-500",
  culture: "bg-purple-600",
  world: "bg-cyan-600",
  society: "bg-pink-600",
  technology: "bg-yellow-600",
  gossip: "bg-pink-500",
};

export const categoryDescriptions: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORIES).map(([key, category]) => [key, `Latest reports from the ${category.label.toLowerCase()} desk.`])
);

export const validCategories = Object.keys(CATEGORIES) as CategorySlug[];

export const navCategories = validCategories.map((slug) => ({
  slug,
  label: CATEGORIES[slug].label,
}));

// Reader interface
export const ui = {
  siteName: "Pressroom",
  siteAccent: "Journal",
  newsletter: "Newsletter",
  signIn: "Sign in",
  backToHome: "Home",
  latestNews: "Latest stories",
  latestNewsDesc: "Dispatches from independent studios, print rooms and workshops.",
  noArticles: "No stories yet",
  moreInCategory: "More stories",
  termsOfService: "Terms of service",
  privacyPolicy: "Privacy policy",
  aboutUs: "About us",
  copyright: "© 2026 Pressroom",
  lastUpdated: "Updated",
  justNow: "Just now",
  minutesAgo: "minutes ago",
  hoursAgo: "hours ago",
  daysAgo: "days ago",
  tagline: "Dispatches from independent studios",
};
