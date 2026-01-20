"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, MessageSquareText, Sparkles, Languages, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/i18n-context";
import { useTheme, Theme } from "@/contexts/theme-context";

const navItems = [
  { href: "/", key: "home" as const, icon: Sparkles },
  { href: "/chat", key: "chat" as const, icon: MessageSquareText },
  { href: "/analytics", key: "analytics" as const, icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAnalytics = pathname?.startsWith("/analytics");
  const { locale, setLocale, t } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)] relative">
      <div
        className={cn(
          // Full-width, desktop-web style (left aligned, no max-width container)
          "grid min-h-dvh w-full grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[260px_minmax(0,1fr)] md:px-6 lg:px-8 relative z-10",
          isAnalytics ? "lg:gap-8" : null,
        )}
      >
        <aside className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)]">
              <Sparkles className="size-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Steward AI</div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-black/5 px-2 py-1 text-[10px] text-[var(--muted)] transition-colors hover:bg-white/5 hover:text-white"
              title={locale === "zh" ? t.common.english : t.common.chinese}
            >
              <Languages className="size-3" />
              <span>{locale === "zh" ? "EN" : "中"}</span>
            </button>
            <button
              onClick={() => setTheme(theme === "indigo" ? "dark" : "indigo")}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-black/5 px-2 py-1 text-[10px] text-[var(--muted)] transition-colors hover:bg-white/5 hover:text-white"
              title={theme === "indigo" ? t.common.dark : t.common.indigo}
            >
              <Palette className="size-3" />
              <span>{theme === "indigo" ? t.common.dark : t.common.indigo}</span>
            </button>
          </div>

          <nav className="mt-5 space-y-1">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors duration-150 hover:-translate-y-0.5",
                    active
                      ? "bg-white/5 text-white"
                      : "text-[var(--muted)] hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="size-4" />
                  <span>{t.nav[item.key]}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          {!isAnalytics && (
            <header className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4">
              <div>
                <div className="text-sm text-[var(--muted)]">
                  {t.common.stewardConsole}
                </div>
                <div className="text-lg font-semibold tracking-tight">
                  {pathname === "/"
                    ? t.common.overview
                    : pathname?.startsWith("/chat")
                      ? t.common.conversation
                      : pathname?.startsWith("/analytics")
                        ? t.nav.analytics
                        : "Steward"}
                </div>
              </div>
            </header>
          )}

          <main className={cn(isAnalytics ? "h-full" : "mt-6")}>{children}</main>
        </div>
      </div>
    </div>
  );
}
