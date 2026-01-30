import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Flame, Heart, Repeat2 } from "lucide-react";

// X 官方样式的 Logo
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

async function getTrendingPosts(limit: number) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

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
      hotScore: p.likeCount + 2 * p.repostCount,
    }))
    .sort((a, b) => b.hotScore - a.hotScore)
    .slice(0, limit);

  return withScore;
}

// 简单的时间维度热度聚合（按小时）
function buildTrendSeries(posts: Awaited<ReturnType<typeof getTrendingPosts>>) {
  const buckets = new Map<string, number>();

  posts.forEach((p) => {
    const d = new Date(p.publishTime);
    const key = `${d.getHours().toString().padStart(2, "0")}:00`;
    const score = p.likeCount + 2 * p.repostCount;
    buckets.set(key, (buckets.get(key) ?? 0) + score);
  });

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([label, value]) => ({ label, value }));
}

export default async function XTrendingPage() {
  const posts = await getTrendingPosts(10);
  const trend = buildTrendSeries(posts);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-xl bg-white text-black">
          <XIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">今日 AI 热帖榜（X）</h1>
          <p className="text-xs text-[var(--muted)]">基于点赞 + 转发的热度评分</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* 今日 AI 热帖榜 Top 10 */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-4 w-4 text-orange-500" />
              今日 AI 热帖榜（Top 10）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {posts.length === 0 ? (
              <div className="py-6 text-sm text-[var(--muted)]">暂无数据，请先调用 /api/scrape/x 抓取。</div>
            ) : (
              posts.map((post, index) => (
                <div
                  key={post.id}
                  className="rounded-lg border border-[var(--border)] bg-white/5 px-3 py-2.5 text-sm transition-colors hover:bg-white/10"
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 text-xs font-semibold text-[var(--muted)] w-6 text-right">
                      #{index + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                        <span className="font-medium">{post.author}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.publishTime).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="line-clamp-3 text-xs leading-relaxed">
                        {post.content}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-[10px] text-[var(--muted)]">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Repeat2 className="h-3 w-3" />
                          {post.repostCount}
                        </span>
                        <span className="ml-auto text-[10px]">
                          关键词：{post.keyword ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 简单热度趋势图（时间维度） */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-4 w-4 text-orange-500" />
              热度趋势（按小时）
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trend.length === 0 ? (
              <div className="py-6 text-sm text-[var(--muted)]">暂无数据</div>
            ) : (
              <div className="space-y-2">
                {trend.map((bucket) => (
                  <div key={bucket.label} className="flex items-center gap-2 text-xs">
                    <div className="w-12 text-[var(--muted)]">{bucket.label}</div>
                    <div className="flex-1 rounded-full bg-white/5">
                      <div
                        className="h-2 rounded-full bg-orange-500"
                        style={{
                          width: `${Math.min(100, (bucket.value / (trend[0]?.value || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="w-10 text-right text-[var(--muted)]">{bucket.value}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

