import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeXPosts } from "@/lib/scrapers/x-playwright";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/scrape/x
 *
 * 功能：
 * - 使用 Playwright 抓取 X（Twitter）上的 AI 相关推文
 * - 将结果写入 MySQL（social_posts 表）
 * - 返回本次实际写入的数量
 *
 * 风控 / 稳定性：
 * - 所有抓取逻辑都在 try/catch 中
 * - 抓取失败时仅返回错误，不会影响整个 Web 服务
 * - 真实浏览器抓取逻辑与 API Route 解耦在 lib/scrapers/x-playwright.ts 中
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const keyword: string =
      typeof body.keyword === "string" && body.keyword.trim()
        ? body.keyword.trim()
        : "AI artificial intelligence technology product";

    const maxItems: number =
      typeof body.maxItems === "number" && body.maxItems > 0 && body.maxItems <= 50
        ? body.maxItems
        : 30;

    // 真实抓取逻辑在独立模块中，方便单独调试与扩展
    const posts = await scrapeXPosts({ keyword, maxItems });

    if (!posts.length) {
      return NextResponse.json(
        {
          count: 0,
          message: "No posts scraped from X",
        },
        { status: 200 },
      );
    }

    // 将抓取结果写入数据库，按 post_id 去重
    // - 使用 createMany + skipDuplicates，依赖 Prisma 的唯一索引
    const toCreate = posts.map((p) => ({
      platform: p.platform,
      post_id: p.postId,
      author: p.author,
      content: p.content,
      url: p.url,
      like_count: p.likeCount,
      repost_count: p.repostCount,
      publish_time: p.publishTime,
      keyword: p.keyword,
    }));

    let createdCount = 0;

    try {
      const result = await prisma.socialPost.createMany({
        data: toCreate as any,
        skipDuplicates: true,
      });
      createdCount = result.count;
    } catch (dbError) {
      console.error("[X Scrape API] Failed to insert posts into DB:", dbError);
      // 数据库写入失败时，也不能让服务崩溃，直接返回抓取结果数量
      return NextResponse.json(
        {
          count: 0,
          error: "Failed to insert posts into database",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        count: createdCount,
        scraped: posts.length,
        keyword,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[X Scrape API] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Failed to scrape X posts",
      },
      { status: 500 },
    );
  }
}

