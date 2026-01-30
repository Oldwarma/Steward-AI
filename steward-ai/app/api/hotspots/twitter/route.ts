import { NextRequest, NextResponse } from "next/server";
import { scrapeXPosts } from "@/lib/scrapers/x-playwright";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 使用 Playwright 直接抓取 X（Twitter）数据，返回给前端热点大屏。
 * - 不再依赖 Apify，也不会受月度配额限制
 * - 保持返回结构与原来的 /api/hotspots/twitter 一致，前端无需修改
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "AI artificial intelligence technology product";
    const maxResults = parseInt(searchParams.get("maxResults") || "20");

    const posts = await scrapeXPosts({ keyword: query, maxItems: maxResults });

    // 映射成前端现有的 TwitterTweet 结构
    const tweets = posts.map((p) => ({
      id: p.postId,
      text: p.content,
      author: p.author,
      authorHandle: "", // Playwright 抓取目前只拿到作者名，如需 @handle 可以在解析 DOM 时补充
      createdAt: p.publishTime.toISOString(),
      likes: p.likeCount,
      retweets: p.repostCount,
      replies: 0,
      url: p.url,
    }));

    return NextResponse.json(
      {
        tweets,
        totalResults: tweets.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Twitter Hotspots Playwright API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Twitter data via Playwright",
        tweets: [],
      },
      { status: 500 },
    );
  }
}
