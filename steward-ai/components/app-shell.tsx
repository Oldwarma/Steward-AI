"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BarChart3, MessageSquareText, Sparkles, Languages, Palette, Github, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/i18n-context";
import { useTheme, Theme } from "@/contexts/theme-context";
import { MeteorLayer } from "@/components/meteor-layer";
import { useSession, signOut } from "@/lib/auth-client";
import { LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";

// YouTube Logo 组件（使用官方颜色）
const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// X (Twitter) Logo 组件（使用官方设计）
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const navItems = [
  { href: "/", key: "home" as const, icon: Sparkles },
  { href: "/chat", key: "chat" as const, icon: MessageSquareText },
  { 
    href: "/analytics", 
    key: "analytics" as const, 
    icon: BarChart3,
    submenu: [
      { href: "/analytics?platform=youtube", key: "youtube" as const, icon: YouTubeIcon, label: "YouTube" },
      { href: "/analytics?platform=twitter", key: "twitter" as const, icon: XIcon, label: "X" },
    ],
  },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAnalytics = pathname?.startsWith("/analytics");
  const { locale, setLocale, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const { data: session, isPending } = useSession();
  const [expandedNav, setExpandedNav] = useState<string | null>(
    isAnalytics ? "/analytics" : null
  );

  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)] relative">
      {/* Romantic meteor shower (dark theme only) */}
      <MeteorLayer enabled={theme === "dark"} />
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
              const hasSubmenu = "submenu" in item && item.submenu;
              const isExpanded = expandedNav === item.href;
              
              return (
                <div key={item.href}>
                  {hasSubmenu ? (
                    <>
                      <button
                        onClick={() => setExpandedNav(isExpanded ? null : item.href)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors duration-150 hover:-translate-y-0.5",
                          active
                            ? "bg-white/5 text-white"
                            : "text-[var(--muted)] hover:bg-white/5 hover:text-white",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="size-4" />
                          <span>{t.nav[item.key]}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="size-3" />
                        ) : (
                          <ChevronRight className="size-3" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="ml-4 mt-1 space-y-1 border-l border-[var(--border)] pl-3">
                          {item.submenu.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const params = new URLSearchParams();
                            if (subItem.key === "youtube") {
                              params.set("platform", "youtube");
                            } else if (subItem.key === "twitter") {
                              params.set("platform", "twitter");
                            }
                            const subHref = `${item.href}?${params.toString()}`;
                            
                            // 判断子菜单项是否激活：检查 URL 参数
                            const currentPlatform = searchParams.get("platform");
                            const isSubActive = pathname?.startsWith(item.href) && 
                              (subItem.key === "youtube" 
                                ? (currentPlatform === "youtube" || (!currentPlatform && subItem.key === "youtube"))
                                : currentPlatform === "twitter");
                            
                            return (
                              <Link
                                key={subItem.href}
                                href={subHref}
                                className={cn(
                                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors duration-150",
                                  isSubActive
                                    ? "bg-white/5 text-white"
                                    : "text-[var(--muted)] hover:bg-white/5 hover:text-white",
                                )}
                              >
                                <SubIcon className={cn("size-3.5", subItem.key === "youtube" ? "text-red-500" : "")} />
                                <span>{subItem.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
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
                  )}
                </div>
              );
            })}
          </nav>

          <div className="mt-6 space-y-2">
            {/* Login Status */}
            <div className="rounded-xl border border-[var(--border)] bg-black/10 p-3">
              {isPending ? (
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <div className="size-2 rounded-full bg-[var(--muted)] animate-pulse" />
                  <span>Loading...</span>
                </div>
              ) : session?.user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || session.user.email || "User"}
                        className="size-6 rounded-full border border-[var(--border)]"
                      />
                    ) : (
                      <div className="grid size-6 place-items-center rounded-full bg-[var(--primary)]/20 border border-[var(--border)]">
                        <User className="size-3 text-[var(--primary)]" />
                      </div>
                    )}
                    <span className="truncate flex-1">{session.user.name || session.user.email}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-[10px] text-[var(--muted)] transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <LogOut className="size-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-lg px-2 py-1 text-[10px] text-[var(--muted)] transition-colors hover:bg-white/5 hover:text-white"
                >
                  <LogIn className="size-3" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* GitHub Link */}
            <a
              href="https://github.com/Oldwarma/Steward-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--muted)] transition-colors duration-150 hover:bg-white/5 hover:text-white"
              title="GitHub Repository"
            >
              <Github className="size-4" />
              <span>GitHub</span>
            </a>
          </div>
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
