"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { addDays, formatDateKey } from "@/lib/utils";
import { DayColumn } from "@/components/DayColumn";
import {
  useDayTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
} from "@/hooks/useTodos";

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
  );
}
