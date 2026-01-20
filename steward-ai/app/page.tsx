"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/contexts/i18n-context";

export default function Home() {
  const { t } = useI18n();
  return (
    <div className="space-y-6 animate-[slide-up-soft_0.4s_ease-out]">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.7)]">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(800px_circle_at_20%_10%,color-mix(in_oklab,var(--primary)_40%,transparent),transparent_60%),radial-gradient(700px_circle_at_80%_30%,rgba(255,255,255,0.1),transparent_60%)] animate-[float-glow_10s_ease-in-out_infinite]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {t.home.title}
              <span className="text-[var(--muted)]">{t.home.subtitle}</span>
            </h1>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              {t.home.description}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/chat" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_14px_45px_rgba(79,70,229,0.7)]">
                {t.home.openChat} <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/analytics" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                className="w-full sm:w-auto transition-transform duration-150 hover:-translate-y-0.5 hover:border-[var(--primary)]"
              >
                {t.home.viewAnalytics}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="transition-all duration-200 hover:-translate-y-1 hover:border-[var(--primary)]/60 hover:shadow-[0_18px_45px_rgba(15,23,42,0.7)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Waves className="size-4 text-[var(--primary)]" />
              {t.home.chatVoice}
            </CardTitle>
            <CardDescription>{t.home.chatVoiceDesc}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted)]">
            {t.home.chatVoiceContent}
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:-translate-y-1 hover:border-[var(--primary)]/60 hover:shadow-[0_18px_45px_rgba(15,23,42,0.7)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[var(--primary)]" />
              {t.home.productGrade}
            </CardTitle>
            <CardDescription>{t.home.productGradeDesc}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted)]">
            {t.home.productGradeContent}
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:-translate-y-1 hover:border-[var(--primary)]/60 hover:shadow-[0_18px_45px_rgba(15,23,42,0.7)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-[var(--primary)]" />
              {t.home.analyticsReady}
            </CardTitle>
            <CardDescription>{t.home.analyticsReadyDesc}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted)]">
            {t.home.analyticsReadyContent}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
