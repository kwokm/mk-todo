"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import type { Tab } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  onDeleteTab,
}: TabBarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
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

  const tabToDelete = tabs.find((t) => t.id === confirmDeleteId);

  return (
    <>
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto bg-[#0a0a0a] px-3 scrollbar-none">
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              className={cn(
                "group/tab relative flex shrink-0 items-center",
                active
                  ? "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#9333ea]"
                  : ""
              )}
            >
              <button
                type="button"
                onClick={() => onSelectTab(tab.id)}
                onDoubleClick={() => startEdit(tab)}
                className={cn(
                  "shrink-0 px-3 py-2.5 text-xs font-medium uppercase tracking-wide transition-colors duration-150",
                  active ? "text-white" : "text-muted-foreground hover:text-white"
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
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDeleteId(tab.id);
                }}
                className="mr-1 flex size-4 shrink-0 items-center justify-center rounded-sm text-white/40 transition-colors duration-150 hover:text-red-400 md:text-transparent md:group-hover/tab:text-white/30"
                aria-label={`Delete ${tab.name} tab`}
                tabIndex={-1}
              >
                <X className="size-2.5" />
              </button>
            </div>
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

      <AlertDialogRoot
        open={!!confirmDeleteId}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tab</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{tabToDelete?.name}&rdquo;? All lists and todos in this tab will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (confirmDeleteId) onDeleteTab(confirmDeleteId);
                setConfirmDeleteId(null);
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
