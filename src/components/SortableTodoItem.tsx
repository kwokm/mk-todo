"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TodoItem } from "./TodoItem";
import type { Todo } from "@/lib/types";

interface SortableTodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: { text?: string; completed?: boolean }) => void;
  onDelete: (id: string) => void;
}

export function SortableTodoItem({ todo, onUpdate, onDelete }: SortableTodoItemProps) {
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
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <TodoItem
        todo={todo}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={listeners}
      />
    </div>
  );
}
