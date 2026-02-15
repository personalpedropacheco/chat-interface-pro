import { useState, useCallback, useRef } from "react";
import { Conversation, Message, ChatSettings, FileAttachment } from "@/types/chat";
import { mockConversations } from "@/lib/mock-data";

const DEFAULT_SETTINGS: ChatSettings = {
  model: "gpt-4o",
  temperature: 0.7,
  systemPrompt: "You are a helpful AI assistant.",
};

const MOCK_RESPONSES = [
  "That's a great question! Let me break it down for you.\n\n## Key Points\n\n1. **First**, consider the architecture\n2. **Second**, think about scalability\n3. **Third**, don't forget testing\n\n```typescript\nconst example = () => {\n  console.log('Hello, world!');\n};\n```\n\nLet me know if you need more details!",
  "Here's what I'd recommend:\n\n- Start with a clear plan\n- Break the problem into smaller pieces\n- Iterate and refine\n\n> \"The best way to predict the future is to invent it.\" — Alan Kay\n\nWould you like me to elaborate on any of these points?",
  "I can help with that! Here's a comprehensive overview:\n\n| Feature | Pros | Cons |\n|---------|------|------|\n| Option A | Fast, simple | Limited |\n| Option B | Flexible | Complex |\n| Option C | Scalable | Expensive |\n\n### My Recommendation\n\nGo with **Option B** if you need flexibility, or **Option A** for a quick solution.\n\n```bash\nnpm install solution-b\n```",
];

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>("1");
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamAbortRef = useRef(false);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const createConversation = useCallback(() => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: "New chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: settings.model,
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    return newConv.id;
  }, [settings.model]);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    },
    [activeConversationId]
  );

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
  }, []);

  const sendMessage = useCallback(
    async (content: string, attachments?: FileAttachment[]) => {
      let convId = activeConversationId;
      if (!convId) {
        convId = createConversation();
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
        attachments,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const isFirst = c.messages.length === 0;
          return {
            ...c,
            title: isFirst ? content.slice(0, 40) + (content.length > 40 ? "…" : "") : c.title,
            messages: [...c.messages, userMessage],
            updatedAt: new Date(),
          };
        })
      );

      // Simulate streaming response
      setIsStreaming(true);
      streamAbortRef.current = false;

      const fullResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      const assistantId = (Date.now() + 1).toString();

      // Add empty assistant message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  { id: assistantId, role: "assistant" as const, content: "", timestamp: new Date() },
                ],
              }
            : c
        )
      );

      // Stream characters
      for (let i = 0; i <= fullResponse.length; i++) {
        if (streamAbortRef.current) break;
        await new Promise((r) => setTimeout(r, 12));
        const partial = fullResponse.slice(0, i);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) => (m.id === assistantId ? { ...m, content: partial } : m)),
                }
              : c
          )
        );
      }

      setIsStreaming(false);
    },
    [activeConversationId, createConversation]
  );

  const regenerateLastResponse = useCallback(async () => {
    if (!activeConversation || activeConversation.messages.length < 2) return;
    const lastUserMsg = [...activeConversation.messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;

    // Remove last assistant message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, messages: c.messages.slice(0, -1) }
          : c
      )
    );

    // Resend
    const content = lastUserMsg.content;
    // Directly simulate again
    setIsStreaming(true);
    streamAbortRef.current = false;

    const fullResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    const assistantId = (Date.now() + 1).toString();

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: assistantId, role: "assistant" as const, content: "", timestamp: new Date() },
              ],
            }
          : c
      )
    );

    for (let i = 0; i <= fullResponse.length; i++) {
      if (streamAbortRef.current) break;
      await new Promise((r) => setTimeout(r, 12));
      const partial = fullResponse.slice(0, i);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                messages: c.messages.map((m) => (m.id === assistantId ? { ...m, content: partial } : m)),
              }
            : c
        )
      );
    }
    setIsStreaming(false);
  }, [activeConversation, activeConversationId]);

  const stopStreaming = useCallback(() => {
    streamAbortRef.current = true;
    setIsStreaming(false);
  }, []);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    deleteConversation,
    renameConversation,
    sendMessage,
    regenerateLastResponse,
    stopStreaming,
    isStreaming,
    settings,
    setSettings,
  };
}
