import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/posts/trending
 *
 * 功能：
 * - 返回 X 平台按“热度”排序的推文（like_count + repost_count）
 * - 默认只看“今日”数据
 * - 支持 ?limit=10 参数
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    let limit = 10;
    if (limitParam) {
      const parsed = Number(limitParam);
      if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 100) {
        limit = parsed;
      }
    }

    // 今日 0 点
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 先取出“今日”的一定数量的数据，再在内存中按热度排序
    const posts = await prisma.socialPost.findMany({
      where: {
        platform: "x",
        publishTime: {
          gte: startOfToday,
        },
      },
      orderBy: {
        publishTime: "desc",
      },
      take: 300,
    });

    const withScore = posts
      .map((p) => ({
        ...p,
        // 简单的热度评分：点赞 + 2*转发
        hotScore: p.likeCount + 2 * p.repostCount,
      }))
      .sort((a, b) => b.hotScore - a.hotScore)
      .slice(0, limit);

    return NextResponse.json(
      {
        items: withScore,
        count: withScore.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Trending Posts API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to load trending posts",
      },
      { status: 500 },
    );
  }
}

