"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
import { addDays, formatDateKey } from "@/lib/utils";
import { DayColumn } from "@/components/DayColumn";
import {
  useDayTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useReorderTodos,
  useMoveTodo,
} from "@/hooks/useTodos";
import type { Todo, DayTodosResponse } from "@/lib/types";

function DayColumnContainer({ date }: { date: Date }) {
  const dateKey = formatDateKey(date);
  const { data, isLoading, isError } = useDayTodos(dateKey);
  const todos = data?.todos ?? [];
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  if (isLoading) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0 px-5 pt-4 pb-3">
          <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
          <div className="mt-1 h-5 w-24 animate-pulse rounded bg-white/10" />
        </div>
        <div className="notebook-lines flex-1 space-y-1 px-2 pt-1">
          {[1, 2, 3].map((i) => (
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
    <DayColumn
      date={date}
      todos={todos}
      containerId={`day:${dateKey}`}
      onCreateTodo={(text) =>
        createTodo.mutate({ text, source: { type: "day", date: dateKey } })
      }
      onUpdateTodo={(id, updates) => updateTodo.mutate({ id, source: `day:${dateKey}`, ...updates })}
      onDeleteTodo={(id) => deleteTodo.mutate({ id, source: `day:${dateKey}` })}
    />
  );
}

function useVisibleDays() {
  const [count, setCount] = useState(5);
  useEffect(() => {
    function update() {
      if (window.innerWidth < 768) setCount(1);
      else if (window.innerWidth < 1024) setCount(3);
      else setCount(5);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return count;
}

type SlidePhase = "" | "out-left" | "out-right" | "in-left" | "in-right";

interface CalendarViewProps {
  startDate: Date;
}

export function CalendarView({ startDate }: CalendarViewProps) {
  const visibleDays = useVisibleDays();
  const [renderedDate, setRenderedDate] = useState(startDate);
  const [slidePhase, setSlidePhase] = useState<SlidePhase>("");
  const prevDateRef = useRef(startDate);

  const touchStartX = useRef(0);
  const touchDelta = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const queryClient = useQueryClient();
  const reorderTodos = useReorderTodos();
  const moveTodo = useMoveTodo();
  const [activeDragTodo, setActiveDragTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const prevKey = formatDateKey(prevDateRef.current);
    const newKey = formatDateKey(startDate);
    if (prevKey === newKey) return;

    const goingForward = startDate.getTime() > prevDateRef.current.getTime();
    prevDateRef.current = startDate;

    setSlidePhase(goingForward ? "out-left" : "out-right");

    const t1 = setTimeout(() => {
      setRenderedDate(startDate);
      setSlidePhase(goingForward ? "in-right" : "in-left");
    }, 150);

    const t2 = setTimeout(() => {
      setSlidePhase("");
    }, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [startDate]);

  const dates = Array.from({ length: visibleDays }, (_, i) =>
    addDays(renderedDate, i)
  );

  const dateKeys = dates.map(formatDateKey);

  function findContainerForItem(itemId: string): string | null {
    for (const dk of dateKeys) {
      const data = queryClient.getQueryData<DayTodosResponse>(["dayTodos", dk]);
      if (data?.todos.some((t) => t.id === itemId)) return `day:${dk}`;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    for (const dk of dateKeys) {
      const data = queryClient.getQueryData<DayTodosResponse>(["dayTodos", dk]);
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
    // over could be a todo ID or a container ID (droppable)
    let overContainer = findContainerForItem(over.id as string);
    if (!overContainer) {
      // over.id is a container ID directly (dropped on empty area)
      const overId = over.id as string;
      if (overId.startsWith("day:")) {
        overContainer = overId;
      }
    }

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      // Same container — reorder
      const dk = activeContainer.slice(4); // remove "day:"
      const data = queryClient.getQueryData<DayTodosResponse>(["dayTodos", dk]);
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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDelta.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const delta = e.touches[0].clientX - touchStartX.current;
    touchDelta.current = delta;
    if (Math.abs(delta) > 10) {
      setSwipeOffset(delta * 0.3);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setSwipeOffset(0);
    if (Math.abs(touchDelta.current) > 60) {
      const days = touchDelta.current > 0 ? -visibleDays : visibleDays;
      window.dispatchEvent(
        new CustomEvent("calendar-swipe", { detail: { days } })
      );
    }
  }, [visibleDays]);

  function getSlideStyle(): React.CSSProperties {
    if (swipeOffset) {
      return { transform: `translateX(${swipeOffset}px)`, transition: "none" };
    }
    switch (slidePhase) {
      case "out-left":
        return {
          transform: "translateX(-30px)",
          opacity: 0,
          transition: "transform 150ms ease-in, opacity 150ms ease-in",
        };
      case "out-right":
        return {
          transform: "translateX(30px)",
          opacity: 0,
          transition: "transform 150ms ease-in, opacity 150ms ease-in",
        };
      case "in-left":
      case "in-right":
        return {
          transform: "translateX(0)",
          opacity: 1,
          transition:
            "transform 250ms cubic-bezier(0.16, 1, 0.3, 1), opacity 250ms cubic-bezier(0.16, 1, 0.3, 1)",
        };
      default:
        return {};
    }
  }

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="h-full overflow-hidden px-2"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex h-full gap-4" style={getSlideStyle()}>
          {dates.map((date) => (
            <DayColumnContainer key={formatDateKey(date)} date={date} />
          ))}
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
