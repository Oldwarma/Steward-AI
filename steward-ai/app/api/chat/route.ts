import { NextResponse } from "next/server";

export const runtime = "edge";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function mockStewardReply(userText: string) {
  const trimmed = userText.trim();
  if (!trimmed) {
    return "我在。先把你的目标、约束、时间线告诉我，我会给你一个最小可执行的下一步。";
  }
  return `收到。我是 Elliot（Steward AI）。\n\n你说：${trimmed}\n\n我会按“目标 → 约束 → 下一步 → 风险/依赖”的结构给建议（这里是可替换的 mock 输出，你可以接入自己的 LLM / RAG / Agent）。`;
}

function streamText(text: string, delayMs = 16) {
  const encoder = new TextEncoder();
  const chunks = text.split(/(\s+)/);

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        await new Promise((r) => setTimeout(r, delayMs));
      }
      controller.close();
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      message?: string;
      messages?: ChatMessage[];
    };

    const lastUserFromMessages = [...(body.messages ?? [])]
      .reverse()
      .find((m) => m.role === "user");
    const userText = body.message ?? lastUserFromMessages?.content ?? "";
    const reply = mockStewardReply(userText);

    return new Response(streamText(reply), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid request", detail: e instanceof Error ? e.message : String(e) },
      { status: 400 },
    );
  }
}

