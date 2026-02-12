"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  });
}
