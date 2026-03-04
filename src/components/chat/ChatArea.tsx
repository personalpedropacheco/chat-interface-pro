import { useRef, useEffect, useState } from "react";
import { ArrowDown, Bot, Link2 } from "lucide-react";
import { Conversation } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { ChatInput } from "./ChatInput";
import { Button } from "@/components/ui/button";
import { FileAttachment } from "@/types/chat";
import { toast } from "sonner";

const ERP_CONNECTIONS = [
  { id: "odoo", name: "Odoo", icon: "🟣" },
  { id: "sap", name: "SAP", icon: "🔵" },
  { id: "netsuite", name: "NetSuite", icon: "🟠" },
  { id: "dynamics", name: "Dynamics 365", icon: "🟢" },
];

interface ChatAreaProps {
  conversation: Conversation | null;
  isStreaming: boolean;
  onSend: (content: string, attachments?: FileAttachment[]) => void;
  onStop: () => void;
  onRegenerate: () => void;
}

export function ChatArea({ conversation, isStreaming, onSend, onStop, onRegenerate }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    if (!showScrollBtn) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [conversation?.messages.length, conversation?.messages[conversation.messages.length - 1]?.content]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  };

  const handleConnectERP = (erpId: string, erpName: string) => {
    toast.success(`Connection to ${erpName} initiated`, {
      description: "This is a mock connection. Real integration coming soon.",
    });
  };

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-muted-foreground">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-1">Start a new conversation</h2>
          <p className="text-sm">Select a chat from the sidebar or create a new one.</p>
        </div>
        <div className="flex flex-col items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Link2 className="h-3.5 w-3.5" />
            Connect an ERP
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {ERP_CONNECTIONS.map((erp) => (
              <Button
                key={erp.id}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => handleConnectERP(erp.id, erp.name)}
              >
                <span>{erp.icon}</span>
                {erp.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <div className="mx-auto max-w-3xl py-4">
          {conversation.messages.map((msg, i) => {
            const isLastMsg = i === conversation.messages.length - 1;
            const isThinking = isStreaming && isLastMsg && msg.role === "assistant" && msg.content === "";
            if (isThinking) return <ThinkingIndicator key={msg.id} />;
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLast={isLastMsg}
                isStreaming={isStreaming && isLastMsg && msg.role === "assistant"}
                onRegenerate={onRegenerate}
              />
            );
          })}
        </div>
      </div>

      {showScrollBtn && (
        <div className="relative">
          <Button
            variant="secondary"
            size="icon"
            className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full shadow-lg"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl pb-2">
        <ChatInput onSend={onSend} onStop={onStop} isStreaming={isStreaming} />
      </div>
    </div>
  );
}
