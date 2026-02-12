"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import type { Todo, TodoList } from "@/lib/types";
import { SortableTodoItem } from "@/components/SortableTodoItem";

interface ListColumnProps {
  list: TodoList;
  todos: Todo[];
  onCreateTodo: (text: string) => void;
  onUpdateTodo: (id: string, updates: { text?: string; completed?: boolean }) => void;
  onDeleteTodo: (id: string) => void;
  onReorder: (todoIds: string[]) => void;
}

const MIN_EMPTY_LINES = 20;

export function ListColumn({
  list,
  todos,
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
  onReorder,
}: ListColumnProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameText, setNameText] = useState(list.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const lineInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [editingName]);

  useEffect(() => {
    if (activeLineIndex !== null) {
      lineInputRef.current?.focus();
    }
  }, [activeLineIndex]);

  function saveName() {
    setEditingName(false);
  }

  function handleNameKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") saveName();
    if (e.key === "Escape") {
      setNameText(list.name);
      setEditingName(false);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(todos, oldIndex, newIndex);
    onReorder(reordered.map((t) => t.id));
  }

  function handleLineClick(lineIndex: number) {
    setActiveLineIndex(lineIndex);
    setInputText("");
  }

  function handleLineKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && inputText.trim()) {
      onCreateTodo(inputText.trim());
      setInputText("");
    } else if (e.key === "Enter" && !inputText.trim()) {
      setActiveLineIndex(null);
    } else if (e.key === "Escape") {
      setActiveLineIndex(null);
      setInputText("");
    }
  }

  function handleLineBlur() {
    if (inputText.trim()) {
      onCreateTodo(inputText.trim());
    }
    setActiveLineIndex(null);
    setInputText("");
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="shrink-0 px-5 pt-4 pb-3">
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
            className="cursor-text font-heading text-lg font-bold uppercase text-white"
          >
            {list.name}
          </p>
        )}
      </div>

      <div className="notebook-lines flex-1 overflow-y-auto scrollbar-none">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={todos.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {todos.map((todo) => (
              <div key={todo.id}>
                <SortableTodoItem
                  todo={todo}
                  onUpdate={onUpdateTodo}
                  onDelete={onDeleteTodo}
                />
              </div>
            ))}
          </SortableContext>
        </DndContext>

        {Array.from({ length: MIN_EMPTY_LINES }).map((_, i) => {
          const lineIndex = todos.length + i;
          const isActive = activeLineIndex === lineIndex;

          return (
            <div
              key={`empty-${i}`}
              className="h-8 px-1"
              onClick={() => handleLineClick(lineIndex)}
            >
              {isActive ? (
                <input
                  ref={lineInputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleLineKeyDown}
                  onBlur={handleLineBlur}
                  className="h-full w-full bg-transparent px-1 text-sm text-white outline-none"
                  autoFocus
                />
              ) : (
                <div className="h-full w-full cursor-text" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
