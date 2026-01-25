import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

let authInstance: ReturnType<typeof betterAuth> | null = null;

try {
  console.log("[Auth] Initializing BetterAuth...");
  console.log("[Auth] Database URL:", process.env.DATABASE_URL ? "Set" : "Not set");
  console.log("[Auth] GitHub Client ID:", process.env.GITHUB_CLIENT_ID ? "Set" : "Not set");
  console.log("[Auth] GitHub Client Secret:", process.env.GITHUB_CLIENT_SECRET ? "Set" : "Not set");
  console.log("[Auth] BetterAuth Secret:", process.env.BETTER_AUTH_SECRET ? "Set" : "Not set");
  
  authInstance = betterAuth({
    database: prismaAdapter(prisma, {
      provider: "mysql",
    }),
    secret: process.env.BETTER_AUTH_SECRET || "change-this-secret-key-in-production",
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    basePath: "/api/auth",
  });
  
  console.log("[Auth] BetterAuth initialized successfully");
} catch (error) {
  console.error("[Auth] Failed to initialize BetterAuth:", error);
}

export const auth = authInstance!;
export type Session = typeof auth.$Infer.Session;
