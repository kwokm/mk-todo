"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface TopBarProps {
  currentStartDate: Date;
  onNavigate: (days: number) => void;
  onToday: () => void;
}

export function TopBar({ onNavigate, onToday }: TopBarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#1a1a1a] px-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToday}
        className="text-xs font-semibold tracking-wider text-white/70 hover:text-white"
      >
        TODAY
      </Button>

      <span className="text-sm font-bold uppercase tracking-wider text-[#9333ea]">
        MK-TODO
      </span>

      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onNavigate(-7)}
          className="hidden text-white/50 hover:text-white md:inline-flex"
          aria-label="Previous week"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onNavigate(-1)}
          className="text-white/50 hover:text-white"
          aria-label="Previous day"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onNavigate(1)}
          className="text-white/50 hover:text-white"
          aria-label="Next day"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onNavigate(7)}
          className="hidden text-white/50 hover:text-white md:inline-flex"
          aria-label="Next week"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </header>
  );
}
