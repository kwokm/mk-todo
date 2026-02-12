"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Tab, TodoList } from "@/lib/types";

export function useTabs() {
  return useQuery<Tab[]>({
    queryKey: ["tabs"],
    queryFn: async () => {
      const res = await fetch("/api/tabs");
      if (!res.ok) throw new Error("Failed to fetch tabs");
      return res.json();
    },
  });
}

export function useCreateTab() {
  const queryClient = useQueryClient();

  return useMutation<Tab, Error, { name: string }>({
    mutationFn: async ({ name }) => {
      const res = await fetch("/api/tabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create tab");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tabs"] });
    },
    onError: () => {
      toast.error("Failed to create tab");
    },
  });
}

export function useUpdateTab() {
  const queryClient = useQueryClient();

  return useMutation<Tab, Error, { tabId: string; name: string }>({
    mutationFn: async ({ tabId, name }) => {
      const res = await fetch(`/api/tabs/${tabId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to update tab");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tabs"] });
    },
    onError: () => {
      toast.error("Failed to update tab");
    },
  });
}

export function useDeleteTab() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, { tabId: string }>({
    mutationFn: async ({ tabId }) => {
      const res = await fetch(`/api/tabs/${tabId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete tab");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tabs"] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["listTodos"] });
    },
    onError: () => {
      toast.error("Failed to delete tab");
    },
  });
}

export function useLists(tabId: string) {
  return useQuery<TodoList[]>({
    queryKey: ["lists", tabId],
    queryFn: async () => {
      const res = await fetch(`/api/tabs/${tabId}/lists`);
      if (!res.ok) throw new Error("Failed to fetch lists");
      return res.json();
    },
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation<TodoList, Error, { tabId: string; name: string }>({
    mutationFn: async ({ tabId, name }) => {
      const res = await fetch(`/api/tabs/${tabId}/lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create list");
      return res.json();
    },
    onSuccess: (_data, { tabId }) => {
      queryClient.invalidateQueries({ queryKey: ["lists", tabId] });
    },
    onError: () => {
      toast.error("Failed to create list");
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation<
    TodoList,
    Error,
    { tabId: string; listId: string; name: string }
  >({
    mutationFn: async ({ tabId, listId, name }) => {
      const res = await fetch(`/api/tabs/${tabId}/lists/${listId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to update list");
      return res.json();
    },
    onSuccess: (_data, { tabId }) => {
      queryClient.invalidateQueries({ queryKey: ["lists", tabId] });
    },
    onError: () => {
      toast.error("Failed to update list");
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean },
    Error,
    { tabId: string; listId: string }
  >({
    mutationFn: async ({ tabId, listId }) => {
      const res = await fetch(`/api/tabs/${tabId}/lists/${listId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete list");
      return res.json();
    },
    onSuccess: (_data, { tabId }) => {
      queryClient.invalidateQueries({ queryKey: ["lists", tabId] });
      queryClient.invalidateQueries({ queryKey: ["listTodos"] });
    },
    onError: () => {
      toast.error("Failed to delete list");
    },
  });
}

export function useReorderLists() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean },
    Error,
    { tabId: string; listIds: string[] }
  >({
    mutationFn: async ({ tabId, listIds }) => {
      const res = await fetch(`/api/tabs/${tabId}/lists/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder lists");
      return res.json();
    },
    onMutate: async ({ tabId, listIds }) => {
      await queryClient.cancelQueries({ queryKey: ["lists", tabId] });
      const previous = queryClient.getQueryData<TodoList[]>(["lists", tabId]);

      queryClient.setQueryData<TodoList[]>(["lists", tabId], (old) => {
        if (!old) return old;
        const map = new Map(old.map((l) => [l.id, l]));
        return listIds
          .map((id, i) => {
            const list = map.get(id);
            return list ? { ...list, sortOrder: i } : undefined;
          })
          .filter((l): l is TodoList => !!l);
      });

      return { previous, tabId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous && context?.tabId) {
        queryClient.setQueryData(["lists", context.tabId], context.previous);
      }
      toast.error("Failed to reorder lists");
    },
    onSettled: (_data, _err, { tabId }) => {
      queryClient.invalidateQueries({ queryKey: ["lists", tabId] });
    },
  });
}
