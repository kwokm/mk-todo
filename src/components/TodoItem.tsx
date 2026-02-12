"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import type { Todo } from "@/lib/types";
import { Check, GripVertical, X } from "lucide-react";

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: { text?: string; completed?: boolean }) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: Record<string, unknown>;
}

export function TodoItem({ todo, onUpdate, onDelete, dragHandleProps }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function startEdit() {
    setEditText(todo.text);
    setEditing(true);
  }

  function saveEdit() {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== todo.text) {
      onUpdate(todo.id, { text: trimmed });
    }
    setEditing(false);
  }

  function cancelEdit() {
    setEditText(todo.text);
    setEditing(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      saveEdit();
    }
    if (e.key === "Escape") {
      cancelEdit();
    }
  }

  return (
    <div className="group flex h-8 items-center gap-1 px-1 transition-colors duration-150 hover:bg-[#111]">
      <button
        type="button"
        onClick={() => onUpdate(todo.id, { completed: !todo.completed })}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-sm transition-colors duration-150",
          todo.completed
            ? "text-[#9333ea]"
            : "text-transparent hover:text-white/50 group-hover:text-white/20"
        )}
        aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
      >
        <Check className="size-3" />
      </button>

      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveEdit}
          className="min-w-0 flex-1 bg-transparent px-1 text-sm leading-8 text-white outline-none"
        />
      ) : (
        <span
          onClick={startEdit}
          className={cn(
            "min-w-0 flex-1 cursor-text px-1 text-sm leading-8",
            todo.completed && "text-muted-foreground line-through opacity-50"
          )}
        >
          {renderMarkdown(todo.text)}
        </span>
      )}

      <button
        type="button"
        {...dragHandleProps}
        className="flex size-5 shrink-0 cursor-grab items-center justify-center text-transparent transition-colors duration-150 group-hover:text-white/30"
        aria-label="Drag to reorder"
        tabIndex={-1}
      >
        <GripVertical className="size-3" />
      </button>

      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        className="flex size-5 shrink-0 items-center justify-center rounded-sm text-transparent transition-colors duration-150 hover:text-red-400 group-hover:text-white/30"
        aria-label="Delete todo"
        tabIndex={-1}
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
