"use client";

import { ListColumn } from "@/components/ListColumn";
import { useLists } from "@/hooks/useTabs";
import {
  useListTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useReorderTodos,
} from "@/hooks/useTodos";
import type { TodoList } from "@/lib/types";

function ListColumnContainer({ list }: { list: TodoList }) {
  const { data, isLoading, isError } = useListTodos(list.tabId, list.id);
  const todos = data?.todos ?? [];
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const reorderTodos = useReorderTodos();

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
      onCreateTodo={(text) =>
        createTodo.mutate({
          text,
          source: { type: "list", tabId: list.tabId, listId: list.id },
        })
      }
      onUpdateTodo={(id, updates) => updateTodo.mutate({ id, ...updates })}
      onDeleteTodo={(id) =>
        deleteTodo.mutate({ id, source: `list:${list.tabId}:${list.id}` })
      }
      onReorder={(todoIds) =>
        reorderTodos.mutate({
          todoIds,
          key: `list:${list.tabId}:${list.id}`,
        })
      }
    />
  );
}

interface ListViewProps {
  activeTabId: string;
}

export function ListView({ activeTabId }: ListViewProps) {
  const { data: lists = [], isLoading, isError } = useLists(activeTabId);

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

  if (lists.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No lists yet
      </div>
    );
  }

  return (
    <>
      {/* Mobile: stacked vertically */}
      <div className="flex h-full flex-col gap-4 overflow-y-auto px-2 md:hidden">
        {lists.map((list) => (
          <div key={list.id} className="min-h-[200px]">
            <ListColumnContainer list={list} />
          </div>
        ))}
      </div>

      {/* Tablet+Desktop: horizontal */}
      <div className="hidden h-full gap-4 overflow-x-auto px-2 md:flex">
        {lists.map((list) => (
          <ListColumnContainer key={list.id} list={list} />
        ))}
      </div>
    </>
  );
}
