"use client";

import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import {
  browserWorkspaceStorage,
  type WorkspaceSnapshotStorage,
} from "@/lib/storage/workspace-storage";
import type {
  GenerationRun,
  RevisionRecord,
  SimulationMode,
  WorkflowStep,
  WorkflowTemplate,
  WorkspaceLayoutState,
  WorkspaceSnapshot,
} from "@/lib/types";

type WorkspaceState = {
  templateId: string | null;
  activeStepId: string | null;
  draftsByStepId: Record<string, Record<string, string>>;
  revisionsByStepId: Record<string, RevisionRecord[]>;
  compareRevisionIds: string[];
  currentRun: GenerationRun | null;
  layout: WorkspaceLayoutState;
  hydrateTemplate: (template: WorkflowTemplate) => void;
  selectStep: (stepId: string) => void;
  updateField: (fieldId: string, value: string) => void;
  startRun: (step: WorkflowStep, mode: SimulationMode) => void;
  appendChunk: (chunk: string) => void;
  finishRun: () => void;
  failRun: (message: string) => void;
  cancelRun: () => void;
  toggleCompareRevision: (revisionId: string) => void;
  setHistorySheetOpen: (open: boolean) => void;
  setStepSheetOpen: (open: boolean) => void;
  toggleRailCollapsed: () => void;
};

const defaultLayoutState: WorkspaceLayoutState = {
  historySheetOpen: false,
  stepSheetOpen: false,
  railCollapsed: false,
};

function createDrafts(template: WorkflowTemplate) {
  return Object.fromEntries(
    template.steps.map((step) => [
      step.id,
      Object.fromEntries(
        step.fields.map((field) => [field.id, field.defaultValue ?? ""]),
      ),
    ]),
  );
}

function createSnapshot(state: WorkspaceState): WorkspaceSnapshot | null {
  if (!state.templateId || !state.activeStepId) {
    return null;
  }

  return {
    activeStepId: state.activeStepId,
    draftsByStepId: state.draftsByStepId,
    revisionsByStepId: state.revisionsByStepId,
    compareRevisionIds: state.compareRevisionIds,
    layout: state.layout,
    lastOpenedAt: new Date().toISOString(),
  };
}

function mergeDrafts(
  template: WorkflowTemplate,
  snapshot: WorkspaceSnapshot | null,
) {
  const defaultDrafts = createDrafts(template);

  if (!snapshot) {
    return defaultDrafts;
  }

  return Object.fromEntries(
    template.steps.map((step) => [
      step.id,
      {
        ...defaultDrafts[step.id],
        ...(snapshot.draftsByStepId[step.id] ?? {}),
      },
    ]),
  );
}

function normalizeRevisions(
  template: WorkflowTemplate,
  snapshot: WorkspaceSnapshot | null,
) {
  return Object.fromEntries(
    template.steps.map((step) => [
      step.id,
      snapshot?.revisionsByStepId[step.id]?.slice(0, 12) ?? [],
    ]),
  );
}

function clampCompareSelection(current: string[], incomingId: string) {
  if (current.includes(incomingId)) {
    return current.filter((id) => id !== incomingId);
  }

  if (current.length < 2) {
    return [...current, incomingId];
  }

  return [current[1], incomingId];
}

function persistState(
  storage: WorkspaceSnapshotStorage,
  nextState: WorkspaceState,
) {
  const snapshot = createSnapshot(nextState);

  if (!snapshot || !nextState.templateId) {
    return;
  }

  storage.save(nextState.templateId, snapshot);
}

