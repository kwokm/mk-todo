"use client";

import { useState, useRef, useEffect, type ReactNode, type KeyboardEvent } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { Todo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnimatedTodoItem } from "@/components/AnimatedTodoItem";

interface NotebookColumnProps {
  header: ReactNode;
  todos: Todo[];
  containerId: string;
  emptyLines?: number;
  notebookClassName?: string;
  onCreateTodo: (text: string) => void;
  onUpdateTodo: (id: string, updates: { text?: string; completed?: boolean }) => void;
  onDeleteTodo: (id: string) => void;
}

const DEFAULT_EMPTY_LINES = 20;

export function NotebookColumn({
  header,
  todos,
  containerId,
  emptyLines = DEFAULT_EMPTY_LINES,
  notebookClassName,
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
}: NotebookColumnProps) {
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { setNodeRef } = useDroppable({ id: containerId });

  useEffect(() => {
    if (activeLineIndex !== null) {
      inputRef.current?.focus();
    }
  }, [activeLineIndex]);

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

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {header}

      <div
        ref={setNodeRef}
        className={cn(
          "notebook-lines transition-colors duration-200",
          notebookClassName,
        )}
      >
        <SortableContext
          items={todos.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {todos.map((todo) => (
            <AnimatedTodoItem
              key={todo.id}
              todo={todo}
              source={containerId}
              onUpdate={onUpdateTodo}
              onDelete={onDeleteTodo}
            />
          ))}
        </SortableContext>

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
