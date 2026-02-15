import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, RefreshCw, User, Bot, FileIcon } from "lucide-react";
import { Message } from "@/types/chat";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  isStreaming: boolean;
  onRegenerate?: () => void;
}

export function MessageBubble({ message, isLast, isStreaming, onRegenerate }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copyContent = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  return (
    <div className={`flex gap-3 px-4 py-4 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div className={`flex flex-col gap-1 ${isUser ? "items-end max-w-[70%]" : "max-w-[80%]"}`}>
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {message.attachments.map((att) =>
              att.type.startsWith("image/") ? (
                <img key={att.id} src={att.url} alt={att.name} className="max-h-48 rounded-lg border border-border" />
              ) : (
                <div key={att.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs">
                  <FileIcon className="h-4 w-4" />
                  <span>{att.name}</span>
                  <span className="text-muted-foreground">({(att.size / 1024).toFixed(1)}KB)</span>
                </div>
              )
            )}
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-chat-user text-foreground"
              : "bg-chat-assistant text-foreground"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = !match;
                    return isInline ? (
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono" {...props}>
                        {children}
                      </code>
                    ) : (
                      <div className="relative my-2 rounded-lg overflow-hidden border border-border">
                        <div className="flex items-center justify-between bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                          <span>{match[1]}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(String(children));
                            }}
                            className="hover:text-foreground transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.8rem" }}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="my-2 overflow-x-auto rounded-lg border border-border">
                        <table className="w-full text-xs">{children}</table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return <th className="bg-muted px-3 py-2 text-left font-medium">{children}</th>;
                  },
                  td({ children }) {
                    return <td className="border-t border-border px-3 py-2">{children}</td>;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isLast && isStreaming && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
              )}
            </div>
          )}
        </div>
        {!isUser && message.content && (
          <div className="flex items-center gap-1 mt-0.5">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={copyContent}>
              {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            {isLast && !isStreaming && onRegenerate && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={onRegenerate}>
                <RefreshCw className="h-3 w-3 mr-1" /> Retry
              </Button>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
