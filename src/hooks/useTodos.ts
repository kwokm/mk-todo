"use client";

import { useQuery, useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import type {
  Todo,
  DayTodosResponse,
  ListTodosResponse,
} from "@/lib/types";

export function useDayTodos(date: string) {
  return useQuery<DayTodosResponse>({
    queryKey: ["dayTodos", date],
    queryFn: async () => {
      const res = await fetch(`/api/todos/day/${date}`);
      if (!res.ok) throw new Error("Failed to fetch day todos");
      return res.json();
    },
  });
}

export function useListTodos(tabId: string, listId: string) {
  return useQuery<ListTodosResponse>({
    queryKey: ["listTodos", tabId, listId],
    queryFn: async () => {
      const res = await fetch(`/api/todos/list/${tabId}/${listId}`);
      if (!res.ok) throw new Error("Failed to fetch list todos");
      return res.json();
    },
  });
}

type CreateTodoArgs = {
  text: string;
  source:
    | { type: "day"; date: string }
    | { type: "list"; tabId: string; listId: string };
};

type CreateTodoContext = {
  queryKey: QueryKey;
  snapshot: DayTodosResponse | ListTodosResponse | undefined;
  tempId: string;
};

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation<Todo, Error, CreateTodoArgs, CreateTodoContext>({
    mutationFn: async ({ text, source }) => {
      const url =
        source.type === "day"
          ? `/api/todos/day/${source.date}`
          : `/api/todos/list/${source.tabId}/${source.listId}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to create todo");
      return res.json();
    },
    onMutate: async ({ text, source }) => {
      const queryKey =
        source.type === "day"
          ? ["dayTodos", source.date]
          : ["listTodos", source.tabId, source.listId];

      await queryClient.cancelQueries({ queryKey });

      const snapshot = queryClient.getQueryData<
        DayTodosResponse | ListTodosResponse
      >(queryKey);

      const tempId = `temp-${Date.now()}`;
      const now = new Date().toISOString();
      const optimisticTodo: Todo = {
        id: tempId,
        text,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      if (snapshot) {
        queryClient.setQueryData(queryKey, {
          ...snapshot,
          todos: [...snapshot.todos, optimisticTodo],
        });
      }

      return { queryKey, snapshot, tempId };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(context.queryKey, context.snapshot);
      }
    },
    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}

type UpdateTodoArgs = {
  id: string;
  source: string;
  text?: string;
  completed?: boolean;
};

type ScopedContext = {
  queryKey: QueryKey;
  snapshot: DayTodosResponse | ListTodosResponse | undefined;
};

function sourceToQueryKey(source: string): QueryKey {
  if (source.startsWith("day:")) {
    return ["dayTodos", source.slice(4)];
  }
  const parts = source.slice(5).split(":");
  return ["listTodos", parts[0], parts[1]];
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation<Todo, Error, UpdateTodoArgs, ScopedContext>({
    mutationFn: async ({ id, source: _source, ...body }) => {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      return res.json();
    },
    onMutate: async ({ id, source, ...updates }) => {
      const queryKey = sourceToQueryKey(source);
      await queryClient.cancelQueries({ queryKey });

      const snapshot = queryClient.getQueryData<
        DayTodosResponse | ListTodosResponse
      >(queryKey);

      if (snapshot) {
        queryClient.setQueryData(queryKey, {
          ...snapshot,
          todos: snapshot.todos.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        });
      }

      return { queryKey, snapshot };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(context.queryKey, context.snapshot);
      }
    },
    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}

type DeleteTodoArgs = {
  id: string;
  source: string;
};

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, DeleteTodoArgs, ScopedContext>({
    mutationFn: async ({ id, source }) => {
      const res = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
      if (!res.ok) throw new Error("Failed to delete todo");
      return res.json();
    },
    onMutate: async ({ id, source }) => {
      const queryKey = sourceToQueryKey(source);
      await queryClient.cancelQueries({ queryKey });

      const snapshot = queryClient.getQueryData<
        DayTodosResponse | ListTodosResponse
      >(queryKey);

      if (snapshot) {
        queryClient.setQueryData(queryKey, {
          ...snapshot,
          todos: snapshot.todos.filter((t) => t.id !== id),
        });
      }

      return { queryKey, snapshot };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(context.queryKey, context.snapshot);
      }
    },
    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}

type ReorderTodosArgs = {
  key: string;
  todoIds: string[];
};

type ReorderContext = {
  queryKey: QueryKey;
  snapshot: DayTodosResponse | ListTodosResponse | undefined;
};

export function useReorderTodos() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, ReorderTodosArgs, ReorderContext>({
    mutationFn: async ({ key, todoIds }) => {
      const res = await fetch("/api/todos/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, todoIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder todos");
      return res.json();
    },
    onMutate: async ({ key, todoIds }) => {
      const isDayKey = key.startsWith("day:");
      const queryKey = isDayKey
        ? ["dayTodos", key.replace("day:", "")]
        : ["listTodos", ...key.replace("list:", "").split(":")];

      await queryClient.cancelQueries({ queryKey });

      const snapshot = queryClient.getQueryData<
        DayTodosResponse | ListTodosResponse
      >(queryKey);

      if (snapshot) {
        const todoMap = new Map(
          snapshot.todos.map((t) => [t.id, t])
        );
        const reordered = todoIds
          .map((id) => todoMap.get(id))
          .filter(Boolean) as Todo[];

        queryClient.setQueryData(queryKey, { ...snapshot, todos: reordered });
      }

      return { queryKey, snapshot };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(context.queryKey, context.snapshot);
      }
    },
    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}
