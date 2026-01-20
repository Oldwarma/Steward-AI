"use client";

import {
  BarChart3,
  Clock,
  Gauge,
  TrendingUp,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useI18n } from "@/contexts/i18n-context";


const trend = [12, 18, 15, 21, 24, 22, 26, 28, 25, 30, 33, 31];

const appRows = [
  { app: "Chat", users: 812, retention: "38%", notes: "Strong daily use" },
  { app: "Analytics", users: 294, retention: "24%", notes: "Used by power users" },
  { app: "Onboarding", users: 178, retention: "52%", notes: "High completion" },
] as const;

const productCards = [
  {
    name: "Chat",
    icon: MessageSquareText,
    badge: "日常对话 / 运维问答",
    points: ["多轮对话", "结合日志 / 文档问答（RAG）", "可挂 Agent 做自动化操作"],
  },
  {
    name: "Analytics",
    icon: BarChart3,
    badge: "使用趋势 / 质量监控",
    points: ["用户活跃与留存分析", "响应耗时 & 成本监控", "误答 & 意图命中率"],
  },
  {
    name: "Steward",
    icon: Sparkles,
    badge: "管家能力展示",
    points: ["统一任务编排", "跨应用洞察汇总", "一键生成运营报告（Demo）"],
  },
] as const;

function Sparkline() {
  const max = Math.max(...trend);
  const min = Math.min(...trend);
  const points = trend
    .map((v, i) => {
      const x = (i / (trend.length - 1)) * 100;
      const y = 100 - ((v - min) / (max - min || 1)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-20 w-full">
      <polyline
        fill="none"
        stroke="var(--primary)"
        strokeWidth="3"
        points={points}
      />
    </svg>
  );
}

export default function AnalyticsPage() {
  const { t } = useI18n();

  const kpis = [
    { label: t.analytics.activeUsers, value: "1,284", delta: "+12.4%" },
    { label: t.analytics.avgResponseTime, value: "820ms", delta: "-8.1%" },
    { label: t.analytics.conversationsPerDay, value: "3,961", delta: "+19.0%" },
    { label: t.analytics.toolCalls, value: "7,420", delta: "+6.2%" },
  ] as const;

  return (
    <div className="flex h-full flex-col gap-6 md:grid md:grid-cols-[minmax(0,2.1fr)_minmax(260px,0.9fr)] md:items-stretch">
      {/* 左侧：整体分析大屏 */}
      <div className="flex flex-col gap-6 animate-[slide-up-soft_0.35s_ease-out]">
        <div className="flex items-end justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 px-6 py-4">
          <div>
            <div className="text-xs font-medium tracking-widest text-[var(--muted)]">
              STEWARD ANALYTICS
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              {t.analytics.title}
            </h1>
          </div>
          <div className="text-xs text-[var(--muted)]">
            Last 12 weeks • 全屏可视化
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          {kpis.map((k) => (
            <Card
              key={k.label}
              className="transition-all duration-200 hover:-translate-y-1 hover:border-[var(--primary)]/60 hover:shadow-[0_18px_45px_rgba(15,23,42,0.7)]"
            >
              <CardHeader>
                <CardTitle className="text-sm">{k.label}</CardTitle>
                <CardDescription>{k.delta}</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-semibold tracking-tight">
                {k.value}
              </CardContent>
            </Card>
          ))}
        </section>

        <Tabs
          defaultValue="trend"
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="trend">{t.analytics.trend}</TabsTrigger>
              <TabsTrigger value="apps">{t.analytics.apps}</TabsTrigger>
            </TabsList>
            <div className="hidden items-center gap-3 text-xs text-[var(--muted)] md:flex">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {t.analytics.realtimeRefresh}
              </span>
              <span className="inline-flex items-center gap-1">
                <Gauge className="h-3 w-3" />
                {t.analytics.systemHealth}
              </span>
            </div>
          </div>

          <TabsContent
            value="trend"
            className="mt-4 flex-1 space-y-4 overflow-hidden data-[state=inactive]:hidden"
          >
            <div className="grid h-full gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
              <Card className="flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[var(--primary)]/50">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[var(--primary)]" />
                    {t.analytics.conversationGrowth}
                  </CardTitle>
                  <CardDescription>
                    {t.analytics.trendDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <div className="flex-1 rounded-2xl border bg-black/10 p-4">
                    <Sparkline />
                  </div>
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle>{t.analytics.insights}</CardTitle>
                  <CardDescription>
                    {t.analytics.insightsDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 text-sm text-[var(--muted)]">
                  <div className="rounded-2xl border bg-white/5 p-4">
                    - 增长主要来自 Chat 使用频次提升
                    <br />- 响应耗时下降，可能与缓存 / 路由优化相关
                  </div>
                  <div className="rounded-2xl border bg-white/5 p-4">
                    下一步建议：对 top intents 做 RAG 命中率 &amp; 误答分析，按业务场景优化召回策略。
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent
            value="apps"
            className="mt-4 flex-1 overflow-hidden data-[state=inactive]:hidden"
          >
            <Card className="flex h-full flex-col overflow-hidden">
              <CardHeader className="flex-shrink-0">
                <CardTitle>{t.analytics.appBreakdown}</CardTitle>
                <CardDescription>
                  {t.analytics.appBreakdownDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <div className="overflow-hidden rounded-2xl border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-[var(--muted)]">
                      <tr>
                        <th className="px-4 py-3 font-medium">App</th>
                        <th className="px-4 py-3 font-medium">Users</th>
                        <th className="px-4 py-3 font-medium">Retention</th>
                        <th className="px-4 py-3 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appRows.map((row) => (
                        <tr
                          key={row.app}
                          className="border-t border-[var(--border)]"
                        >
                          <td className="px-4 py-3">{row.app}</td>
                          <td className="px-4 py-3 text-[var(--muted)]">
                            {row.users}
                          </td>
                          <td className="px-4 py-3 text-[var(--muted)]">
                            {row.retention}
                          </td>
                          <td className="px-4 py-3">{row.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 右侧：各产品功能展示 */}
      <aside className="mt-2 flex flex-col gap-4 md:mt-0">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-4">
          <div className="text-xs font-medium tracking-wide text-[var(--muted)]">
            {t.analytics.productCapabilities}
          </div>
          <div className="mt-1 text-sm font-semibold">
            {t.analytics.productMatrix}
          </div>
          <div className="mt-2 text-xs text-[var(--muted)]">
            {t.analytics.productMatrixDesc}
          </div>
        </div>

        {productCards.map((p) => {
          const Icon = p.icon;
          return (
            <Card
              key={p.name}
              className="flex flex-col border-[var(--border)]/80 bg-[var(--card)]/90"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/5">
                      <Icon className="h-4 w-4 text-[var(--primary)]" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {p.badge}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs text-[var(--muted)]">
                {p.points.map((pt) => (
                  <div key={pt} className="flex items-start gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-[var(--primary)]/80" />
                    <span>{pt}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </aside>
    </div>
  );
}

