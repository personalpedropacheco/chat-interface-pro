import { Bot } from "lucide-react";

export function ThinkingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground animate-pulse">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl bg-chat-assistant px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">Thinking</span>
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}
