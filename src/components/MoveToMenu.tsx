"use client";

import { useState } from "react";
import { ArrowRightLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatDateKey } from "@/lib/utils";
import { useTabs, useLists } from "@/hooks/useTabs";
import { useMoveTodo } from "@/hooks/useTodos";
import { cn } from "@/lib/utils";

interface MoveToMenuProps {
  todoId: string;
  source: string;
}

function TabRow({
  tabId,
  tabName,
  source,
  onSelect,
}: {
  tabId: string;
  tabName: string;
  source: string;
  onSelect: (destinationKey: string, label: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data: lists } = useLists(tabId);

  const availableLists = lists?.filter(
    (list) => `list:${tabId}:${list.id}` !== source
  );

  if (!availableLists?.length) return null;

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm text-white hover:bg-white/5"
      >
        <span className="truncate">{tabName}</span>
        <ChevronRight
          className={cn(
            "size-3 text-muted-foreground transition-transform duration-150",
            expanded && "rotate-90"
          )}
        />
      </button>

      {expanded && (
        <div className="ml-2 border-l border-[#1a1a1a] pl-1">
          {availableLists.map((list) => {
            const destKey = `list:${tabId}:${list.id}`;
            return (
              <button
                key={list.id}
                type="button"
                onClick={() => onSelect(destKey, `${tabName} / ${list.name}`)}
                className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white"
              >
                <span className="truncate">{list.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MoveToMenu({ todoId, source }: MoveToMenuProps) {
  const [open, setOpen] = useState(false);
  const moveTodo = useMoveTodo();
  const { data: tabs } = useTabs();

  function handleDaySelect(date: Date | undefined) {
    if (!date) return;
    const key = `day:${formatDateKey(date)}`;
    if (key === source) return;

    const label = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    moveTodo.mutate(
      { todoId, fromSource: source, toSource: key },
      { onSuccess: () => toast.success(`Moved to ${label}`) }
    );
    setOpen(false);
  }

  function handleListSelect(destinationKey: string, label: string) {
    moveTodo.mutate(
      { todoId, fromSource: source, toSource: destinationKey },
      { onSuccess: () => toast.success(`Moved to ${label}`) }
    );
    setOpen(false);
  }

  // Derive the currently selected date from source so the calendar can highlight it
  const sourceDate = source.startsWith("day:")
    ? new Date(source.slice(4) + "T00:00:00")
    : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex size-5 shrink-0 items-center justify-center rounded-sm text-white/10 transition-colors duration-150 hover:text-purple-400 md:text-transparent group-hover:text-white/30"
          aria-label="Move to another day or list"
        >
          <ArrowRightLeft className="size-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="left"
        sideOffset={8}
        className="w-auto p-0 border-[#1a1a1a] bg-[#0a0a0a]"
      >
        {/* Calendar picker */}
        <div className="border-b border-[#1a1a1a]">
          <Calendar
            mode="single"
            selected={sourceDate}
            onSelect={handleDaySelect}
            className="p-2 [--cell-size:--spacing(7)]"
            classNames={{
              today: "bg-[#9333ea]/20 text-[#9333ea] rounded-md",
              day: "relative w-full h-full p-0 text-center select-none aspect-square",
            }}
          />
        </div>

        {/* Lists section */}
        {tabs && tabs.length > 0 && (
          <div className="p-2">
            <p className="px-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Lists
            </p>
            {tabs.map((tab) => (
              <TabRow
                key={tab.id}
                tabId={tab.id}
                tabName={tab.name}
                source={source}
                onSelect={handleListSelect}
              />
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
