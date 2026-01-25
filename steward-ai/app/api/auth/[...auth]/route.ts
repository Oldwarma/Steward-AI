import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

// Ensure this route runs on Node.js runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Create handlers with error handling
let handlers: ReturnType<typeof toNextJsHandler> | null = null;

try {
  if (!auth) {
    console.error("[Auth Route] Auth instance is null!");
  } else {
    handlers = toNextJsHandler(auth);
    console.log("[Auth Route] BetterAuth handlers initialized successfully");
  }
} catch (error) {
  console.error("[Auth Route] Failed to create BetterAuth handlers:", error);
  console.error("[Auth Route] Error details:", error instanceof Error ? error.stack : String(error));
}

// Export handlers with fallback
export async function GET(request: NextRequest) {
  console.log(`[Auth Route] GET request to: ${request.nextUrl.pathname}`);
  
  if (!handlers) {
    console.error("[Auth Route] Handlers not initialized, returning 500");
    return NextResponse.json(
      { error: "Authentication service not initialized" },
      { status: 500 }
    );
  }
  
  try {
    return await handlers.GET(request);
  } catch (error) {
    console.error("[Auth Route] Error in GET handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log(`[Auth Route] POST request to: ${request.nextUrl.pathname}`);
  
  if (!handlers) {
    console.error("[Auth Route] Handlers not initialized, returning 500");
    return NextResponse.json(
      { error: "Authentication service not initialized" },
      { status: 500 }
    );
  }
  
  try {
    return await handlers.POST(request);
  } catch (error) {
    console.error("[Auth Route] Error in POST handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
