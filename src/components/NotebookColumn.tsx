"use client";

import { useState, useRef, useEffect, type ReactNode, type KeyboardEvent } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Todo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SortableTodoItem } from "@/components/SortableTodoItem";
import { useContainerRegistry, useDndState } from "@/components/DndProvider";

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

function useMinLines() {
  const [minLines, setMinLines] = useState(20);
  useEffect(() => {
    function update() {
      setMinLines(window.innerWidth >= 768 ? 13 : 20);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return minLines;
}

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
  const minLines = useMinLines();
  const emptyLines = emptyLinesProp ?? Math.max(minLines - todos.length, 1);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { register, unregister } = useContainerRegistry();
  const { dragState } = useDndState();

  // Register this container with the DndProvider
  useEffect(() => {
    if (onReorderTodos) {
      register(containerId, todos, onReorderTodos);
    }
    return () => {
      unregister(containerId);
    };
  }, [containerId, todos, onReorderTodos, register, unregister]);

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

  const todoIds = todos.map((t) => t.id);

  // Set up droppable for the container (for empty area drops)
  const { setNodeRef } = useDroppable({
    id: containerId,
  });

  // Determine if we're receiving a drop from another container
  const isReceivingDrop = dragState.overSource === containerId &&
                          dragState.activeSource !== containerId &&
                          dragState.activeId !== null;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {header}

      <div
        ref={setNodeRef}
        className={cn(
          "notebook-lines transition-colors duration-200",
          notebookClassName,
          isReceivingDrop && "ring-2 ring-inset ring-[#9333ea]/30",
        )}
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
