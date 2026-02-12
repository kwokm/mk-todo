"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import type { TodoList, Todo } from "@/lib/types";
import { NotebookColumn } from "@/components/NotebookColumn";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X } from "lucide-react";
import {
  AlertDialogRoot,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface ListColumnProps {
  list: TodoList;
  todos: Todo[];
  containerId: string;
  emptyLines?: number;
  onCreateTodo: (text: string) => void;
  onUpdateTodo: (id: string, updates: { text?: string; completed?: boolean }) => void;
  onDeleteTodo: (id: string) => void;
  onReorderTodos?: (todoIds: string[]) => void;
  onUpdateListName?: (name: string) => void;
  onDeleteList?: () => void;
  onMoveList?: (direction: -1 | 1) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function ListColumn({
  list,
  todos,
  containerId,
  emptyLines,
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
  onReorderTodos,
  onUpdateListName,
  onDeleteList,
  onMoveList,
  isFirst,
  isLast,
}: ListColumnProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameText, setNameText] = useState(list.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [editingName]);

  function saveName() {
    const trimmed = nameText.trim();
    if (trimmed && trimmed !== list.name && onUpdateListName) {
      onUpdateListName(trimmed);
    }
    setEditingName(false);
  }

  function handleNameKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") saveName();
    if (e.key === "Escape") {
      setNameText(list.name);
      setEditingName(false);
    }
  }

  const header = (
    <div className="group/list flex shrink-0 items-center gap-2 px-5 pt-4 pb-3">
      <div className="min-w-0 flex-1">
        {editingName ? (
          <input
            ref={nameInputRef}
            type="text"
            value={nameText}
            onChange={(e) => setNameText(e.target.value)}
            onKeyDown={handleNameKeyDown}
            onBlur={saveName}
            className="w-full bg-transparent font-heading text-lg font-bold uppercase text-white outline-none"
          />
        ) : (
          <p
            onClick={() => {
              setNameText(list.name);
              setEditingName(true);
            }}
            className="cursor-text truncate font-heading text-lg font-bold uppercase text-white"
          >
            {list.name}
          </p>
        )}
      </div>
      {onMoveList && (
        <div className="flex shrink-0 items-center md:text-transparent md:group-hover/list:text-white/30">
          {/* Mobile: up/down */}
          <button
            type="button"
            onClick={() => onMoveList(-1)}
            disabled={isFirst}
            className="flex size-5 items-center justify-center rounded-sm text-white/40 transition-colors duration-150 enabled:hover:text-white disabled:opacity-20 md:hidden"
            aria-label={`Move ${list.name} up`}
            tabIndex={-1}
          >
            <ChevronUp className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => onMoveList(1)}
            disabled={isLast}
            className="flex size-5 items-center justify-center rounded-sm text-white/40 transition-colors duration-150 enabled:hover:text-white disabled:opacity-20 md:hidden"
            aria-label={`Move ${list.name} down`}
            tabIndex={-1}
          >
            <ChevronDown className="size-3" />
          </button>
          {/* Desktop: left/right */}
          <button
            type="button"
            onClick={() => onMoveList(-1)}
            disabled={isFirst}
            className="hidden size-5 items-center justify-center rounded-sm transition-colors duration-150 enabled:hover:text-white disabled:opacity-20 md:flex"
            aria-label={`Move ${list.name} left`}
            tabIndex={-1}
          >
            <ChevronLeft className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => onMoveList(1)}
            disabled={isLast}
            className="hidden size-5 items-center justify-center rounded-sm transition-colors duration-150 enabled:hover:text-white disabled:opacity-20 md:flex"
            aria-label={`Move ${list.name} right`}
            tabIndex={-1}
          >
            <ChevronRight className="size-3" />
          </button>
        </div>
      )}
      {onDeleteList && (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="flex size-5 shrink-0 items-center justify-center rounded-sm text-white/40 transition-colors duration-150 hover:text-red-400 md:text-transparent md:group-hover/list:text-white/30"
          aria-label={`Delete ${list.name} list`}
          tabIndex={-1}
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );

  return (
    <>
      <NotebookColumn
        header={header}
        todos={todos}
        containerId={containerId}
        emptyLines={emptyLines}
        notebookClassName="overflow-x-hidden md:flex-1 md:overflow-y-auto scrollbar-fade"
        onCreateTodo={onCreateTodo}
        onUpdateTodo={onUpdateTodo}
        onDeleteTodo={onDeleteTodo}
        onReorderTodos={onReorderTodos}
      />

      <AlertDialogRoot
        open={confirmDelete}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete list</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{list.name}&rdquo;? All
              todos in this list will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                onDeleteList?.();
                setConfirmDelete(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>
    </>
  );
}
