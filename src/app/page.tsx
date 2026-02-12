"use client";

import { useState, useEffect } from "react";
import { addDays } from "@/lib/utils";
import { TopBar } from "@/components/TopBar";
import { CalendarView } from "@/components/CalendarView";
import { TabBar } from "@/components/TabBar";
import { ListView } from "@/components/ListView";
import { BottomSheet } from "@/components/BottomSheet";
import { TodoDndProvider } from "@/components/TodoDndProvider";
import {
  useTabs,
  useCreateTab,
  useUpdateTab,
  useDeleteTab,
} from "@/hooks/useTabs";

export default function Home() {
  const [currentStartDate, setCurrentStartDate] = useState(() => new Date());
  const { data: tabs = [] } = useTabs();
  const [activeTabId, setActiveTabId] = useState("");
  const createTab = useCreateTab();
  const updateTab = useUpdateTab();
  const deleteTab = useDeleteTab();

  useEffect(() => {
    function handleSwipe(e: Event) {
      const { days } = (e as CustomEvent).detail;
      setCurrentStartDate((prev) => addDays(prev, days));
    }
    window.addEventListener("calendar-swipe", handleSwipe);
    return () => window.removeEventListener("calendar-swipe", handleSwipe);
  }, []);

  const resolvedActiveTabId = activeTabId || tabs[0]?.id || "";

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <TopBar
        currentStartDate={currentStartDate}
        onNavigate={(days) =>
          setCurrentStartDate((prev) => addDays(prev, days))
        }
        onToday={() => setCurrentStartDate(new Date())}
        onDateSelect={(date) => setCurrentStartDate(date)}
      />

      <TodoDndProvider>
        {/* Desktop layout */}
        <div className="hidden min-h-0 flex-1 flex-col md:flex">
          <div className="min-h-0 flex-[11] border-b border-[#1a1a1a]">
            <CalendarView startDate={currentStartDate} />
          </div>

          <TabBar
            tabs={tabs}
            activeTabId={resolvedActiveTabId}
            onSelectTab={setActiveTabId}
            onCreateTab={() => createTab.mutate({ name: "New Tab" })}
            onUpdateTab={(tabId, name) => updateTab.mutate({ tabId, name })}
            onDeleteTab={(tabId) => deleteTab.mutate({ tabId })}
          />

          <div className="min-h-0 flex-[9] bg-[#0a0a0a]">
            {resolvedActiveTabId && (
              <ListView activeTabId={resolvedActiveTabId} />
            )}
          </div>
        </div>

        {/* Mobile layout */}
        <div className="flex min-h-0 flex-1 flex-col pb-20 md:hidden">
          <div className="min-h-0 flex-1">
            <CalendarView startDate={currentStartDate} />
          </div>
        </div>

        {/* Mobile bottom sheet */}
        <BottomSheet
          header={
            <TabBar
              tabs={tabs}
              activeTabId={resolvedActiveTabId}
              onSelectTab={setActiveTabId}
              onCreateTab={() => createTab.mutate({ name: "New Tab" })}
              onUpdateTab={(tabId, name) => updateTab.mutate({ tabId, name })}
              onDeleteTab={(tabId) => deleteTab.mutate({ tabId })}
            />
          }
        >
          {resolvedActiveTabId && (
            <ListView activeTabId={resolvedActiveTabId} />
          )}
        </BottomSheet>
      </TodoDndProvider>
    </div>
  );
}
