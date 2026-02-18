"use client";

import { createContext, useContext, useCallback, useState, type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove } from "@dnd-kit/sortable";
import type { Todo } from "@/lib/types";
import { useMoveTodo, useReorderTodo, sourceToQueryKey } from "@/hooks/useTodos";
import { useQueryClient } from "@tanstack/react-query";
import type { DayTodosResponse, ListTodosResponse } from "@/lib/types";
import { TodoItem } from "./TodoItem";

type DragState = {
  activeId: string | null;
  activeTodo: Todo | null;
  activeSource: string | null;
  overSource: string | null;
};

type DndContextValue = {
  dragState: DragState;
};

const DndContextState = createContext<DndContextValue | null>(null);

export function useDndState() {
  const context = useContext(DndContextState);
  if (!context) {
    throw new Error("useDndState must be used within DndProvider");
  }
  return context;
}

// Track registered containers and their todos
type ContainerRegistry = Map<string, { todos: Todo[]; onReorder: (ids: string[]) => void }>;

const ContainerRegistryContext = createContext<{
  register: (containerId: string, todos: Todo[], onReorder: (ids: string[]) => void) => void;
  unregister: (containerId: string) => void;
  getContainer: (containerId: string) => { todos: Todo[]; onReorder: (ids: string[]) => void } | undefined;
  getAllContainers: () => ContainerRegistry;
} | null>(null);

export function useContainerRegistry() {
  const context = useContext(ContainerRegistryContext);
  if (!context) {
    throw new Error("useContainerRegistry must be used within DndProvider");
  }
  return context;
}

// Custom collision detection that prefers the closest droppable
const customCollisionDetection: CollisionDetection = (args) => {
  // First try pointer within - most accurate when pointer is inside a droppable
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  // Fall back to rect intersection
  const rectCollisions = rectIntersection(args);
  if (rectCollisions.length > 0) {
    return rectCollisions;
  }

  // Finally fall back to closest center
  return closestCenter(args);
};

interface DndProviderProps {
  children: ReactNode;
}

