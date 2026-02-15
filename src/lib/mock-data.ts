import { Conversation, UserProfile } from "@/types/chat";

export const mockUser: UserProfile = {
  id: "1",
  name: "Alex Chen",
  email: "alex@example.com",
  avatar: undefined,
};

const now = new Date();
const yesterday = new Date(now.getTime() - 86400000);
const twoDaysAgo = new Date(now.getTime() - 172800000);
const weekAgo = new Date(now.getTime() - 604800000);

export const mockConversations: Conversation[] = [
  {
    id: "1",
    title: "React performance optimization",
    model: "gpt-4o",
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: "m1",
        role: "user",
        content: "How can I optimize React rendering performance?",
        timestamp: now,
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Here are some key strategies for optimizing React rendering performance:\n\n## 1. Memoization\n\nUse `React.memo()` for components that render the same output given the same props:\n\n```tsx\nconst ExpensiveComponent = React.memo(({ data }) => {\n  return <div>{/* complex rendering */}</div>;\n});\n```\n\n## 2. useMemo and useCallback\n\n```tsx\nconst memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);\nconst memoizedCallback = useCallback(() => doSomething(a), [a]);\n```\n\n## 3. Virtual Lists\n\nFor large lists, use virtualization libraries like `react-window` or `tanstack-virtual`.\n\n## 4. Code Splitting\n\nUse `React.lazy()` and `Suspense` for route-based code splitting.\n\n| Technique | Best For | Complexity |\n|-----------|----------|------------|\n| React.memo | Pure components | Low |\n| useMemo | Expensive calculations | Low |\n| Virtualization | Large lists | Medium |\n| Code splitting | Large apps | Medium |",
        timestamp: now,
      },
    ],
  },
  {
    id: "2",
    title: "TypeScript generics explained",
    model: "claude-3.5-sonnet",
    createdAt: yesterday,
    updatedAt: yesterday,
    messages: [
      {
        id: "m3",
        role: "user",
        content: "Can you explain TypeScript generics with examples?",
        timestamp: yesterday,
      },
      {
        id: "m4",
        role: "assistant",
        content:
          "TypeScript generics allow you to create reusable components that work with multiple types.\n\n```typescript\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\nconst result = identity<string>('hello');\n```\n\nGenerics are like **type variables** — placeholders for types that are specified when used.",
        timestamp: yesterday,
      },
    ],
  },
  {
    id: "3",
    title: "CSS Grid vs Flexbox",
    model: "gpt-4o",
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
    messages: [
      {
        id: "m5",
        role: "user",
        content: "When should I use CSS Grid vs Flexbox?",
        timestamp: twoDaysAgo,
      },
      {
        id: "m6",
        role: "assistant",
        content: "Use **Flexbox** for one-dimensional layouts and **CSS Grid** for two-dimensional layouts.",
        timestamp: twoDaysAgo,
      },
    ],
  },
  {
    id: "4",
    title: "Database design patterns",
    model: "gpt-4-turbo",
    createdAt: weekAgo,
    updatedAt: weekAgo,
    messages: [
      {
        id: "m7",
        role: "user",
        content: "What are common database design patterns?",
        timestamp: weekAgo,
      },
      {
        id: "m8",
        role: "assistant",
        content: "Common patterns include normalization, denormalization, event sourcing, and CQRS.",
        timestamp: weekAgo,
      },
    ],
  },
];
