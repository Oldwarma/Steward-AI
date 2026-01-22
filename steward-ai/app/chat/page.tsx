"use client";

import * as React from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/i18n-context";

type Msg = { role: "user" | "assistant"; content: string };

function getSpeechRecognition(): any | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function ChatPage() {
  const { t, locale } = useI18n();
  const [input, setInput] = React.useState("");
  const [hasSpeechRecognition, setHasSpeechRecognition] = React.useState(false);
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      role: "assistant",
      content: t.chat.greeting,
    },
  ]);
  const [isSending, setIsSending] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const recognitionRef = React.useRef<any | null>(null);

  React.useEffect(() => {
    // Avoid hydration mismatch: server can't know SpeechRecognition availability.
    // Start with a deterministic value, then detect on client after mount.
    setHasSpeechRecognition(Boolean(getSpeechRecognition()));
  }, []);

  React.useEffect(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;
    const rec = new SR();
    rec.lang = locale === "zh" ? "zh-CN" : "en-US";
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e: any) => {
      const last = e.results?.[e.results.length - 1];
      const text = last?.[0]?.transcript ?? "";
      if (text) setInput(text);
    };
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  }, [locale]);

  async function send() {
    const content = input.trim();
    if (!content || isSending) return;
    setInput("");
    setIsSending(true);

    const next: Msg[] = [
      ...messages,
      { role: "user", content },
      { role: "assistant", content: "" },
    ];
    setMessages(next);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!res.ok || !res.body) throw new Error("Bad response");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          const idx = copy.length - 1;
          if (copy[idx]?.role === "assistant")
            copy[idx] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        const idx = copy.length - 1;
        if (copy[idx]?.role === "assistant") {
        copy[idx] = {
          role: "assistant",
          content: t.chat.error,
        };
        }
        return copy;
      });
    } finally {
      setIsSending(false);
    }
  }

  function toggleMic() {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isListening) {
      rec.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      rec.start();
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] animate-[slide-up-soft_0.35s_ease-out]">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-end justify-between gap-4">
          <div>
            <CardTitle>{t.chat.title}</CardTitle>
            <CardDescription>
              {t.chat.description}
            </CardDescription>
          </div>
          <div className="text-xs text-[var(--muted)]">POST `/api/chat`</div>
        </CardHeader>
        <CardContent>
          <div className="h-[52vh] overflow-auto rounded-2xl border border-[var(--border)] bg-black/10 p-4">
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[92%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 transition-transform duration-150",
                    m.role === "user"
                      ? "ml-auto bg-[var(--primary)] text-[var(--primary-foreground)] hover:-translate-y-0.5"
                      : "bg-white/5 text-white hover:-translate-y-0.5",
                  )}
                >
                  {m.content}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chat.placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
              }}
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-[var(--muted)]">
                {t.chat.hint}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={toggleMic}
                  disabled={!hasSpeechRecognition}
                >
                  {isListening ? (
                    <MicOff className="size-4" />
                  ) : (
                    <Mic className="size-4" />
                  )}
                  {isListening ? t.chat.stop : t.chat.voice}
                </Button>
                <Button
                  type="button"
                  onClick={send}
                  disabled={isSending || input.trim().length === 0}
                >
                  <Send className="size-4" />
                  {isSending ? t.chat.sending : t.chat.send}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.chat.interfaceTitle}</CardTitle>
            <CardDescription>
              {t.chat.interfaceDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[var(--muted)]">
            <div>- `app/api/chat/route.ts`：当前返回 text/plain 流式内容。</div>
            <div>
              - 你可以在里面接：工具调用、向量检索、记忆、权限、审计日志。
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.chat.personalityTitle}</CardTitle>
            <CardDescription>{t.chat.personalityDesc}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted)]">
            {t.chat.personalityContent}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

