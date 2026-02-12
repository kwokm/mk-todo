"use client";

import { useState } from "react";
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
import { ListColumn } from "@/components/ListColumn";
import { useLists, useCreateList, useUpdateList, useDeleteList } from "@/hooks/useTabs";
import {
  useListTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useReorderTodos,
  useMoveTodo,
} from "@/hooks/useTodos";
import type { TodoList, Todo, ListTodosResponse } from "@/lib/types";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

function ListColumnContainer({
  list,
  emptyLines,
  onUpdateListName,
  onDeleteList,
}: {
  list: TodoList;
  emptyLines?: number;
  onUpdateListName: (name: string) => void;
  onDeleteList: () => void;
}) {
  const { data, isLoading, isError } = useListTodos(list.tabId, list.id);
  const todos = data?.todos ?? [];
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  if (isLoading) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0 px-5 pt-4 pb-3">
          <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
        </div>
        <div className="notebook-lines flex-1 space-y-1 px-2 pt-1">
          {[1, 2].map((i) => (
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
    <ListColumn
      list={list}
      todos={todos}
      containerId={`list:${list.tabId}:${list.id}`}
      emptyLines={emptyLines}
      onCreateTodo={(text) =>
        createTodo.mutate({
          text,
          source: { type: "list", tabId: list.tabId, listId: list.id },
        })
      }
      onUpdateTodo={(id, updates) => updateTodo.mutate({ id, source: `list:${list.tabId}:${list.id}`, ...updates })}
      onDeleteTodo={(id) =>
        deleteTodo.mutate({ id, source: `list:${list.tabId}:${list.id}` })
      }
      onUpdateListName={onUpdateListName}
      onDeleteList={onDeleteList}
    />
  );
}

interface ListViewProps {
  activeTabId: string;
}

export function ListView({ activeTabId }: ListViewProps) {
  const { data: lists = [], isLoading, isError } = useLists(activeTabId);
  const createList = useCreateList();
  const updateList = useUpdateList();
  const deleteList = useDeleteList();
  const queryClient = useQueryClient();
  const reorderTodos = useReorderTodos();
  const moveTodo = useMoveTodo();
  const [activeDragTodo, setActiveDragTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function findContainerForItem(itemId: string): string | null {
    for (const list of lists) {
      const data = queryClient.getQueryData<ListTodosResponse>(["listTodos", list.tabId, list.id]);
      if (data?.todos.some((t) => t.id === itemId)) return `list:${list.tabId}:${list.id}`;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    for (const list of lists) {
      const data = queryClient.getQueryData<ListTodosResponse>(["listTodos", list.tabId, list.id]);
      const todo = data?.todos.find((t) => t.id === active.id);
      if (todo) {
        setActiveDragTodo(todo);
        break;
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragTodo(null);
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainerForItem(active.id as string);
    let overContainer = findContainerForItem(over.id as string);
    if (!overContainer) {
      const overId = over.id as string;
      if (overId.startsWith("list:")) {
        overContainer = overId;
      }
    }

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      // Same container — reorder
      const parts = activeContainer.slice(5).split(":");
      const data = queryClient.getQueryData<ListTodosResponse>(["listTodos", parts[0], parts[1]]);
      if (data) {
        const oldIndex = data.todos.findIndex((t) => t.id === active.id);
        const newIndex = data.todos.findIndex((t) => t.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reordered = arrayMove(data.todos, oldIndex, newIndex);
          reorderTodos.mutate({ key: activeContainer, todoIds: reordered.map((t) => t.id) });
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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-24 animate-pulse rounded bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xs text-red-400/70">Failed to load lists</p>
      </div>
    );
  }

  const addListButton = (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={() => createList.mutate({ tabId: activeTabId, name: "New List" })}
      className="shrink-0 text-muted-foreground hover:text-white"
      aria-label="Add list"
    >
      <Plus className="size-3.5" />
    </Button>
  );

  if (lists.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <p>No lists yet</p>
        {addListButton}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div key={activeTabId} className="animate-fade-in h-full">
        {/* Mobile: stacked vertically */}
        <div className="flex flex-col gap-4 overflow-y-auto px-2 md:hidden">
          {lists.map((list) => (
            <div key={list.id}>
              <ListColumnContainer
                list={list}
                emptyLines={1}
                onUpdateListName={(name) =>
                  updateList.mutate({ tabId: activeTabId, listId: list.id, name })
                }
                onDeleteList={() =>
                  deleteList.mutate({ tabId: activeTabId, listId: list.id })
                }
              />
            </div>
          ))}
          <div className="flex justify-center py-2">
            {addListButton}
          </div>
        </div>

        {/* Tablet+Desktop: horizontal */}
        <div className="hidden h-full gap-4 overflow-x-auto scrollbar-fade px-2 md:flex">
          {lists.map((list) => (
            <ListColumnContainer
              key={list.id}
              list={list}
              onUpdateListName={(name) =>
                updateList.mutate({ tabId: activeTabId, listId: list.id, name })
              }
              onDeleteList={() =>
                deleteList.mutate({ tabId: activeTabId, listId: list.id })
              }
            />
          ))}
          <div className="flex shrink-0 items-start pt-5">
            {addListButton}
          </div>
        </div>
      </div>

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
