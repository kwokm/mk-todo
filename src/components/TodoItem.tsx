"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import type { Todo } from "@/lib/types";
import { Check, GripVertical, X } from "lucide-react";
import { MoveToMenu } from "@/components/MoveToMenu";

interface TodoItemProps {
  todo: Todo;
  source?: string;
  onUpdate: (id: string, updates: { text?: string; completed?: boolean }) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: Record<string, unknown>;
}

export function TodoItem({ todo, source, onUpdate, onDelete, dragHandleProps }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [justCompleted, setJustCompleted] = useState(false);
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

  const isHeader = todo.text.startsWith("# ");
  const displayText = isHeader ? todo.text.slice(2) : todo.text;

  return (
    <div className="group flex h-8 items-center gap-1 overflow-hidden px-1 transition-colors duration-150 hover:bg-[#111]">
      <button
        type="button"
        onClick={() => {
          if (!todo.completed) {
            setJustCompleted(true);
            setTimeout(() => setJustCompleted(false), 300);
          }
          onUpdate(todo.id, { completed: !todo.completed });
        }}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-sm transition-colors duration-150",
          todo.completed
            ? "text-[#9333ea]"
            : "text-white/10 hover:text-white/50 md:text-transparent group-hover:text-white/20"
        )}
        aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
      >
        <Check className={cn("size-3", justCompleted && "animate-pop")} />
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
      ) : isHeader ? (
        <span
          onClick={startEdit}
          className="min-w-0 flex-1 cursor-text px-1 leading-8"
        >
          <span className="inline-block rounded bg-[#2a2a2a] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
            {displayText}
          </span>
        </span>
      ) : (
        <span
          onClick={startEdit}
          className={cn(
            "min-w-0 flex-1 cursor-text truncate px-1 text-sm leading-8",
            "transition-all duration-200",
            todo.completed && "text-muted-foreground line-through opacity-50"
          )}
        >
          {renderMarkdown(todo.text)}
        </span>
      )}

      <button
        type="button"
        {...dragHandleProps}
        className="flex size-5 shrink-0 cursor-grab items-center justify-center text-white/10 transition-colors duration-150 active:cursor-grabbing focus-visible:text-white/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9333ea]/50 md:text-transparent group-hover:text-white/30"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-3" />
      </button>

      {source && <MoveToMenu todoId={todo.id} source={source} />}

      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        className="flex size-5 shrink-0 items-center justify-center rounded-sm text-white/10 transition-colors duration-150 hover:text-red-400 md:text-transparent group-hover:text-white/30"
        aria-label="Delete todo"
        tabIndex={-1}
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
