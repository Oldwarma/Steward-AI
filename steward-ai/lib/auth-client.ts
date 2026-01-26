"use client";

import * as React from "react";

// BetterAuth client-side utilities
const baseURL: string = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
const authBasePath: string = `${baseURL}/api/auth`;

// Simple session hook using fetch
export function useSession() {
  const [session, setSession] = React.useState<any>(null);
  const [isPending, setIsPending] = React.useState(true);

  React.useEffect(() => {
    // BetterAuth v1 uses `/get-session`
    const url = `${authBasePath}/get-session`;
    const options: RequestInit = {
      credentials: "include",
    };
    fetch(url, options)
      .then((res) => res.json())
      .then((data) => {
        setSession(data);
        setIsPending(false);
      })
      .catch(() => {
        setSession(null);
        setIsPending(false);
      });
  }, []);

  return { data: session, isPending };
}

// Sign in function
export async function signIn(provider: string, options?: { redirect?: string }) {
  const callbackURL = options?.redirect || "/";

  // BetterAuth v1 social sign-in is a POST to `/sign-in/social`
  const res = await fetch(`${authBasePath}/sign-in/social`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      provider,
      callbackURL,
      disableRedirect: true, // We handle redirect manually
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    console.error("BetterAuth signIn failed:", { status: res.status, error: errorText });
    throw new Error(`Sign in failed: ${res.status} ${errorText}`);
  }

  // Expect `{ url, redirect }` for oauth redirect
  const data = await res.json().catch(() => null);
  const url = data?.url as string | undefined;
  if (url) {
    window.location.href = url;
    return;
  }

  // Fallback: surface something useful in console (avoids silent failure)
  console.error("BetterAuth signIn failed: No redirect URL in response", { status: res.status, data });
  throw new Error("Sign in failed: No redirect URL received");
}

// Sign out function
export function signOut() {
  const url = `${authBasePath}/sign-out`;
  const options: RequestInit = {
    method: "POST",
    credentials: "include",
  };
  fetch(url, options).then(() => {
    window.location.href = "/login";
  });
}
