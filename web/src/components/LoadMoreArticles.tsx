"use client";

import { useState } from "react";
import { ArticleCard } from "./ArticleCard";
import type { Article } from "@/lib/articles";

interface LoadMoreArticlesProps {
  articles: Article[];
  buttonText: string;
}

export function LoadMoreArticles({ articles, buttonText }: LoadMoreArticlesProps) {
  const [visible, setVisible] = useState(false);

  if (articles.length === 0) return null;

  return (
    <>
      {visible && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
      {!visible && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setVisible(true)}
            className="px-8 py-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg text-gray-700 font-medium transition-all duration-200"
          >
            {buttonText}
          </button>
        </div>
      )}
    </>
  );
}
