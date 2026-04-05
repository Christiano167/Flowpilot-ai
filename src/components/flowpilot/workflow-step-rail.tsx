"use client";

import { startTransition, useTransition } from "react";
import { ChevronRight, History, Sparkles } from "lucide-react";

import { StatusBadge } from "@/components/flowpilot/status-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { RevisionRecord, WorkflowTemplate } from "@/lib/types";

type WorkflowStepRailProps = {
  template: WorkflowTemplate;
  activeStepId: string;
  revisionsByStepId: Record<string, RevisionRecord[]>;
  streamingStepId: string | null;
  railCollapsed: boolean;
  onSelectStep: (stepId: string) => void;
};

export function WorkflowStepRail({
  template,
  activeStepId,
  revisionsByStepId,
  streamingStepId,
  railCollapsed,
  onSelectStep,
}: WorkflowStepRailProps) {
  const [isPending, setPending] = useTransition();

  return (
    <ScrollArea className="h-full">
      <div className={cn("space-y-3", railCollapsed && "lg:space-y-2")}>
        {template.steps.map((step, index) => {
          const latestRevision = revisionsByStepId[step.id]?.[0];
          const isActive = step.id === activeStepId;
          const isStreaming = streamingStepId === step.id;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() =>
                setPending(() => {
                  startTransition(() => onSelectStep(step.id));
                })
              }
              className={cn(
                "w-full rounded-[22px] border px-4 py-4 text-left transition-colors",
                isActive
                  ? "border-primary/50 bg-primary/10 shadow-[0_18px_50px_rgba(15,63,93,0.08)]"
                  : "border-border/70 bg-background/70 hover:bg-secondary/45",
                railCollapsed && "px-3 py-3",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="section-kicker">Step 0{index + 1}</p>
                  <h3 className="mt-1 text-base font-semibold tracking-[-0.03em] text-foreground">
                    {step.title}
                  </h3>
                </div>
                <ChevronRight
                  className={cn(
                    "mt-1 size-4 text-muted-foreground transition-transform",
                    isActive && "translate-x-0.5 text-primary",
                  )}
                />
              </div>

              {!railCollapsed ? (
                <>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {step.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {isStreaming ? (
                      <StatusBadge status="streaming" />
                    ) : latestRevision ? (
                      <StatusBadge status={latestRevision.status} />
                    ) : null}
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Sparkles className="size-3.5 text-accent" />
                      {step.estimatedMinutes}m intent shaping
                    </span>
                  </div>

                  {latestRevision ? (
                    <div className="mt-4 rounded-[18px] border border-border/60 bg-background/80 px-3 py-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <History className="size-3.5 text-primary" />
                        {latestRevision.label} saved{" "}
                        {formatRelativeTime(latestRevision.createdAt)}
                      </span>
                    </div>
                  ) : null}
                </>
              ) : null}
            </button>
          );
        })}

        {isPending ? (
          <p className="px-1 text-xs tracking-[0.14em] text-muted-foreground uppercase">
            syncing step context...
          </p>
        ) : null}
      </div>
    </ScrollArea>
  );
}
