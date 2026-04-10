import { useState, useCallback, useEffect } from "react";
import type { Chat, Message, UploadedFile } from "./types";

const STORAGE_KEY = "scansense_chats_v1";
const ACTIVE_CHAT_KEY = "scansense_active_chat_v1";

const generateId = () => Math.random().toString(36).slice(2, 11);

const createNewChat = (): Chat => ({
  id: generateId(),
  title: "New Chat",
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Helper to parse stored chats and restore Date objects
const parseStoredChats = (json: string): Chat[] => {
  try {
    const data = JSON.parse(json);
    return data.map((chat: any) => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      messages: chat.messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }));
  } catch (e) {
    return [createNewChat()];
  }
};

export function useChatStore() {
  const [chats, setChats] = useState<Chat[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseStoredChats(stored) : [createNewChat()];
  });

  const [activeChatId, setActiveChatId] = useState<string>(() => {
    const stored = localStorage.getItem(ACTIVE_CHAT_KEY);
    return stored && chats.some(c => c.id === stored) ? stored : chats[0].id;
  });

  // Save to localStorage whenever chats or activeChatId change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId);
  }, [activeChatId]);

  const activeChat = chats.find((c) => c.id === activeChatId) ?? chats[0];

  const addNewChat = useCallback(() => {
    const chat = createNewChat();
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      setChats((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (next.length === 0) {
          const fresh = createNewChat();
          setActiveChatId(fresh.id);
          return [fresh];
        }
        if (id === activeChatId) setActiveChatId(next[0].id);
        return next;
      });
    },
    [activeChatId]
  );

  const renameChat = useCallback((id: string, title: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
  }, []);

  const sendMessage = useCallback(
    async (content: string, files?: UploadedFile[]) => {
      const currentChat = chats.find(c => c.id === activeChatId);
      if (!currentChat) return;

      const userMsgId = generateId();
      const userMsg: Message = {
        id: userMsgId,
        role: "user",
        content,
        files,
        timestamp: new Date(),
      };

      // Update local state immediately
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== activeChatId) return c;
          const isFirst = c.messages.length === 0;
          return {
            ...c,
            title: isFirst ? content.slice(0, 40) : c.title,
            messages: [...c.messages, userMsg],
            updatedAt: new Date(),
          };
        })
      );

      const aiMsgId = generateId();
      const aiMsg: Message = {
        id: aiMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? { ...c, messages: [...c.messages, aiMsg], updatedAt: new Date() }
            : c
        )
      );

      try {
        let uploadedContext = "";
        let uploadedContentType = "";

        if (files && files.length > 0) {
          const fileData = files[0].file;
          if (fileData) {
            const formData = new FormData();
            formData.append("file", fileData);

            const uploadRes = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              uploadedContext = uploadData.context;
              uploadedContentType = uploadData.content_type;
            }
          }
        }

        const chatRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            session_id: currentChat.backendId,
            context: uploadedContext || undefined,
            content_type: uploadedContentType || undefined,
          }),
        });

        if (!chatRes.ok) throw new Error("Failed to get response");
        if (!chatRes.body) throw new Error("No response body");

        const reader = chatRes.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          const lines = chunkText.split("\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              
              if (data.startsWith("SESSION_ID:")) {
                const bId = parseInt(data.split(":")[1]);
                setChats(prev => prev.map(c => 
                  c.id === activeChatId ? { ...c, backendId: bId } : c
                ));
                continue;
              }

              if (data === "[DONE]") continue;

              fullResponse += data;
              setChats((prev) =>
                prev.map((c) =>
                  c.id === activeChatId
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === aiMsgId ? { ...m, content: fullResponse } : m
                        ),
                        updatedAt: new Date(),
                      }
                    : c
                )
              );
            }
          }
        }
      } catch (error: any) {
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === aiMsgId ? { ...m, content: `Error: ${error.message}` } : m
                  ),
                }
              : c
          )
        );
      }
    },
    [activeChatId, chats]
  );

  return {
    chats,
    activeChat,
    activeChatId,
    setActiveChatId,
    addNewChat,
    deleteChat,
    renameChat,
    sendMessage,
  };
}
