"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TodoItem } from "./TodoItem";
import type { Todo } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SortableTodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: { text?: string; completed?: boolean }) => void;
  onDelete: (id: string) => void;
  onMove?: (id: string, toSource: string) => void;
}

export function SortableTodoItem({ todo, onUpdate, onDelete, onMove }: SortableTodoItemProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "transition-shadow duration-150",
        isDragging && "relative z-10 scale-[1.02] rounded bg-[#111] shadow-lg shadow-black/50 opacity-90"
      )}
    >
      <TodoItem
        todo={todo}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onMove={onMove}
        dragHandleProps={listeners}
      />
    </div>
  );
}
