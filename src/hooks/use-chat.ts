import { useState, useCallback, useRef, useEffect } from "react";
import { Conversation, Message, ChatSettings, FileAttachment } from "@/types/chat";

const SERVER_URL = "http://localhost:3002";

const DEFAULT_SETTINGS: ChatSettings = {
  model: "llama2",
  temperature: 0.7,
  systemPrompt: "You are a helpful AI assistant.",
};

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [isStreaming, setIsStreaming] = useState(false);
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const streamAbortRef = useRef(false);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  // Fetch available Ollama models on mount
  useEffect(() => {
    fetch(`${SERVER_URL}/api/models`)
      .then((res) => res.json())
      .then((data) => {
        if (data.models && data.models.length > 0) {
          const mapped = data.models.map((m: { name: string }) => ({
            id: m.name,
            name: m.name,
          }));
          setModels(mapped);
          setSettings((prev) => ({ ...prev, model: mapped[0].id }));
        }
      })
      .catch((err) => console.error("Failed to fetch models:", err));
  }, []);

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

  const streamOllamaResponse = useCallback(
    async (convId: string, userContent: string, history: Message[]) => {
      setIsStreaming(true);
      streamAbortRef.current = false;

      const assistantId = (Date.now() + 1).toString();

      // Add empty assistant message placeholder
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

      try {
        const response = await fetch(`${SERVER_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userContent,
            model: settings.model,
            temperature: settings.temperature,
            conversationHistory: history.slice(-10).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error("Failed to connect to chat server");
        }

        const reader = response.body.getReader();
        readerRef.current = reader;
        const decoder = new TextDecoder();

        while (true) {
          if (streamAbortRef.current) {
            reader.cancel();
            break;
          }

          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));

              if (data.token) {
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === convId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === assistantId ? { ...m, content: m.content + data.token } : m
                          ),
                        }
                      : c
                  )
                );
              }

              if (data.error) {
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === convId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === assistantId
                              ? { ...m, content: `Error: ${data.error}` }
                              : m
                          ),
                        }
                      : c
                  )
                );
              }
            } catch {
              // Skip invalid JSON lines
            }
          }
        }
      } catch (err) {
        console.error("Streaming error:", err);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: "Error: Could not reach Ollama server. Is it running?" }
                      : m
                  ),
                }
              : c
          )
        );
      } finally {
        readerRef.current = null;
        setIsStreaming(false);
      }
    },
    [settings.model, settings.temperature]
  );

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

      let currentHistory: Message[] = [];
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const isFirst = c.messages.length === 0;
          const updated = {
            ...c,
            title: isFirst ? content.slice(0, 40) + (content.length > 40 ? "…" : "") : c.title,
            messages: [...c.messages, userMessage],
            updatedAt: new Date(),
          };
          currentHistory = updated.messages;
          return updated;
        })
      );

      await streamOllamaResponse(convId, content, currentHistory);
    },
    [activeConversationId, createConversation, streamOllamaResponse]
  );

  const regenerateLastResponse = useCallback(async () => {
    if (!activeConversation || activeConversation.messages.length < 2) return;
    const lastUserMsg = [...activeConversation.messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;

    // Remove last assistant message
    const historyWithoutLast = activeConversation.messages.slice(0, -1);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId ? { ...c, messages: historyWithoutLast } : c
      )
    );

    await streamOllamaResponse(activeConversationId!, lastUserMsg.content, historyWithoutLast);
  }, [activeConversation, activeConversationId, streamOllamaResponse]);

  const stopStreaming = useCallback(() => {
    streamAbortRef.current = true;
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
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