export function createWorkspaceStore(
  storage: WorkspaceSnapshotStorage = browserWorkspaceStorage,
) {
  return createStore<WorkspaceState>()((set, get) => ({
    templateId: null,
    activeStepId: null,
    draftsByStepId: {},
    revisionsByStepId: {},
    compareRevisionIds: [],
    currentRun: null,
    layout: defaultLayoutState,
    hydrateTemplate(template) {
      const snapshot = storage.load(template.id);
      const revisionsByStepId = normalizeRevisions(template, snapshot);
      const activeStepId =
        template.steps.find((step) => step.id === snapshot?.activeStepId)?.id ??
        template.steps[0]?.id ??
        null;

      set({
        templateId: template.id,
        activeStepId,
        draftsByStepId: mergeDrafts(template, snapshot),
        revisionsByStepId,
        compareRevisionIds:
          snapshot?.compareRevisionIds.filter((revisionId) =>
            Object.values(revisionsByStepId)
              .flat()
              .some((revision) => revision.id === revisionId),
          ) ?? [],
        currentRun: null,
        layout: snapshot?.layout ?? defaultLayoutState,
      });

      persistState(storage, get());
    },
    selectStep(stepId) {
      set((state) => ({
        activeStepId: stepId,
        compareRevisionIds: state.compareRevisionIds.filter((revisionId) =>
          state.revisionsByStepId[stepId]?.some(
            (revision) => revision.id === revisionId,
          ),
        ),
      }));

      persistState(storage, get());
    },
    updateField(fieldId, value) {
      const { activeStepId } = get();

      if (!activeStepId) {
        return;
      }

      set((state) => ({
        draftsByStepId: {
          ...state.draftsByStepId,
          [activeStepId]: {
            ...(state.draftsByStepId[activeStepId] ?? {}),
            [fieldId]: value,
          },
        },
      }));

      persistState(storage, get());
    },
    startRun(step, mode) {
      const state = get();

      if (!state.templateId) {
        return;
      }

      const existingRevisions = state.revisionsByStepId[step.id] ?? [];

      set({
        currentRun: {
          id: crypto.randomUUID(),
          templateId: state.templateId,
          stepId: step.id,
          stepTitle: step.title,
          status: "streaming",
          mode,
          label: `Revision ${existingRevisions.length + 1}`,
          content: "",
          startedAt: new Date().toISOString(),
          inputs: { ...(state.draftsByStepId[step.id] ?? {}) },
        },
      });
    },
    appendChunk(chunk) {
      set((state) => ({
        currentRun: state.currentRun
          ? {
              ...state.currentRun,
              content: `${state.currentRun.content}${chunk}`,
            }
          : null,
      }));
    },
    finishRun() {
      const state = get();

      if (!state.currentRun) {
        return;
      }

      const revision: RevisionRecord = {
        id: state.currentRun.id,
        templateId: state.currentRun.templateId,
        stepId: state.currentRun.stepId,
        stepTitle: state.currentRun.stepTitle,
        label: state.currentRun.label,
        status: "success",
        mode: state.currentRun.mode,
        content: state.currentRun.content.trim(),
        createdAt: new Date().toISOString(),
        durationMs:
          Date.now() - new Date(state.currentRun.startedAt).getTime(),
        inputs: state.currentRun.inputs,
      };

      set((currentState) => ({
        currentRun: null,
        revisionsByStepId: {
          ...currentState.revisionsByStepId,
          [revision.stepId]: [
            revision,
            ...(currentState.revisionsByStepId[revision.stepId] ?? []),
          ],
        },
      }));

      persistState(storage, get());
    },
    failRun(message) {
      const state = get();

      if (!state.currentRun) {
        return;
      }

      const revision: RevisionRecord = {
        id: state.currentRun.id,
        templateId: state.currentRun.templateId,
        stepId: state.currentRun.stepId,
        stepTitle: state.currentRun.stepTitle,
        label: state.currentRun.label,
        status: "error",
        mode: state.currentRun.mode,
        content: state.currentRun.content.trim(),
        createdAt: new Date().toISOString(),
        durationMs:
          Date.now() - new Date(state.currentRun.startedAt).getTime(),
        errorMessage: message,
        inputs: state.currentRun.inputs,
      };

      set((currentState) => ({
        currentRun: null,
        revisionsByStepId: {
          ...currentState.revisionsByStepId,
          [revision.stepId]: [
            revision,
            ...(currentState.revisionsByStepId[revision.stepId] ?? []),
          ],
        },
      }));

      persistState(storage, get());
    },
    cancelRun() {
      const state = get();

      if (!state.currentRun) {
        return;
      }

      const revision: RevisionRecord = {
        id: state.currentRun.id,
        templateId: state.currentRun.templateId,
        stepId: state.currentRun.stepId,
        stepTitle: state.currentRun.stepTitle,
        label: state.currentRun.label,
        status: "canceled",
        mode: "canceled",
        content: state.currentRun.content.trim(),
        createdAt: new Date().toISOString(),
        durationMs:
          Date.now() - new Date(state.currentRun.startedAt).getTime(),
        errorMessage: "The run was intentionally stopped before completion.",
        inputs: state.currentRun.inputs,
      };

      set((currentState) => ({
        currentRun: null,
        revisionsByStepId: {
          ...currentState.revisionsByStepId,
          [revision.stepId]: [
            revision,
            ...(currentState.revisionsByStepId[revision.stepId] ?? []),
          ],
        },
      }));

      persistState(storage, get());
    },
    toggleCompareRevision(revisionId) {
      set((state) => ({
        compareRevisionIds: clampCompareSelection(
          state.compareRevisionIds,
          revisionId,
        ),
      }));

      persistState(storage, get());
    },
    setHistorySheetOpen(open) {
      set((state) => ({
        layout: { ...state.layout, historySheetOpen: open },
      }));

      persistState(storage, get());
    },
    setStepSheetOpen(open) {
      set((state) => ({
        layout: { ...state.layout, stepSheetOpen: open },
      }));

      persistState(storage, get());
    },
    toggleRailCollapsed() {
      set((state) => ({
        layout: {
          ...state.layout,
          railCollapsed: !state.layout.railCollapsed,
        },
      }));

      persistState(storage, get());
    },
  }));
}

export const workspaceStore = createWorkspaceStore();

export function useWorkspaceStore<T>(selector: (state: WorkspaceState) => T) {
  return useStore(workspaceStore, selector);
}
