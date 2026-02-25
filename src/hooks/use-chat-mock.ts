import { useState, useCallback, useRef } from "react";
import { Conversation, Message, ChatSettings, FileAttachment, AI_MODELS } from "@/types/chat";
import { mockConversations } from "@/lib/mock-data";

const DEFAULT_SETTINGS: ChatSettings = {
  model: "gpt-4o",
  temperature: 0.7,
  systemPrompt: "You are a helpful AI assistant.",
};

const MOCK_EXPENSE_REPORT = `Here's the expense report you requested:

\`\`\`expense-report
{
  "title": "Q1 2026 Business Travel",
  "employee": "Sarah Johnson",
  "dateRange": { "from": "Jan 1, 2026", "to": "Mar 31, 2026" },
  "status": "pending",
  "currency": "USD",
  "lineItems": [
    { "date": "Jan 12", "description": "Flight to NYC (client meeting)", "category": "Travel", "amount": 485.00 },
    { "date": "Jan 12-14", "description": "Hotel — Marriott Midtown", "category": "Lodging", "amount": 678.50 },
    { "date": "Jan 13", "description": "Client dinner at Nobu", "category": "Meals", "amount": 234.80 },
    { "date": "Feb 3", "description": "Uber rides (5 trips)", "category": "Transport", "amount": 97.25 },
    { "date": "Feb 20", "description": "Conference registration — ReactConf", "category": "Events", "amount": 350.00 },
    { "date": "Mar 8", "description": "Flight to SF (team offsite)", "category": "Travel", "amount": 312.00 },
    { "date": "Mar 8-10", "description": "Airbnb — Mission District", "category": "Lodging", "amount": 420.00 },
    { "date": "Mar 9", "description": "Team lunch", "category": "Meals", "amount": 186.40 }
  ],
  "tax": 219.12,
  "total": 2983.07
}
\`\`\`

Let me know if you'd like any adjustments!`;

const MOCK_RESPONSES = [
  "That's a great question! Let me break it down for you.\n\n## Key Points\n\n1. **First**, consider the overall architecture\n2. **Second**, think about performance implications\n3. **Third**, always test thoroughly\n\n```typescript\nconst example = () => {\n  return 'Hello, world!';\n};\n```\n\nHope that helps! Let me know if you have more questions.",
  "Here's what I think about that:\n\nThe approach you're describing is solid. I'd recommend:\n\n- Using **memoization** for expensive computations\n- Keeping your components **small and focused**\n- Writing **tests** for critical paths\n\n| Approach | Pros | Cons |\n|----------|------|------|\n| Option A | Simple | Limited |\n| Option B | Flexible | Complex |\n| Option C | Balanced | Moderate |",
  "Absolutely! Here's a quick example:\n\n```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n```\n\nThis is the recursive approach. For better performance, consider **dynamic programming** or **memoization**.",
  MOCK_EXPENSE_REPORT,
];

export function useChatMock() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamAbortRef = useRef(false);

  const models = AI_MODELS.map((m) => ({ id: m.id, name: m.name }));
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
      if (activeConversationId === id) setActiveConversationId(null);
    },
    [activeConversationId]
  );

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
  }, []);

  const simulateStreaming = useCallback(
    async (convId: string, responseText: string) => {
      setIsStreaming(true);
      streamAbortRef.current = false;
      const assistantId = (Date.now() + 1).toString();

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

      for (let i = 0; i < responseText.length; i++) {
        if (streamAbortRef.current) break;
        await new Promise((r) => setTimeout(r, 15));
        const char = responseText[i];
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantId ? { ...m, content: m.content + char } : m
                  ),
                }
              : c
          )
        );
      }
      setIsStreaming(false);
    },
    []
  );

  const sendMessage = useCallback(
    async (content: string, attachments?: FileAttachment[]) => {
      let convId = activeConversationId;
      if (!convId) convId = createConversation();

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

      const mockResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      await simulateStreaming(convId, mockResponse);
    },
    [activeConversationId, createConversation, simulateStreaming]
  );

  const regenerateLastResponse = useCallback(async () => {
    if (!activeConversation || activeConversation.messages.length < 2) return;
    const historyWithoutLast = activeConversation.messages.slice(0, -1);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId ? { ...c, messages: historyWithoutLast } : c
      )
    );
    const mockResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    await simulateStreaming(activeConversationId!, mockResponse);
  }, [activeConversation, activeConversationId, simulateStreaming]);

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
    models,
  };
}
