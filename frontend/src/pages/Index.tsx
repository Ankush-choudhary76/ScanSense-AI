import { useState } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useChatStore } from "@/lib/chat-store";
import { PanelLeft } from "lucide-react";

const Index = () => {
  const store = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar - desktop */}
      <div
        className={`hidden lg:block transition-all duration-200 ${
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
      >
        <ChatSidebar
          chats={store.chats}
          activeChatId={store.activeChatId}
          onSelect={store.setActiveChatId}
          onNew={store.addNewChat}
          onDelete={store.deleteChat}
          onRename={store.renameChat}
        />
      </div>

      {/* Sidebar - mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 h-full">
            <ChatSidebar
              chats={store.chats}
              activeChatId={store.activeChatId}
              onSelect={(id) => {
                store.setActiveChatId(id);
                setSidebarOpen(false);
              }}
              onNew={() => {
                store.addNewChat();
                setSidebarOpen(false);
              }}
              onDelete={store.deleteChat}
              onRename={store.renameChat}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="flex h-12 items-center justify-between border-b border-border px-4">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
          <ThemeToggle />
        </header>

        <ChatWindow chat={store.activeChat} onSend={store.sendMessage} />
      </div>
    </div>
  );
};

export default Index;
