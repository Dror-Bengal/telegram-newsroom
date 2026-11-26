"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TopTickerProps {
  headlines: { title: string; slug: string }[];
}

export function TopTicker({ headlines }: TopTickerProps) {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}));
  }, []);

  if (headlines.length === 0) return null;

  // Duplicate headlines for seamless loop
  const duplicatedHeadlines = [...headlines, ...headlines];

  return (
    <div className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-10 gap-4">
          {/* Date */}
          <div className="flex-shrink-0 text-xs text-gray-400 hidden sm:block border-r border-gray-700 pr-4">
            {currentDate}
          </div>

          {/* Breaking label */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-500 uppercase tracking-wide">Live</span>
          </div>

          {/* Scrolling headlines */}
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
              {duplicatedHeadlines.map((headline, index) => (
                <Link
                  key={`${headline.slug}-${index}`}
                  href={`/article/${headline.slug}`}
                  className="text-sm text-gray-300 hover:text-white transition-colors inline-flex items-center gap-3"
                >
                  <span className="text-gray-600">•</span>
                  <span>{headline.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
