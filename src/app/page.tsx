"use client";

import { useState } from "react";
import { addDays } from "@/lib/utils";
import { TopBar } from "@/components/TopBar";
import { CalendarView } from "@/components/CalendarView";
import { TabBar } from "@/components/TabBar";
import { ListView } from "@/components/ListView";
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

  const resolvedActiveTabId = activeTabId || tabs[0]?.id || "";

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <TopBar
        currentStartDate={currentStartDate}
        onNavigate={(days) =>
          setCurrentStartDate((prev) => addDays(prev, days))
        }
        onToday={() => setCurrentStartDate(new Date())}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 border-b border-[#1a1a1a]">
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

        <div className="min-h-0 flex-1">
          {resolvedActiveTabId && (
            <ListView activeTabId={resolvedActiveTabId} />
          )}
        </div>
      </div>
    </div>
  );
}
