import { useEffect, useRef } from "react";
import type { Chat } from "@/lib/types";
import type { UploadedFile } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { InputBox } from "./InputBox";
import { Activity } from "lucide-react";

interface Props {
  chat: Chat;
  onSend: (content: string, files?: UploadedFile[]) => void;
}

export function ChatWindow({ chat, onSend }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages.length]);

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
        {chat.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              ScanSense AI
            </h2>
            <p className="max-w-md text-muted-foreground text-sm leading-relaxed">
              Upload medical documents or images for AI-powered analysis. Ask questions about reports, lab results, or imaging studies.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
              {[
                "Analyze my blood test results",
                "What does this X-ray show?",
                "Explain my lab report",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSend(prompt)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            {chat.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <InputBox onSend={onSend} />
    </div>
  );
}
