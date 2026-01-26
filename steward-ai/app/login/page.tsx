"use client";

import { useState, useEffect } from "react";
import { Github, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "@/lib/auth-client";
import { ThemeProvider } from "@/contexts/theme-context";
import { I18nProvider } from "@/contexts/i18n-context";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (session?.user) {
      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
    }
  }, [session, router, searchParams]);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      const redirect = searchParams.get("redirect") || "/";
      await signIn("github", { redirect });
      // signIn will handle the redirect, but if it doesn't, reset loading state
      setTimeout(() => setIsLoading(false), 2000);
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <I18nProvider>
        <div className="min-h-dvh flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
          <Card className="w-full max-w-md border-[var(--border)] bg-[var(--card)]">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="grid size-12 place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)]">
                  <Sparkles className="size-6" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold">Welcome to Steward AI</CardTitle>
              <CardDescription className="text-[var(--muted)]">
                Sign in with your GitHub account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleGitHubLogin}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                <Github className="mr-2 h-4 w-4" />
                {isLoading ? "Connecting..." : "Sign in with GitHub"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </I18nProvider>
    </ThemeProvider>
  );
}
