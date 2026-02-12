"use client";

import type { Todo } from "@/lib/types";
import { getDayLabel, getDateLabel, isToday, cn } from "@/lib/utils";
import { NotebookColumn } from "@/components/NotebookColumn";

interface DayColumnProps {
  date: Date;
  todos: Todo[];
  containerId: string;
  onCreateTodo: (text: string) => void;
  onUpdateTodo: (id: string, updates: { text?: string; completed?: boolean }) => void;
  onDeleteTodo: (id: string) => void;
}

export function DayColumn({
  date,
  todos,
  containerId,
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
}: DayColumnProps) {
  const today = isToday(date);

  const header = (
    <div className="shrink-0 px-5 pt-4 pb-3">
      <p className="text-[10px] uppercase leading-tight tracking-wider text-muted-foreground">
        {getDateLabel(date)}
      </p>
      <p
        className={cn(
          "font-heading text-2xl font-bold uppercase leading-tight",
          today ? "text-[#9333ea]" : "text-white"
        )}
      >
        {getDayLabel(date)}
      </p>
    </div>
  );

  return (
    <div className={cn(
      "flex min-h-0 min-w-0 flex-1 flex-col",
      today && "relative"
    )}>
      {today && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#9333ea]/[0.04] to-transparent" />
      )}
      <NotebookColumn
        header={header}
        todos={todos}
        containerId={containerId}
        notebookClassName="flex-1 overflow-y-auto overflow-x-hidden scrollbar-fade"
        onCreateTodo={onCreateTodo}
        onUpdateTodo={onUpdateTodo}
        onDeleteTodo={onDeleteTodo}
      />
    </div>
  );
}
