"use client";

import { addDays, formatDateKey } from "@/lib/utils";
import { DayColumn } from "@/components/DayColumn";
import {
  useDayTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useReorderTodos,
} from "@/hooks/useTodos";

function DayColumnContainer({ date }: { date: Date }) {
  const dateKey = formatDateKey(date);
  const { data, isLoading, isError } = useDayTodos(dateKey);
  const todos = data?.todos ?? [];
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const reorderTodos = useReorderTodos();

  if (isLoading) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0 px-5 pt-4 pb-3">
          <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
          <div className="mt-1 h-5 w-24 animate-pulse rounded bg-white/10" />
        </div>
        <div className="notebook-lines flex-1 space-y-1 px-2 pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-full items-center justify-center px-3">
          <p className="text-xs text-red-400/70">Failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <DayColumn
      date={date}
      todos={todos}
      onCreateTodo={(text) =>
        createTodo.mutate({ text, source: { type: "day", date: dateKey } })
      }
      onUpdateTodo={(id, updates) => updateTodo.mutate({ id, ...updates })}
      onDeleteTodo={(id) => deleteTodo.mutate({ id, source: `day:${dateKey}` })}
      onReorder={(todoIds) =>
        reorderTodos.mutate({ todoIds, key: `day:${dateKey}` })
      }
    />
  );
}

interface CalendarViewProps {
  startDate: Date;
}

export function CalendarView({ startDate }: CalendarViewProps) {
  const dates = Array.from({ length: 5 }, (_, i) => addDays(startDate, i));

  return (
    <div className="flex h-full px-2">
      {/* Mobile: 1 day */}
      <div className="flex h-full flex-1 gap-4 md:hidden">
        <DayColumnContainer date={dates[0]} />
      </div>

      {/* Tablet: 3 days */}
      <div className="hidden h-full flex-1 gap-4 md:flex lg:hidden">
        {dates.slice(0, 3).map((date) => (
          <DayColumnContainer key={formatDateKey(date)} date={date} />
        ))}
      </div>

      {/* Desktop: 5 days */}
      <div className="hidden h-full flex-1 gap-4 lg:flex">
        {dates.map((date) => (
          <DayColumnContainer key={formatDateKey(date)} date={date} />
        ))}
      </div>
    </div>
  );
}
