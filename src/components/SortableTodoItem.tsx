"use client";

import { useState, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TodoItem } from "./TodoItem";
import type { Todo } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SortableTodoItemProps {
  todo: Todo;
  source: string;
  onUpdate: (id: string, updates: { text?: string; completed?: boolean }) => void;
  onDelete: (id: string) => void;
}

export function SortableTodoItem({ todo, source, onUpdate, onDelete }: SortableTodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [animated, setAnimated] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = useCallback((id: string) => {
    setIsDeleting(true);
    setTimeout(() => onDelete(id), 200);
  }, [onDelete]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        !animated && "animate-fade-slide-in",
        isDeleting && "animate-collapse-out",
        isDragging && "z-50 cursor-grabbing opacity-90",
      )}
      onAnimationEnd={(e) => {
        if (e.animationName === "fadeSlideIn") {
          setAnimated(true);
        }
      }}
      {...attributes}
      {...listeners}
    >
      <TodoItem
        todo={todo}
        source={source}
        onUpdate={onUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
