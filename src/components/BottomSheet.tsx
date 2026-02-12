"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  header: ReactNode;
  children: ReactNode;
}

type SnapPoint = "collapsed" | "half" | "full";

const SNAP_HEIGHTS: Record<SnapPoint, number> = {
  collapsed: 80,
  half: 45,
  full: 90,
};

export function BottomSheet({ header, children }: BottomSheetProps) {
  const [snap, setSnap] = useState<SnapPoint>("half");
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchStartHeight = useRef(0);

  const getHeight = useCallback(() => {
    if (snap === "collapsed") return `${SNAP_HEIGHTS.collapsed}px`;
    return `${SNAP_HEIGHTS[snap]}vh`;
  }, [snap]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartHeight.current = sheetRef.current?.offsetHeight ?? 0;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaY = touchStartY.current - e.touches[0].clientY;
    setDragOffset(deltaY);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    const finalHeight = touchStartHeight.current + dragOffset;
    const vh = window.innerHeight;
    const heightPercent = (finalHeight / vh) * 100;

    if (heightPercent > 70) {
      setSnap("full");
    } else if (heightPercent > 25) {
      setSnap("half");
    } else {
      setSnap("collapsed");
    }
    setDragOffset(0);
  }, [dragOffset]);

  const handleTap = useCallback(() => {
    if (isDragging) return;
    setSnap((prev) => {
      if (prev === "collapsed") return "half";
      if (prev === "half") return "full";
      return "collapsed";
    });
  }, [isDragging]);

  const style: React.CSSProperties = isDragging
    ? { height: `${touchStartHeight.current + dragOffset}px`, transition: "none" }
    : { height: getHeight(), transition: "height 300ms cubic-bezier(0.16, 1, 0.3, 1)" };

  const showBackdrop = snap === "full";

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/60 transition-opacity duration-300 md:hidden",
          showBackdrop ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setSnap("collapsed")}
      />
      <div
        ref={sheetRef}
        className="fixed inset-x-0 bottom-0 z-40 flex flex-col rounded-t-xl bg-[#0a0a0a] shadow-[0_-4px_30px_rgba(0,0,0,0.5)] md:hidden"
        style={style}
      >
      <div
        className="flex shrink-0 cursor-grab items-center justify-center pt-3 pb-3 active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleTap}
      >
        <div className="h-1.5 w-12 rounded-full bg-white/25" />
      </div>

      <div className="shrink-0">{header}</div>

      <div className={cn(
        "min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
        snap === "collapsed" && "hidden"
      )}>
        {children}
      </div>
    </div>
    </>
  );
}
