"use client";

import { useState, useCallback } from "react";
import { SortableTodoItem } from "./SortableTodoItem";
import type { Todo } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AnimatedTodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: { text?: string; completed?: boolean }) => void;
  onDelete: (id: string) => void;
  onMove?: (id: string, toSource: string) => void;
}

export function AnimatedTodoItem({ todo, onUpdate, onDelete, onMove }: AnimatedTodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback((id: string) => {
    setIsDeleting(true);
    setTimeout(() => onDelete(id), 200);
  }, [onDelete]);

  return (
    <div
      className={cn(
        "animate-fade-slide-in",
        isDeleting && "animate-collapse-out"
      )}
    >
      <SortableTodoItem
        todo={todo}
        onUpdate={onUpdate}
        onDelete={handleDelete}
        onMove={onMove}
      />
    </div>
  );
}
