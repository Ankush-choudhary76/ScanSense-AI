import type { Message } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import { FileText, Image } from "lucide-react";

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex gap-3 max-w-[75%] ${isUser ? "flex-row-reverse" : ""}`}>
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-display font-semibold ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground"
          }`}
        >
          {isUser ? "U" : "AI"}
        </div>

        <div className="space-y-2">
          {/* File attachments */}
          {message.files && message.files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {message.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground"
                >
                  {file.type.startsWith("image/") ? (
                    <Image className="h-4 w-4 text-primary" />
                  ) : (
                    <FileText className="h-4 w-4 text-primary" />
                  )}
                  <span className="truncate max-w-[150px]">{file.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Message content */}
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              isUser
                ? "bg-chat-user text-chat-user-foreground rounded-br-md"
                : "bg-chat-ai text-chat-ai-foreground rounded-bl-md"
            }`}
          >
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 prose-blockquote:my-2">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
