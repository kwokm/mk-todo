"use client";

import { ListColumn } from "@/components/ListColumn";
import { useLists, useCreateList, useUpdateList, useDeleteList, useReorderLists } from "@/hooks/useTabs";
import {
  useListTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useReorderTodo,
} from "@/hooks/useTodos";
import type { TodoList } from "@/lib/types";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

function ListColumnContainer({
  list,
  emptyLines,
  onUpdateListName,
  onDeleteList,
  onMoveList,
  isFirst,
  isLast,
}: {
  list: TodoList;
  emptyLines?: number;
  onUpdateListName: (name: string) => void;
  onDeleteList: () => void;
  onMoveList: (direction: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { data, isLoading, isError } = useListTodos(list.tabId, list.id);
  const todos = data?.todos ?? [];
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const reorderTodo = useReorderTodo();

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
      onReorderTodos={(todoIds) =>
        reorderTodo.mutate({ source: `list:${list.tabId}:${list.id}`, todoIds })
      }
      onUpdateListName={onUpdateListName}
      onDeleteList={onDeleteList}
      onMoveList={onMoveList}
      isFirst={isFirst}
      isLast={isLast}
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
  const reorderLists = useReorderLists();

  function handleMoveList(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= lists.length) return;
    const reordered = [...lists];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);
    reorderLists.mutate({
      tabId: activeTabId,
      listIds: reordered.map((l) => l.id),
    });
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
    <div key={activeTabId} className="animate-fade-in h-full">
      {/* Mobile: stacked vertically */}
      <div className="flex flex-col gap-4 overflow-y-auto px-2 md:hidden">
        {lists.map((list, index) => (
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
              onMoveList={(dir) => handleMoveList(index, dir)}
              isFirst={index === 0}
              isLast={index === lists.length - 1}
            />
          </div>
        ))}
        <div className="flex justify-center py-2">
          {addListButton}
        </div>
      </div>

      {/* Tablet+Desktop: horizontal */}
      <div className="hidden h-full gap-4 overflow-x-auto scrollbar-fade px-2 md:flex">
        {lists.map((list, index) => (
          <ListColumnContainer
            key={list.id}
            list={list}
            onUpdateListName={(name) =>
              updateList.mutate({ tabId: activeTabId, listId: list.id, name })
            }
            onDeleteList={() =>
              deleteList.mutate({ tabId: activeTabId, listId: list.id })
            }
            onMoveList={(dir) => handleMoveList(index, dir)}
            isFirst={index === 0}
            isLast={index === lists.length - 1}
          />
        ))}
        <div className="flex shrink-0 items-start pt-5">
          {addListButton}
        </div>
      </div>
    </div>
  );
}
