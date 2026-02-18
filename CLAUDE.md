# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev              # start Next.js dev server
bun run build        # production build
bun run lint         # ESLint
bun test             # run unit tests (Vitest)
bun test:watch       # unit tests in watch mode
bun test:e2e         # Playwright E2E tests (all viewports)
bun test:e2e:ui      # Playwright with interactive UI

# Run a single unit test file
bun test src/__tests__/path/to/file.test.ts

# Run a single E2E spec
bunx playwright test e2e/calendar.spec.ts
```

Unit tests live in `src/__tests__/`. E2E tests live in `e2e/`. Vitest uses jsdom; Playwright runs three project profiles: desktop (1280×720), tablet (iPad), mobile (iPhone 13).

Environment: copy `.env.example` → `.env.local` and supply `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

## Architecture

### Stack

Next.js 16 App Router · React 19 · TypeScript · TanStack Query v5 · Upstash Redis · dnd-kit · Tailwind CSS 4 · shadcn/ui · Vitest · Playwright

### Data model

Redis stores:
- Todo data as hashes: `todo:{id}` → `{id, text, completed, createdAt, updatedAt}`
- Ordering as sorted sets: `day:{YYYY-MM-DD}` or `list:{tabId}:{listId}` → todo IDs scored by timestamp
- Tabs/lists as JSON strings: `tabs`, `lists:{tabId}`

### Source key encoding

A **source key** is the string that identifies where a todo lives. It takes two forms:
- `day:YYYY-MM-DD` for calendar todos
- `list:{tabId}:{listId}` for named lists

This string is used as the `containerId` in dnd-kit, as the React Query cache key suffix (`["dayTodos", date]` / `["listTodos", tabId, listId]`), and as the Redis sorted-set key. Any feature that touches cross-source moves or cache invalidation depends on this encoding.

### API routes (`src/app/api/`)

| Route | Methods |
|---|---|
| `/api/todos/day/[date]` | GET, POST |
| `/api/todos/list/[tabId]/[listId]` | GET, POST |
| `/api/todos/[id]` | PATCH, DELETE |
| `/api/todos/move` | POST |
| `/api/todos/reorder` | POST |
| `/api/tabs` | GET, POST, PATCH, DELETE |
| `/api/tabs/[tabId]/lists` | GET, POST, PATCH, DELETE |
| `/api/tabs/[tabId]/lists/reorder` | POST |

All routes validate input via helpers in `src/lib/validation.ts` before touching Redis.

### State management

TanStack Query is the only client state layer. Query keys mirror the data hierarchy:

```
["tabs"]
["lists", tabId]
["dayTodos", date]
["listTodos", tabId, listId]
```

All mutations follow the same optimistic-update contract in `src/hooks/`:
1. `onMutate` — cancel in-flight queries, snapshot cache, apply optimistic change, return snapshot as context
2. `onError` — roll back to snapshot
3. `onSettled` — invalidate affected keys

New todos are given a temporary `temp-{timestamp}` ID until the server responds.

### Component hierarchy

```
page.tsx
├── CalendarView          — 1 / 3 / 5 day columns (viewport-dependent), swipe navigation
│   └── DayColumn
│       └── NotebookColumn  — dnd-kit DndContext, notebook-lined background, click-to-create
│           └── SortableTodoItem → TodoItem
└── ListView              — horizontal (desktop) / vertical (mobile) list columns
    └── ListColumn
        └── NotebookColumn
```

`BottomSheet` (mobile only) wraps `ListView` with three snap points: 80 px / 45 vh / 90 vh.

### Drag and drop

dnd-kit is configured with `MouseSensor` (5 px threshold), `TouchSensor` (200 ms delay, 8 px tolerance), and `KeyboardSensor`. Both `restrictToVerticalAxis` and `restrictToParentElement` modifiers are applied. `onDragEnd` triggers a `useReorderTodo` mutation. The `spacebar` fix in `TodoItem` edit mode calls `e.stopPropagation()` to prevent dnd-kit's keyboard listener from hijacking input.

### Markdown rendering

`src/lib/markdown.tsx` provides a sequential pipeline: links → inline code → bold → italic → strikethrough → bare URLs. A line starting with `#` is rendered as a styled heading row (dark bg, bold, uppercase, wide tracking) rather than a todo.

### Responsive breakpoints

Hard-coded thresholds: mobile < 768 px, tablet 768–1023 px, desktop ≥ 1024 px. Column counts: 1 / 3 / 5 days. These drive layout switches in `page.tsx` and column visibility logic in `CalendarView`.

### Git hooks

`.githooks/pre-commit` rewrites private Artifactory registry URLs in `bun.lock` to the public npm registry so Vercel CI can resolve packages. The `prepare` script wires up this hooks directory automatically on `bun install`.
