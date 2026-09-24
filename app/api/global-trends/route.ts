import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Trend = {
  id: string;
  title: string;
  source: string;
  country: string;
  signal: "Viral" | "Rising" | "Early";
  traffic?: string;
  published?: string;
  description?: string;
};

const COUNTRIES: Record<string, string> = {
  IN: "India",
  US: "United States",
  BR: "Brazil",
  GB: "United Kingdom",
  AU: "Australia",
  CA: "Canada",
};

function classifyTrend(index: number): Trend["signal"] {
  if (index < 5) return "Viral";
  if (index < 10) return "Rising";
  return "Early";
}

async function getGoogleTrends(country: string): Promise<Trend[]> {
  try {
    const response = await fetch(
      `https://trends.google.com/trending/rss?geo=${country}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        next: {
          revalidate: 900,
        },
      }
    );

    if (!response.ok) return [];

    const xml = await response.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    return items.slice(0, 20).map((match, index) => {
      const item = match[1];

      const title =
        item.match(/<title>([\s\S]*?)<\/title>/)?.[1]
          ?.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
          .trim() || "Unknown trend";

      const traffic =
        item.match(/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/)?.[1]
          ?.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
          .trim();

      const description =
        item.match(/<description>([\s\S]*?)<\/description>/)?.[1]
          ?.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
          .replace(/<[^>]+>/g, "")
          .trim();

      return {
        id: `${country}-${index}-${title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`,
        title,
        source: "Google Trends",
        country: COUNTRIES[country] || country,
        signal: classifyTrend(index),
        traffic,
        description,
      };
    });
  } catch {
    return [];
  }
}

async function getRedditTrends(): Promise<Trend[]> {
  try {
    const response = await fetch(
      "https://www.reddit.com/r/popular/hot.json?limit=20",
      {
        headers: {
          "User-Agent": "CapsanoTrendEngine/1.0",
        },
        next: {
          revalidate: 900,
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();

    const posts = data?.data?.children || [];

    return posts.slice(0, 20).map((post: any, index: number) => ({
      id: `reddit-${post?.data?.id || index}`,
      title: post?.data?.title || "Reddit trend",
      source: "Reddit",
      country: "Global",
      signal: classifyTrend(index),
      traffic: `${post?.data?.score || 0} points`,
      description: post?.data?.subreddit
        ? `Trending in r/${post.data.subreddit}`
        : "Trending discussion",
    }));
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const requestedCountry =
    searchParams.get("country")?.toUpperCase() || "IN";

  const country = COUNTRIES[requestedCountry]
    ? requestedCountry
    : "IN";

  const [googleTrends, redditTrends] = await Promise.all([
    getGoogleTrends(country),
    getRedditTrends(),
  ]);

  const trends = [...googleTrends, ...redditTrends];

  return NextResponse.json({
    success: true,
    country: COUNTRIES[country],
    updatedAt: new Date().toISOString(),
    refreshAfterMinutes: 120,
    sources: [
      "Google Trends",
      "Reddit",
    ],
    trends,
  });
}
