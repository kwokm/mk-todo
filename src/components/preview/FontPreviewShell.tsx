"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FontPreviewShellProps {
  styleName: string;
  fontFamily: string;
  description: string;
  taskClassName: string;
  completedClassName: string;
  headerClassName: string;
  metaClassName?: string;
}

interface MockTask {
  text: React.ReactNode;
  completed: boolean;
}

const mockTasks: MockTask[] = [
  { text: "Review pull request for auth module", completed: false },
  { text: "Schedule 1:1 with design team", completed: false },
  {
    text: "Update project roadmap with Q3 milestones",
    completed: false,
  },
  { text: "Send invoice to client", completed: true },
  {
    text: (
      <>
        Fix{" "}
        <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">
          border-radius
        </code>{" "}
        bug on card component
      </>
    ),
    completed: true,
  },
];

function TaskRow({
  task,
  taskClassName,
  completedClassName,
}: {
  task: MockTask;
  taskClassName: string;
  completedClassName: string;
}) {
  return (
    <div className="flex h-8 items-center gap-1 px-1">
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-sm",
          task.completed ? "text-[#9333ea]" : "text-white/10"
        )}
      >
        <Check className="size-3" />
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate px-1 leading-8",
          task.completed ? completedClassName : taskClassName
        )}
      >
        {task.text}
      </span>
    </div>
  );
}

function TaskColumn({
  label,
  fontFamily,
  headerClassName,
  taskClassName,
  completedClassName,
}: {
  label: string;
  fontFamily?: string;
  headerClassName: string;
  taskClassName: string;
  completedClassName: string;
}) {
  return (
    <div
      className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0a0a0a] p-4"
      style={fontFamily ? { fontFamily } : undefined}
    >
      <div className="mb-3 px-1 leading-8">
        <span className={headerClassName}>WORK</span>
      </div>
      <div className="space-y-0">
        {mockTasks.map((task, i) => (
          <TaskRow
            key={i}
            task={task}
            taskClassName={taskClassName}
            completedClassName={completedClassName}
          />
        ))}
      </div>
    </div>
  );
}

export function FontPreviewShell({
  styleName,
  fontFamily,
  description,
  taskClassName,
  completedClassName,
  headerClassName,
}: FontPreviewShellProps) {
  return (
    <div className="space-y-6">
      {/* Title + description */}
      <div>
        <h2 className="text-lg font-semibold text-white">{styleName}</h2>
        <p className="mt-1 text-sm text-white/50">{description}</p>
      </div>

      {/* Side-by-side comparison */}
      <div className="flex gap-6">
        {/* Custom style column */}
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-white/40">
            {styleName}
          </h3>
          <TaskColumn
            label={styleName}
            fontFamily={fontFamily}
            headerClassName={headerClassName}
            taskClassName={taskClassName}
            completedClassName={completedClassName}
          />
        </div>

        {/* Current (Inter) column */}
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-white/40">
            Current (Inter)
          </h3>
          <TaskColumn
            label="Current (Inter)"
            fontFamily="var(--font-inter)"
            headerClassName="inline-block rounded bg-[#2a2a2a] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white"
            taskClassName="text-sm"
            completedClassName="text-sm text-muted-foreground line-through opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
