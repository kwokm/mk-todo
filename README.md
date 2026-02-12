# MK-TODO

A personally optimized todo list and productivity engine — built around a notebook-style UI with a weekly calendar view and tabbed lists.

## Features

### Calendar View
- Multi-day column layout with a notebook-lined aesthetic — each day is a writable page
- Responsive column count: 5 days on desktop, 3 on tablet, 1 on mobile
- Navigate by day or week with slide transitions and swipe-to-navigate on mobile
- Today's column is highlighted with a purple accent

### Tabbed Lists
- Organize todos into named tabs, each containing multiple lists
- Create, rename (double-click), and delete tabs with a confirmation dialog
- Lists within a tab are displayed as side-by-side notebook columns on desktop and stacked vertically on mobile

### Todo Items
- Click any empty notebook line to create a new todo
- Inline editing on click, with keyboard shortcuts (Enter to save, Escape to cancel)
- Mark complete with an animated check, drag-and-drop to reorder
- Inline markdown rendering: **bold**, *italic*, ~~strikethrough~~, `code`, [links](url), and auto-linked URLs
- Header syntax (`# heading`) renders as a styled label for section dividers

### Mobile Experience
- Draggable bottom sheet with three snap points (collapsed, half, full) and backdrop overlay
- Touch controls (checkbox, drag handle, delete) are always visible on mobile
- Swipe gestures on the calendar for quick day navigation

### Design
- Dark-first theme with purple (#9333ea) accents
- Fjalla One headings, Inter body text
- Notebook-lined background pattern with fade-on-hover scrollbars
- Smooth transitions: slide animations, fade-in/out, scale pop on complete, collapse on delete
- Respects `prefers-reduced-motion`

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com), [Radix UI](https://www.radix-ui.com) |
| State | [TanStack Query](https://tanstack.com/query) with optimistic updates |
| Drag & Drop | [dnd kit](https://dndkit.com) |
| Database | [Upstash Redis](https://upstash.com) (serverless) |
| Icons | [Lucide](https://lucide.dev) |

## Getting Started

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Add your Upstash Redis credentials to .env

# Run the dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.
