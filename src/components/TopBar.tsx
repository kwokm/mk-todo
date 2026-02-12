"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface TopBarProps {
  currentStartDate: Date;
  onNavigate: (days: number) => void;
  onToday: () => void;
  onDateSelect: (date: Date) => void;
}

export function TopBar({ currentStartDate, onNavigate, onToday, onDateSelect }: TopBarProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  return (
    <header className="flex h-12 shrink-0 items-center justify-between bg-[#0a0a0a] px-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToday}
        className="text-xs font-semibold tracking-wider text-white/70 hover:text-white"
      >
        TODAY
      </Button>

      <span className="text-sm font-bold uppercase tracking-wider">
        <span className="text-[#9333ea]">MK-</span>
        <span className="text-white">TODO</span>
        <span className="text-red-500">*</span>
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
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="ml-1 text-white/50 hover:text-white"
              aria-label="Pick a date"
            >
              <CalendarDays className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={currentStartDate}
              onSelect={(date) => {
                if (date) {
                  onDateSelect(date);
                  setCalendarOpen(false);
                }
              }}
              defaultMonth={currentStartDate}
            />
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
