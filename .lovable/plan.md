
# AI Chatbot Dashboard

A full-featured chatbot UI with a dashboard layout, designed desktop-first with responsive mobile support. All data comes from external APIs — this is a pure frontend implementation.

## Layout
- **Left sidebar**: Conversation history list with search, rename, and delete. Collapsible to icon-only mini mode.
- **Main chat area**: Message thread with input bar at the bottom.
- **Right panel / header bar**: Model selector, settings (temperature, system prompt), and theme toggle (dark/light).

## Core Chat Features
- **Message rendering**: Markdown support with syntax-highlighted code blocks, tables, and lists for AI responses. User messages rendered as plain text bubbles.
- **Streaming simulation**: Typing/streaming effect for AI responses with a loading indicator.
- **File uploads**: Attach images and files to messages via a button or drag-and-drop. Show file previews (image thumbnails, file name/size for non-images) in the message.
- **Copy & retry actions**: Copy message content, regenerate last AI response.
- **Auto-scroll**: Scroll to bottom on new messages with a "scroll to bottom" button when scrolled up.

## Conversation History Sidebar
- List of past conversations grouped by date (Today, Yesterday, Previous 7 days, etc.)
- Search/filter conversations
- Rename and delete conversations via context menu or inline actions
- "New chat" button at the top
- Active conversation highlighted

## Settings & Model Selection
- Dropdown to select AI model (e.g., GPT-4, Claude, etc. — configurable list)
- Temperature slider
- System prompt text area (collapsible)
- Dark/light theme toggle in the header

## Authentication (Placeholder)
- Mock auth state with a simple login page
- User avatar and name in the sidebar footer
- "Log out" action (resets to login screen)

## API Integration Ready
- All chat, conversation, and user data managed through a clean service/hook layer with placeholder API calls (using react-query)
- Easy to swap in real API endpoints later
- Structured types/interfaces for messages, conversations, and user data

## Responsive Design
- Desktop-first with sidebar visible by default
- On mobile: sidebar collapses to overlay/drawer, chat area takes full width
