"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import type { Todo } from "@/lib/types";
import { getDayLabel, getDateLabel, isToday, cn } from "@/lib/utils";
import { SortableTodoItem } from "@/components/SortableTodoItem";

interface DayColumnProps {
  date: Date;
  todos: Todo[];
  onCreateTodo: (text: string) => void;
  onUpdateTodo: (id: string, updates: { text?: string; completed?: boolean }) => void;
  onDeleteTodo: (id: string) => void;
  onReorder: (todoIds: string[]) => void;
}

const MIN_EMPTY_LINES = 20;

export function DayColumn({
  date,
  todos,
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
  onReorder,
}: DayColumnProps) {
  const today = isToday(date);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (activeLineIndex !== null) {
      inputRef.current?.focus();
    }
  }, [activeLineIndex]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(todos, oldIndex, newIndex);
    onReorder(reordered.map((t) => t.id));
  }

  function handleLineClick(lineIndex: number) {
    setActiveLineIndex(lineIndex);
    setInputText("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && inputText.trim()) {
      onCreateTodo(inputText.trim());
      setInputText("");
    } else if (e.key === "Enter" && !inputText.trim()) {
      setActiveLineIndex(null);
    } else if (e.key === "Escape") {
      setActiveLineIndex(null);
      setInputText("");
    }
  }

  function handleBlur() {
    if (inputText.trim()) {
      onCreateTodo(inputText.trim());
    }
    setActiveLineIndex(null);
    setInputText("");
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="shrink-0 px-5 pt-4 pb-3">
        <p className="text-[10px] uppercase leading-tight tracking-wider text-muted-foreground">
          {getDateLabel(date)}
        </p>
        <p
          className={cn(
            "font-heading text-2xl font-bold uppercase leading-tight",
            today ? "text-[#9333ea]" : "text-white"
          )}
        >
          {getDayLabel(date)}
        </p>
      </div>

      <div className="notebook-lines flex-1 overflow-y-auto scrollbar-none">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={todos.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {todos.map((todo) => (
              <div key={todo.id}>
                <SortableTodoItem
                  todo={todo}
                  onUpdate={onUpdateTodo}
                  onDelete={onDeleteTodo}
                />
              </div>
            ))}
          </SortableContext>
        </DndContext>

        {Array.from({ length: MIN_EMPTY_LINES }).map((_, i) => {
          const lineIndex = todos.length + i;
          const isActive = activeLineIndex === lineIndex;

          return (
            <div
              key={`empty-${i}`}
              className="h-8 px-1"
              onClick={() => handleLineClick(lineIndex)}
            >
              {isActive ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  className="h-full w-full bg-transparent px-1 text-sm text-white outline-none"
                  autoFocus
                />
              ) : (
                <div className="h-full w-full cursor-text" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
