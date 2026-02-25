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
    id: "0",
    title: "Q1 Expense Report",
    model: "gpt-4o",
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: "m0a",
        role: "user",
        content: "Can you pull together the Q1 expense report for Sarah Johnson?",
        timestamp: now,
      },
      {
        id: "m0b",
        role: "assistant",
        content: `Here's the Q1 expense report for Sarah Johnson:

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

The report is currently **pending** approval. Total comes to **$2,983.07** including tax. Want me to break it down further by category?`,
        timestamp: now,
      },
    ],
  },
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
