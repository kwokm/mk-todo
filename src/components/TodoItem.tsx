"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import type { Todo } from "@/lib/types";
import { Check, X, Undo2 } from "lucide-react";
import { MoveToMenu } from "@/components/MoveToMenu";

interface TodoItemProps {
  todo: Todo;
  source?: string;
  onUpdate: (id: string, updates: { text?: string; completed?: boolean }) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, source, onUpdate, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [justCompleted, setJustCompleted] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  // Dismiss overlay on outside tap (mobile)
  useEffect(() => {
    if (!showOverlay) return;
    function handlePointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowOverlay(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [showOverlay]);

  // Auto-dismiss delete confirmation
  useEffect(() => {
    if (!confirmingDelete) return;
    const timer = setTimeout(() => setConfirmingDelete(false), 2500);
    return () => clearTimeout(timer);
  }, [confirmingDelete]);

  const checkTruncation = useCallback(() => {
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }
  }, []);

  useEffect(() => {
    checkTruncation();
  }, [todo.text, checkTruncation]);

  useEffect(() => {
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [checkTruncation]);

  function startEdit() {
    setShowOverlay(false);
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

  const actions = (
    <>
      {source && <MoveToMenu todoId={todo.id} source={source} />}
      {confirmingDelete ? (
        <div className="flex shrink-0 items-center overflow-hidden rounded-md ring-1 ring-white/10">
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="flex size-5 items-center justify-center bg-white/5 text-white/50 transition-colors duration-150 hover:bg-white/10 hover:text-white"
            aria-label="Cancel delete"
          >
            <Undo2 className="size-2.5" />
          </button>
          <div className="h-3 w-px bg-white/10" />
          <button
            type="button"
            onClick={() => onDelete(todo.id)}
            className="flex size-5 items-center justify-center bg-red-500/15 text-red-400 transition-colors duration-150 hover:bg-red-500/30 hover:text-red-300"
            aria-label="Confirm delete"
          >
            <Check className="size-2.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="flex size-5 shrink-0 items-center justify-center rounded-sm text-white/40 transition-colors duration-150 hover:text-red-400 md:text-transparent md:group-hover:text-white/30"
          aria-label="Delete todo"
          tabIndex={-1}
        >
          <X className="size-3" />
        </button>
      )}
    </>
  );

  return (
    <div
      ref={wrapperRef}
      className="group relative min-w-0"
      onMouseEnter={() => {
        if (isTruncated && !editing) setShowOverlay(true);
      }}
      onMouseLeave={() => setShowOverlay(false)}
    >
      {/* Normal row — always rendered to preserve layout */}
      <div className="flex h-8 items-center gap-1 overflow-hidden px-1 transition-colors duration-150 hover:bg-[#111]">
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
              : "text-white/40 hover:text-white/50 md:text-transparent md:group-hover:text-white/20"
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
            className="min-w-0 flex-1 bg-transparent px-1 text-[15px] leading-8 text-white/90 outline-none"
          />
        ) : isHeader ? (
          <span
            onClick={startEdit}
            className="flex min-w-0 flex-1 cursor-text items-center rounded bg-[#2a2a2a] px-2.5 text-xs font-bold uppercase leading-6 tracking-wider text-white"
          >
            {displayText}
          </span>
        ) : (
          <span
            ref={textRef}
            onClick={() => {
              if (isTruncated && !showOverlay) {
                setShowOverlay(true);
              } else {
                startEdit();
              }
            }}
            className={cn(
              "min-w-0 flex-1 cursor-text overflow-hidden whitespace-nowrap px-1 text-[15px] leading-8 text-white/90",
              "transition-all duration-200",
              isTruncated && "[mask-image:linear-gradient(to_right,black_calc(100%-3rem),transparent)]",
              todo.completed && "text-muted-foreground line-through opacity-50"
            )}
          >
            {renderMarkdown(todo.text)}
          </span>
        )}

        {actions}
      </div>

      {/* Expanded overlay for truncated text */}
      {showOverlay && !editing && (
        <div className="absolute inset-x-0 top-0 z-40 rounded-sm bg-[#111] shadow-lg shadow-black/40 ring-1 ring-white/5">
          <div className="flex items-start gap-1 px-1 py-1">
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
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm transition-colors duration-150",
                todo.completed
                  ? "text-[#9333ea]"
                  : "text-white/20 hover:text-white/50"
              )}
              aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
            >
              <Check className="size-3" />
            </button>

            <span
              onClick={startEdit}
              className={cn(
                "min-w-0 flex-1 cursor-text break-words px-1 py-0.5 text-[15px] leading-7 text-white/90",
                todo.completed && "text-muted-foreground line-through opacity-50"
              )}
            >
              {renderMarkdown(todo.text)}
            </span>

            <div className="mt-0.5 flex shrink-0 items-center gap-1">
              {actions}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
