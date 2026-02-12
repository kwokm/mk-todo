"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import type { Tab } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCreateTab: () => void;
  onUpdateTab: (id: string, name: string) => void;
  onDeleteTab: (id: string) => void;
}

export function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCreateTab,
  onUpdateTab,
}: TabBarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingId]);

  function startEdit(tab: Tab) {
    setEditingId(tab.id);
    setEditText(tab.name);
  }

  function saveEdit() {
    if (editingId && editText.trim()) {
      onUpdateTab(editingId, editText.trim());
    }
    setEditingId(null);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") setEditingId(null);
  }

  return (
    <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-y border-[#1a1a1a] px-3 scrollbar-none">
      {tabs.map((tab) => {
        const active = tab.id === activeTabId;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            onDoubleClick={() => startEdit(tab)}
            className={cn(
              "relative shrink-0 px-3 py-2.5 text-xs font-medium uppercase tracking-wide transition-colors duration-150",
              active
                ? "text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#9333ea]"
                : "text-muted-foreground hover:text-white"
            )}
          >
            {editingId === tab.id ? (
              <input
                ref={inputRef}
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={saveEdit}
                onClick={(e) => e.stopPropagation()}
                className="w-16 bg-transparent text-center text-xs font-medium uppercase tracking-wide text-white outline-none"
              />
            ) : (
              tab.name
            )}
          </button>
        );
      })}

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onCreateTab}
        className="shrink-0 text-muted-foreground hover:text-white"
        aria-label="Add tab"
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
