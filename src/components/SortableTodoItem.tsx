"use client";

import { useState, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TodoItem } from "./TodoItem";
import type { Todo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

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

  const dragHandle = (
    <button
      type="button"
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-sm",
        "text-white/10 transition-colors duration-150 cursor-grab active:cursor-grabbing",
        "hover:text-white/50 md:text-transparent md:group-hover:text-white/25 md:group-hover:hover:text-white/50",
        isDragging && "text-white/50"
      )}
      aria-label="Drag to reorder"
      {...attributes}
      {...listeners}
      tabIndex={-1}
    >
      <GripVertical className="size-3" />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        !animated && "animate-fade-slide-in",
        isDeleting && "animate-collapse-out",
        isDragging && "z-50 opacity-90"
      )}
      onAnimationEnd={(e) => {
        if (e.animationName === "fadeSlideIn") {
          setAnimated(true);
        }
      }}
    >
      <TodoItem
        todo={todo}
        source={source}
        onUpdate={onUpdate}
        onDelete={handleDelete}
        dragHandle={dragHandle}
      />
    </div>
  );
}
