"use client";

import { CheckCheck, GitCompareArrows } from "lucide-react";

import { PanelShell } from "@/components/flowpilot/panel-shell";
import { StatusBadge } from "@/components/flowpilot/status-badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { RevisionRecord, WorkflowStep } from "@/lib/types";
import { cn, formatAbsoluteTime, formatDuration } from "@/lib/utils";

type RevisionHistoryProps = {
  step: WorkflowStep;
  revisions: RevisionRecord[];
  compareRevisionIds: string[];
  onToggleCompare: (revisionId: string) => void;
};

export function RevisionHistory({
  step,
  revisions,
  compareRevisionIds,
  onToggleCompare,
}: RevisionHistoryProps) {
  const compareRevisions = revisions.filter((revision) =>
    compareRevisionIds.includes(revision.id),
  );
  const primaryRevision = compareRevisions[0] ?? revisions[0] ?? null;
  const secondaryRevision = compareRevisions[1] ?? null;

  return (
    <PanelShell
      eyebrow="Revisions"
      title={`${step.title} history`}
      description="Select up to two revisions to compare wording, status, and runtime details."
      bodyClassName="p-0"
    >
      {revisions.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center px-6 py-10 text-center text-sm leading-7 text-muted-foreground">
          No revisions yet. The first mock generation will create a compare-ready
          history card here.
        </div>
      ) : (
        <div className="grid min-h-0 gap-px bg-border lg:grid-cols-[320px_minmax(0,1fr)]">
          <ScrollArea className="bg-card/65 p-4">
            <div className="space-y-3">
              {revisions.map((revision) => {
                const isSelected = compareRevisionIds.includes(revision.id);

                return (
                  <button
                    key={revision.id}
                    type="button"
                    onClick={() => onToggleCompare(revision.id)}
                    className={cn(
                      "w-full rounded-[20px] border px-4 py-4 text-left transition-colors",
                      isSelected
                        ? "border-primary/50 bg-primary/10"
                        : "border-border/70 bg-background/80 hover:bg-secondary/40",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="section-kicker">{revision.label}</p>
                        <h3 className="mt-1 text-sm font-semibold text-foreground">
                          {formatAbsoluteTime(revision.createdAt)}
                        </h3>
                      </div>
                      <StatusBadge status={revision.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>{formatDuration(revision.durationMs)}</span>
                      <span>{revision.mode}</span>
                    </div>
                    {isSelected ? (
                      <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-primary">
                        <CheckCheck className="size-3.5" />
                        selected for compare
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          <div className="grid min-h-0 bg-background/75">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
              <div>
                <p className="section-kicker">Compare view</p>
                <h3 className="mt-1 flex items-center gap-2 text-base font-semibold text-foreground">
                  <GitCompareArrows className="size-4 text-primary" />
                  {secondaryRevision ? "Side-by-side revisions" : "Latest revision detail"}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full px-4 text-[11px] tracking-[0.16em] uppercase"
                onClick={() => {
                  for (const revisionId of compareRevisionIds) {
                    onToggleCompare(revisionId);
                  }
                }}
              >
                Clear
              </Button>
            </div>

            <ScrollArea className="h-[24rem] p-5 lg:h-[20rem] xl:h-[24rem]">
              <div className={cn("grid gap-4", secondaryRevision && "xl:grid-cols-2")}>
                {primaryRevision ? (
                  <RevisionDetailCard revision={primaryRevision} />
                ) : null}
                {secondaryRevision ? (
                  <RevisionDetailCard revision={secondaryRevision} />
                ) : null}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </PanelShell>
  );
}

function RevisionDetailCard({ revision }: { revision: RevisionRecord }) {
  return (
    <article className="rounded-[24px] border border-border/70 bg-card/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">{revision.label}</p>
          <h4 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-foreground">
            {revision.stepTitle}
          </h4>
        </div>
        <StatusBadge status={revision.status} />
      </div>

      <Separator className="my-4 bg-border/70" />

      <pre className="whitespace-pre-wrap font-mono text-sm leading-7 text-foreground">
        {revision.content || "(empty partial output)"}
      </pre>

      <Separator className="my-4 bg-border/70" />

      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(revision.inputs).map(([key, value]) => (
          <div key={key} className="rounded-[18px] bg-background/75 p-3">
            <p className="section-kicker">{key}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {value}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
