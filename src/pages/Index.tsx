import { useState } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { SettingsPanel } from "@/components/chat/SettingsPanel";
import { ThemeToggle } from "@/components/chat/ThemeToggle";
import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { AI_MODELS } from "@/types/chat";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import LoginPage from "./Login";

const Index = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const chat = useChat();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  const currentModelName = AI_MODELS.find((m) => m.id === chat.settings.model)?.name || chat.settings.model;

  const sidebarContent = (
    <ChatSidebar
      conversations={chat.conversations}
      activeId={chat.activeConversationId}
      onSelect={(id) => {
        chat.setActiveConversationId(id);
        if (isMobile) setMobileSidebarOpen(false);
      }}
      onCreate={() => {
        chat.createConversation();
        if (isMobile) setMobileSidebarOpen(false);
      }}
      onDelete={chat.deleteConversation}
      onRename={chat.renameConversation}
      user={user}
      onLogout={logout}
      collapsed={false}
      onToggle={() => (isMobile ? setMobileSidebarOpen(false) : setSidebarCollapsed(true))}
    />
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop sidebar */}
      {!isMobile && (
        sidebarCollapsed ? (
          <div className="flex h-full w-14 flex-col items-center border-r border-border bg-sidebar py-3 gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSidebarCollapsed(false)}>
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          sidebarContent
        )
      )}

      {/* Mobile sidebar as sheet */}
      {isMobile && (
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-4 h-12 shrink-0">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileSidebarOpen(true)}>
                <PanelLeft className="h-4 w-4" />
              </Button>
            )}
            <span className="text-xs font-medium text-muted-foreground">{currentModelName}</span>
          </div>
          <div className="flex items-center gap-1">
            <SettingsPanel settings={chat.settings} onChange={chat.setSettings} />
            <ThemeToggle />
          </div>
        </header>

        {/* Chat area */}
        <ChatArea
          conversation={chat.activeConversation}
          isStreaming={chat.isStreaming}
          onSend={chat.sendMessage}
          onStop={chat.stopStreaming}
          onRegenerate={chat.regenerateLastResponse}
        />
      </div>
    </div>
  );
};

export default Index;
