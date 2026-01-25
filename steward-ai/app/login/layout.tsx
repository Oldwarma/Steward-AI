import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Steward AI",
  description: "Sign in to Steward AI",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
