"use client";

import { useState, useCallback } from "react";
import { SortableTodoItem } from "./SortableTodoItem";
import type { Todo } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AnimatedTodoItemProps {
  todo: Todo;
  source: string;
  onUpdate: (id: string, updates: { text?: string; completed?: boolean }) => void;
  onDelete: (id: string) => void;
}

export function AnimatedTodoItem({ todo, source, onUpdate, onDelete }: AnimatedTodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [animated, setAnimated] = useState(false);

  const handleDelete = useCallback((id: string) => {
    setIsDeleting(true);
    setTimeout(() => onDelete(id), 200);
  }, [onDelete]);

  return (
    <div
      className={cn(
        !animated && "animate-fade-slide-in",
        isDeleting && "animate-collapse-out"
      )}
      onAnimationEnd={(e) => {
        // Clear the entry animation so no residual transform persists —
        // leftover transforms break dnd-kit's position measurements.
        if (e.animationName === "fadeSlideIn") {
          setAnimated(true);
        }
      }}
    >
      <SortableTodoItem
        todo={todo}
        source={source}
        onUpdate={onUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
