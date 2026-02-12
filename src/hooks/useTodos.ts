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
  text?: string;
  completed?: boolean;
};

type TodoSnapshots = {
  daySnapshots: [QueryKey, DayTodosResponse | undefined][];
  listSnapshots: [QueryKey, ListTodosResponse | undefined][];
};

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation<Todo, Error, UpdateTodoArgs, TodoSnapshots>({
    mutationFn: async ({ id, ...body }) => {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      return res.json();
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ["dayTodos"] });
      await queryClient.cancelQueries({ queryKey: ["listTodos"] });

      const daySnapshots = queryClient.getQueriesData<DayTodosResponse>({
        queryKey: ["dayTodos"],
      });
      const listSnapshots = queryClient.getQueriesData<ListTodosResponse>({
        queryKey: ["listTodos"],
      });

      const updateTodoInList = (todos: Todo[]) =>
        todos.map((t) => (t.id === id ? { ...t, ...updates } : t));

      queryClient.setQueriesData<DayTodosResponse>(
        { queryKey: ["dayTodos"] },
        (old) =>
          old ? { ...old, todos: updateTodoInList(old.todos) } : undefined
      );
      queryClient.setQueriesData<ListTodosResponse>(
        { queryKey: ["listTodos"] },
        (old) =>
          old ? { ...old, todos: updateTodoInList(old.todos) } : undefined
      );

      return { daySnapshots, listSnapshots };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        for (const [key, data] of context.daySnapshots) {
          queryClient.setQueryData(key, data);
        }
        for (const [key, data] of context.listSnapshots) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dayTodos"] });
      queryClient.invalidateQueries({ queryKey: ["listTodos"] });
    },
  });
}

type DeleteTodoArgs = {
  id: string;
  source: string;
};

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, DeleteTodoArgs, TodoSnapshots>({
    mutationFn: async ({ id, source }) => {
      const res = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
      if (!res.ok) throw new Error("Failed to delete todo");
      return res.json();
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["dayTodos"] });
      await queryClient.cancelQueries({ queryKey: ["listTodos"] });

      const daySnapshots = queryClient.getQueriesData<DayTodosResponse>({
        queryKey: ["dayTodos"],
      });
      const listSnapshots = queryClient.getQueriesData<ListTodosResponse>({
        queryKey: ["listTodos"],
      });

      queryClient.setQueriesData<DayTodosResponse>(
        { queryKey: ["dayTodos"] },
        (old) =>
          old
            ? { ...old, todos: old.todos.filter((t) => t.id !== id) }
            : undefined
      );
      queryClient.setQueriesData<ListTodosResponse>(
        { queryKey: ["listTodos"] },
        (old) =>
          old
            ? { ...old, todos: old.todos.filter((t) => t.id !== id) }
            : undefined
      );

      return { daySnapshots, listSnapshots };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        for (const [key, data] of context.daySnapshots) {
          queryClient.setQueryData(key, data);
        }
        for (const [key, data] of context.listSnapshots) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dayTodos"] });
      queryClient.invalidateQueries({ queryKey: ["listTodos"] });
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
