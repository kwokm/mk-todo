"use client";

import { useState, useRef, useEffect, type ReactNode, type KeyboardEvent } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import type { Todo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SortableTodoItem } from "@/components/SortableTodoItem";

interface NotebookColumnProps {
  header: ReactNode;
  todos: Todo[];
  containerId: string;
  emptyLines?: number;
  notebookClassName?: string;
  onCreateTodo: (text: string) => void;
  onUpdateTodo: (id: string, updates: { text?: string; completed?: boolean }) => void;
  onDeleteTodo: (id: string) => void;
  onReorderTodos?: (todoIds: string[]) => void;
}

const DEFAULT_MIN_LINES = 10;

export function NotebookColumn({
  header,
  todos,
  containerId,
  emptyLines: emptyLinesProp,
  notebookClassName,
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
  onReorderTodos,
}: NotebookColumnProps) {
  const emptyLines = emptyLinesProp ?? Math.max(DEFAULT_MIN_LINES - todos.length, 1);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (activeLineIndex !== null) {
      inputRef.current?.focus();
    }
  }, [activeLineIndex]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorderTodos) return;

    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(todos, oldIndex, newIndex);
    onReorderTodos(reordered.map((t) => t.id));
  }

  function handleLineClick(lineIndex: number) {
    setActiveLineIndex(lineIndex);
    setInputText("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && inputText.trim()) {
      onCreateTodo(inputText.trim());
      setInputText("");
      setActiveLineIndex((prev) => (prev !== null ? prev + 1 : null));
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

  const todoIds = todos.map((t) => t.id);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {header}

      <div
        className={cn(
          "notebook-lines transition-colors duration-200",
          notebookClassName,
        )}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext items={todoIds} strategy={verticalListSortingStrategy}>
            {todos.map((todo) => (
              <SortableTodoItem
                key={todo.id}
                todo={todo}
                source={containerId}
                onUpdate={onUpdateTodo}
                onDelete={onDeleteTodo}
              />
            ))}
          </SortableContext>
        </DndContext>

        {Array.from({ length: emptyLines }).map((_, i) => {
          const lineIndex = todos.length + i;
          const isActive = activeLineIndex === lineIndex;

          return (
            <div
              key={`empty-${i}`}
              className={cn(
                "h-8 px-1 transition-colors duration-150",
                isActive ? "border-l-2 border-[#9333ea] bg-white/[0.02]" : "empty-line"
              )}
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
                  className="h-full w-full bg-transparent px-1 text-[15px] text-white/90 outline-none"
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
