"use client";

import {
  AlertCircle,
  ChevronDown,
  RotateCcw,
  Square,
  WandSparkles,
} from "lucide-react";

import { PanelShell } from "@/components/flowpilot/panel-shell";
import { StatusBadge } from "@/components/flowpilot/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  GenerationRun,
  RevisionRecord,
  SimulationMode,
  WorkflowStep,
} from "@/lib/types";
import { formatAbsoluteTime, formatDuration } from "@/lib/utils";

type OutputPanelProps = {
  step: WorkflowStep;
  revisions: RevisionRecord[];
  currentRun: GenerationRun | null;
  onGenerate: (mode: SimulationMode) => void;
  onCancel: () => void;
};

export function OutputPanel({
  step,
  revisions,
  currentRun,
  onGenerate,
  onCancel,
}: OutputPanelProps) {
  const activeRun = currentRun?.stepId === step.id ? currentRun : null;
  const latestRevision = revisions[0] ?? null;
  const visibleStatus = activeRun?.status ?? latestRevision?.status ?? null;
  const visibleOutput = activeRun?.content || latestRevision?.content || "";

  return (
    <PanelShell
      eyebrow="Output"
      title={step.outputLabel}
      description="Run, cancel, retry, or simulate failure states without leaving the current context."
      actions={
        <>
          {activeRun ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4 text-[11px] tracking-[0.16em] uppercase"
              onClick={onCancel}
            >
              <Square className="size-3.5" />
              Cancel
            </Button>
          ) : latestRevision ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4 text-[11px] tracking-[0.16em] uppercase"
              onClick={() => onGenerate("success")}
            >
              <RotateCcw className="size-3.5" />
              Retry
            </Button>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 items-center gap-2 rounded-full bg-primary px-4 text-[11px] font-medium tracking-[0.16em] text-primary-foreground uppercase">
              <WandSparkles className="size-3.5" />
              Run
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => onGenerate("success")}>
                Standard mock stream
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGenerate("failure")}>
                Simulate failure branch
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onGenerate("success")}>
                Fresh retry from current fields
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    >
      <div className="grid h-full gap-4">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div className="rounded-[22px] border border-border/70 bg-background/75 p-4">
            <span className="section-kicker">Status</span>
            <div className="mt-2">
              {visibleStatus ? (
                <StatusBadge status={visibleStatus} />
              ) : (
                <Badge
                  variant="outline"
                  className="rounded-full px-2.5 py-0.5 text-[11px] tracking-[0.14em] uppercase"
                >
                  Idle
                </Badge>
              )}
            </div>
          </div>

          <div className="rounded-[22px] border border-border/70 bg-background/75 p-4">
            <span className="section-kicker">Revisions</span>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
              {revisions.length}
            </p>
          </div>

          <div className="rounded-[22px] border border-border/70 bg-background/75 p-4">
            <span className="section-kicker">Last saved</span>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {latestRevision ? formatAbsoluteTime(latestRevision.createdAt) : "No runs yet"}
            </p>
          </div>

          <div className="rounded-[22px] border border-border/70 bg-background/75 p-4">
            <span className="section-kicker">Duration</span>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {activeRun
                ? "Streaming..."
                : latestRevision
                  ? formatDuration(latestRevision.durationMs)
                  : "n/a"}
            </p>
          </div>
        </div>

        {latestRevision?.status !== "success" && !activeRun ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>{latestRevision?.status === "error" ? "Run failed" : "Run canceled"}</AlertTitle>
            <AlertDescription>
              {latestRevision?.errorMessage ??
                "The latest run did not complete successfully. Retry from the current field state."}
            </AlertDescription>
          </Alert>
        ) : null}

        <Tabs defaultValue="output" className="min-h-0 flex-1">
          <TabsList variant="line" className="gap-3 p-0">
            <TabsTrigger value="output" className="px-0 pb-2">
              Latest output
            </TabsTrigger>
            <TabsTrigger value="telemetry" className="px-0 pb-2">
              Run notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="output" className="min-h-0 flex-1">
            <ScrollArea className="h-[27rem] rounded-[26px] border border-border/70 bg-background/80 p-5 lg:h-[36rem]">
              {activeRun && !activeRun.content ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-4/5 rounded-full" />
                  <Skeleton className="h-5 w-full rounded-full" />
                  <Skeleton className="h-5 w-11/12 rounded-full" />
                </div>
              ) : visibleOutput ? (
                <pre className="whitespace-pre-wrap font-mono text-sm leading-7 text-foreground">
                  {visibleOutput}
                  {activeRun ? <span className="stream-cursor ml-1 inline-block h-5 w-2 align-middle" /> : null}
                </pre>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="max-w-sm text-sm leading-7 text-muted-foreground">
                    Start a mock generation to see the streamed output, then use
                    the history panel to compare revisions side by side.
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="telemetry" className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[24px] border border-border/70 bg-background/80 p-4">
                <p className="section-kicker">Step guidance</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {step.summary}
                </p>
              </div>
              <div className="rounded-[24px] border border-border/70 bg-background/80 p-4">
                <p className="section-kicker">Mode support</p>
                <ul className="mt-2 space-y-2 text-sm leading-7 text-muted-foreground">
                  <li>Standard streaming keeps app state local and believable.</li>
                  <li>Failure simulation creates realistic async recovery paths.</li>
                  <li>Cancel preserves partial output for later compare review.</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PanelShell>
  );
}
