import { useState } from "react";
import type { Chat } from "@/lib/types";
import {
  Plus,
  MessageSquare,
  Trash2,
  Pencil,
  Check,
  X,
  Activity,
  PanelLeftClose,
} from "lucide-react";

interface Props {
  chats: Chat[];
  activeChatId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onClose?: () => void;
}

export function ChatSidebar({
  chats,
  activeChatId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  onClose,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startEdit = (chat: Chat) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const confirmEdit = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <span className="font-display text-sm font-semibold text-foreground">
            ScanSense AI
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors lg:hidden"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* New chat */}
      <div className="p-3">
        <button
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-3">
        <p className="mb-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          History
        </p>
        <div className="space-y-1">
          {chats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isEditing = editingId === chat.id;

            return (
              <div
                key={chat.id}
                className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-sidebar-foreground hover:bg-muted"
                }`}
                onClick={() => !isEditing && onSelect(chat.id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />

                {isEditing ? (
                  <div className="flex flex-1 items-center gap-1">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
                      className="flex-1 bg-transparent text-sm outline-none text-foreground"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button onClick={(e) => { e.stopPropagation(); confirmEdit(); }}>
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }}>
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 truncate">{chat.title}</span>
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); startEdit(chat); }}
                        className="rounded p-1 hover:bg-background/50"
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(chat.id); }}
                        className="rounded p-1 hover:bg-background/50"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