export function DndProvider({ children }: DndProviderProps) {
  const queryClient = useQueryClient();
  const moveTodo = useMoveTodo();
  const reorderTodo = useReorderTodo();

  const [dragState, setDragState] = useState<DragState>({
    activeId: null,
    activeTodo: null,
    activeSource: null,
    overSource: null,
  });

  const [containers] = useState<ContainerRegistry>(() => new Map());

  const register = useCallback((containerId: string, todos: Todo[], onReorder: (ids: string[]) => void) => {
    containers.set(containerId, { todos, onReorder });
  }, [containers]);

  const unregister = useCallback((containerId: string) => {
    containers.delete(containerId);
  }, [containers]);

  const getContainer = useCallback((containerId: string) => {
    return containers.get(containerId);
  }, [containers]);

  const getAllContainers = useCallback(() => {
    return containers;
  }, [containers]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const findContainerForTodo = useCallback((todoId: string): string | null => {
    for (const [containerId, { todos }] of containers) {
      if (todos.some((t) => t.id === todoId)) {
        return containerId;
      }
    }
    return null;
  }, [containers]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const todoId = active.id as string;
    const sourceContainer = findContainerForTodo(todoId);

    if (!sourceContainer) return;

    const containerData = containers.get(sourceContainer);
    const todo = containerData?.todos.find((t) => t.id === todoId);

    setDragState({
      activeId: todoId,
      activeTodo: todo || null,
      activeSource: sourceContainer,
      overSource: sourceContainer,
    });
  }, [findContainerForTodo, containers]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;

    if (!over) {
      setDragState((prev) => ({ ...prev, overSource: null }));
      return;
    }

    // Check if we're over a todo item
    const overId = over.id as string;
    let overContainer = findContainerForTodo(overId);

    // If not over a todo, check if over is a container itself (droppable area)
    if (!overContainer && containers.has(overId)) {
      overContainer = overId;
    }

    if (overContainer) {
      setDragState((prev) => ({ ...prev, overSource: overContainer }));
    }
  }, [findContainerForTodo, containers]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    const fromSource = dragState.activeSource;
    const todoId = active.id as string;

    // Reset drag state
    setDragState({
      activeId: null,
      activeTodo: null,
      activeSource: null,
      overSource: null,
    });

    if (!over || !fromSource) return;

    const overId = over.id as string;

    // Find which container the "over" element belongs to
    let toSource = findContainerForTodo(overId);

    // If not found, check if over is a container itself (empty container drop)
    if (!toSource && containers.has(overId)) {
      toSource = overId;
    }

    if (!toSource) return;

    const fromContainer = containers.get(fromSource);
    const toContainer = containers.get(toSource);

    if (!fromContainer || !toContainer) return;

    if (fromSource === toSource) {
      // Same container - reorder
      if (todoId === overId) return;

      const oldIndex = fromContainer.todos.findIndex((t) => t.id === todoId);
      const newIndex = fromContainer.todos.findIndex((t) => t.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(fromContainer.todos, oldIndex, newIndex);
      fromContainer.onReorder(reordered.map((t) => t.id));
    } else {
      // Different container - move
      const todo = fromContainer.todos.find((t) => t.id === todoId);
      if (!todo) return;

      // Find the position in the destination
      let insertIndex = toContainer.todos.length;
      if (overId !== toSource) {
        const overIndex = toContainer.todos.findIndex((t) => t.id === overId);
        if (overIndex !== -1) {
          insertIndex = overIndex;
        }
      }

      // Optimistically update the caches for smoother UX
      const fromQueryKey = sourceToQueryKey(fromSource);
      const toQueryKey = sourceToQueryKey(toSource);

      // Update from cache
      const fromSnapshot = queryClient.getQueryData<DayTodosResponse | ListTodosResponse>(fromQueryKey);
      if (fromSnapshot) {
        queryClient.setQueryData(fromQueryKey, {
          ...fromSnapshot,
          todos: fromSnapshot.todos.filter((t) => t.id !== todoId),
        });
      }

      // Update to cache
      const toSnapshot = queryClient.getQueryData<DayTodosResponse | ListTodosResponse>(toQueryKey);
      if (toSnapshot) {
        const newTodos = [...toSnapshot.todos];
        newTodos.splice(insertIndex, 0, todo);
        queryClient.setQueryData(toQueryKey, {
          ...toSnapshot,
          todos: newTodos,
        });
      }

      // Trigger the move mutation
      moveTodo.mutate({ todoId, fromSource, toSource });

      // Also reorder to position correctly in destination
      if (toSnapshot && insertIndex !== toSnapshot.todos.length) {
        const newTodoIds = [...toSnapshot.todos.map(t => t.id)];
        newTodoIds.splice(insertIndex, 0, todoId);
        reorderTodo.mutate({ source: toSource, todoIds: newTodoIds });
      }
    }
  }, [dragState.activeSource, findContainerForTodo, containers, moveTodo, reorderTodo, queryClient]);

  const handleDragCancel = useCallback(() => {
    setDragState({
      activeId: null,
      activeTodo: null,
      activeSource: null,
      overSource: null,
    });
  }, []);

  return (
    <ContainerRegistryContext.Provider value={{ register, unregister, getContainer, getAllContainers }}>
      <DndContextState.Provider value={{ dragState }}>
        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          modifiers={[restrictToVerticalAxis]}
        >
          {children}
          <DragOverlay dropAnimation={null}>
            {dragState.activeTodo ? (
              <div className="rounded-sm bg-[#1a1a1a] opacity-95 shadow-lg shadow-black/50 ring-1 ring-[#9333ea]/40">
                <TodoItem
                  todo={dragState.activeTodo}
                  source={dragState.activeSource || ""}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                  isDragOverlay
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </DndContextState.Provider>
    </ContainerRegistryContext.Provider>
  );
}
