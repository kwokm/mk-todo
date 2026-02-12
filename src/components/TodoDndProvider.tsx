"use client";

import { useState, type ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useQueryClient } from "@tanstack/react-query";
import { useReorderTodos, useMoveTodo } from "@/hooks/useTodos";
import type { Todo, DayTodosResponse, ListTodosResponse } from "@/lib/types";

interface TodoDndProviderProps {
  children: ReactNode;
}

export function TodoDndProvider({ children }: TodoDndProviderProps) {
  const queryClient = useQueryClient();
  const reorderTodos = useReorderTodos();
  const moveTodo = useMoveTodo();
  const [activeDragTodo, setActiveDragTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function findContainerForItem(itemId: string): string | null {
    // Search all cached day queries
    const dayQueries = queryClient.getQueriesData<DayTodosResponse>({
      queryKey: ["dayTodos"],
    });
    for (const [key, data] of dayQueries) {
      if (data?.todos.some((t) => t.id === itemId)) {
        return `day:${key[1]}`;
      }
    }

    // Search all cached list queries
    const listQueries = queryClient.getQueriesData<ListTodosResponse>({
      queryKey: ["listTodos"],
    });
    for (const [key, data] of listQueries) {
      if (data?.todos.some((t) => t.id === itemId)) {
        return `list:${key[1]}:${key[2]}`;
      }
    }

    return null;
  }

  function findTodoById(itemId: string): Todo | null {
    const dayQueries = queryClient.getQueriesData<DayTodosResponse>({
      queryKey: ["dayTodos"],
    });
    for (const [, data] of dayQueries) {
      const todo = data?.todos.find((t) => t.id === itemId);
      if (todo) return todo;
    }

    const listQueries = queryClient.getQueriesData<ListTodosResponse>({
      queryKey: ["listTodos"],
    });
    for (const [, data] of listQueries) {
      const todo = data?.todos.find((t) => t.id === itemId);
      if (todo) return todo;
    }

    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const todo = findTodoById(event.active.id as string);
    setActiveDragTodo(todo);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragTodo(null);
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainerForItem(active.id as string);

    // over could be a todo ID (dropped on an item) or a container ID (dropped on empty area)
    let overContainer = findContainerForItem(over.id as string);
    if (!overContainer) {
      const overId = over.id as string;
      if (overId.startsWith("day:") || overId.startsWith("list:")) {
        overContainer = overId;
      }
    }

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      // Same container — reorder
      const queryKey = activeContainer.startsWith("day:")
        ? ["dayTodos", activeContainer.slice(4)]
        : ["listTodos", ...activeContainer.slice(5).split(":")];

      const data = queryClient.getQueryData<DayTodosResponse | ListTodosResponse>(queryKey);
      if (data) {
        const oldIndex = data.todos.findIndex((t) => t.id === active.id);
        const newIndex = data.todos.findIndex((t) => t.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reordered = arrayMove(data.todos, oldIndex, newIndex);
          reorderTodos.mutate({
            key: activeContainer,
            todoIds: reordered.map((t) => t.id),
          });
        }
      }
    } else {
      // Different container — move
      moveTodo.mutate({
        todoId: active.id as string,
        fromSource: activeContainer,
        toSource: overContainer,
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}

      <DragOverlay dropAnimation={null}>
        {activeDragTodo ? (
          <div className="w-64 rounded bg-[#1a1a1a] px-1 shadow-xl shadow-black/60 ring-1 ring-[#9333ea]/30">
            <div className="flex h-8 items-center gap-1 text-sm text-white">
              <span className="truncate px-2">{activeDragTodo.text}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
