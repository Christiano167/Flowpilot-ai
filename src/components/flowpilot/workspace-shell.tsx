"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useRef } from "react";
import {
  ArrowLeft,
  Columns3,
  History,
  LayoutPanelLeft,
  PanelLeftClose,
  Play,
} from "lucide-react";

import { OutputPanel } from "@/components/flowpilot/output-panel";
import { PromptEditor } from "@/components/flowpilot/prompt-editor";
import { RevisionHistory } from "@/components/flowpilot/revision-history";
import { StatusBadge } from "@/components/flowpilot/status-badge";
import { WorkflowStepRail } from "@/components/flowpilot/workflow-step-rail";
import { Badge } from "@/components/ui/badge";
import { buttonVariants, Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { streamSimulatedGeneration } from "@/lib/simulators/generation";
import type { SimulationMode, WorkflowTemplate } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function WorkspaceShell({ template }: { template: WorkflowTemplate }) {
  const hydrateTemplate = useWorkspaceStore((state) => state.hydrateTemplate);
  const templateId = useWorkspaceStore((state) => state.templateId);
  const activeStepId = useWorkspaceStore((state) => state.activeStepId);
  const draftsByStepId = useWorkspaceStore((state) => state.draftsByStepId);
  const revisionsByStepId = useWorkspaceStore((state) => state.revisionsByStepId);
  const compareRevisionIds = useWorkspaceStore(
    (state) => state.compareRevisionIds,
  );
  const currentRun = useWorkspaceStore((state) => state.currentRun);
  const layout = useWorkspaceStore((state) => state.layout);
  const selectStep = useWorkspaceStore((state) => state.selectStep);
  const updateField = useWorkspaceStore((state) => state.updateField);
  const startRun = useWorkspaceStore((state) => state.startRun);
  const appendChunk = useWorkspaceStore((state) => state.appendChunk);
  const finishRun = useWorkspaceStore((state) => state.finishRun);
  const failRun = useWorkspaceStore((state) => state.failRun);
  const cancelRun = useWorkspaceStore((state) => state.cancelRun);
  const toggleCompareRevision = useWorkspaceStore(
    (state) => state.toggleCompareRevision,
  );
  const setHistorySheetOpen = useWorkspaceStore(
    (state) => state.setHistorySheetOpen,
  );
  const setStepSheetOpen = useWorkspaceStore((state) => state.setStepSheetOpen);
  const toggleRailCollapsed = useWorkspaceStore(
    (state) => state.toggleRailCollapsed,
  );
  const abortRef = useRef<AbortController | null>(null);

  const syncTemplate = useEffectEvent((incomingTemplate: WorkflowTemplate) => {
    hydrateTemplate(incomingTemplate);
  });

  useEffect(() => {
    syncTemplate(template);
  }, [template]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const activeStep =
    template.steps.find((step) => step.id === activeStepId) ?? template.steps[0];
  const currentDraft = draftsByStepId[activeStep.id] ?? {};
  const currentRevisions = revisionsByStepId[activeStep.id] ?? [];
  const ready = templateId === template.id;

  async function handleGenerate(mode: SimulationMode) {
    if (!ready || currentRun) {
      return;
    }

    const nextAttempt = (revisionsByStepId[activeStep.id]?.length ?? 0) + 1;
    const controller = new AbortController();

    abortRef.current = controller;
    startRun(activeStep, mode);

    try {
      await streamSimulatedGeneration({
        template,
        step: activeStep,
        values: currentDraft,
        mode,
        attempt: nextAttempt,
        signal: controller.signal,
        onChunk: appendChunk,
      });
      finishRun();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        cancelRun();
      } else {
        const message =
          error instanceof Error
            ? error.message
            : "The run failed for an unknown reason.";
        failRun(message);
      }
    } finally {
      abortRef.current = null;
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
  }

  if (!ready) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-sm text-muted-foreground">
        Loading workspace shell...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-border/70 bg-card/65 p-6 shadow-[0_36px_100px_rgba(15,31,47,0.12)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to gallery
            </Link>
            <div>
              <p className="section-kicker">{template.audience}</p>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-foreground md:text-6xl">
                {template.name}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                {template.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 text-[11px] tracking-[0.18em] uppercase"
            >
              {template.steps.length} steps
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 text-[11px] tracking-[0.18em] uppercase"
            >
              Mock streaming
            </Badge>
            {currentRun ? <StatusBadge status="streaming" /> : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-4 text-[11px] tracking-[0.16em] uppercase xl:hidden"
            onClick={() => setStepSheetOpen(true)}
          >
            <Columns3 className="size-3.5" />
            Steps
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-4 text-[11px] tracking-[0.16em] uppercase lg:hidden"
            onClick={() => setHistorySheetOpen(true)}
          >
            <History className="size-3.5" />
            History
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hidden rounded-full px-4 text-[11px] tracking-[0.16em] uppercase xl:inline-flex"
            onClick={toggleRailCollapsed}
          >
            {layout.railCollapsed ? (
              <LayoutPanelLeft className="size-3.5" />
            ) : (
              <PanelLeftClose className="size-3.5" />
            )}
            {layout.railCollapsed ? "Expand rail" : "Collapse rail"}
          </Button>
          <Link
            href={`/workspace/${template.id}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "rounded-full px-4 text-[11px] tracking-[0.16em] uppercase",
            )}
          >
            <Play className="size-3.5" />
            Direct route ready
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,280px)_minmax(0,1.15fr)_minmax(0,0.95fr)]">
        <div className="hidden xl:block">
          <div className="h-[43rem]">
            <WorkflowStepRail
              template={template}
              activeStepId={activeStep.id}
              revisionsByStepId={revisionsByStepId}
              streamingStepId={currentRun?.stepId ?? null}
              railCollapsed={layout.railCollapsed}
              onSelectStep={selectStep}
            />
          </div>
        </div>

        <PromptEditor
          step={activeStep}
          values={currentDraft}
          onValueChange={updateField}
        />

        <OutputPanel
          step={activeStep}
          revisions={currentRevisions}
          currentRun={currentRun}
          onGenerate={handleGenerate}
          onCancel={handleCancel}
        />
      </div>

      <div className="hidden lg:block">
        <RevisionHistory
          step={activeStep}
          revisions={currentRevisions}
          compareRevisionIds={compareRevisionIds}
          onToggleCompare={toggleCompareRevision}
        />
      </div>

      <Sheet open={layout.stepSheetOpen} onOpenChange={setStepSheetOpen}>
        <SheetContent side="left" className="w-[92vw] max-w-md p-0">
          <SheetHeader>
            <SheetTitle>Workflow steps</SheetTitle>
            <SheetDescription>
              Move across the step list without losing draft or revision state.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <WorkflowStepRail
              template={template}
              activeStepId={activeStep.id}
              revisionsByStepId={revisionsByStepId}
              streamingStepId={currentRun?.stepId ?? null}
              railCollapsed={false}
              onSelectStep={(stepId) => {
                selectStep(stepId);
                setStepSheetOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={layout.historySheetOpen} onOpenChange={setHistorySheetOpen}>
        <SheetContent side="right" className="w-[96vw] max-w-5xl p-0">
          <SheetHeader>
            <SheetTitle>Revision history</SheetTitle>
            <SheetDescription>
              Compare saved revisions and inspect the latest inputs for this step.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <RevisionHistory
              step={activeStep}
              revisions={currentRevisions}
              compareRevisionIds={compareRevisionIds}
              onToggleCompare={toggleCompareRevision}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
