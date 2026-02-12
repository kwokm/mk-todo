"use client";

import { useCallback, type ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { useReorderTodos } from "@/hooks/useTodos";
import type { DayTodosResponse, ListTodosResponse } from "@/lib/types";

type CacheData = DayTodosResponse | ListTodosResponse;

interface TodoDndProviderProps {
  children: ReactNode;
}

export function TodoDndProvider({ children }: TodoDndProviderProps) {
  const queryClient = useQueryClient();
  const reorderTodos = useReorderTodos();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainerForItem = useCallback(
    (itemId: string): { key: string; queryKey: readonly unknown[] } | null => {
      const dayQueries = queryClient.getQueriesData<DayTodosResponse>({
        queryKey: ["dayTodos"],
      });
      for (const [qk, data] of dayQueries) {
        if (data?.todos.some((t) => t.id === itemId)) {
          return { key: `day:${qk[1]}`, queryKey: qk };
        }
      }

      const listQueries = queryClient.getQueriesData<ListTodosResponse>({
        queryKey: ["listTodos"],
      });
      for (const [qk, data] of listQueries) {
        if (data?.todos.some((t) => t.id === itemId)) {
          return { key: `list:${qk[1]}:${qk[2]}`, queryKey: qk };
        }
      }

      return null;
    },
    [queryClient]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const container = findContainerForItem(active.id as string);
    if (!container) return;

    const data = queryClient.getQueryData<CacheData>(container.queryKey);
    if (!data) return;

    const oldIndex = data.todos.findIndex((t) => t.id === active.id);
    const newIndex = data.todos.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const reordered = arrayMove(data.todos, oldIndex, newIndex);
      reorderTodos.mutate({
        key: container.key,
        todoIds: reordered.map((t) => t.id),
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
}
