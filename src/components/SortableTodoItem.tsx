"use client";

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
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && "relative z-10 rounded bg-[#1a1a1a] shadow-lg shadow-black/40 ring-1 ring-[#9333ea]/20"
      )}
      {...attributes}
    >
      <TodoItem
        todo={todo}
        source={source}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={{ ...listeners, ref: setActivatorNodeRef }}
      />
    </div>
  );
}
