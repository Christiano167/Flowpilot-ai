import { describe, expect, it } from "vitest";

import type { WorkspaceSnapshotStorage } from "@/lib/storage/workspace-storage";
import { workflowTemplates } from "@/lib/mocks/templates";
import { createWorkspaceStore } from "@/stores/workspace-store";

function createMemoryStorage(): WorkspaceSnapshotStorage {
  const snapshots = {} as Record<string, unknown>;

  return {
    load(templateId) {
      return (snapshots[templateId] as never) ?? null;
    },
    save(templateId, snapshot) {
      snapshots[templateId] = snapshot;
    },
    list() {
      return snapshots as never;
    },
  };
}

describe("workspace store", () => {
  it("hydrates defaults and preserves per-step drafts", () => {
    const store = createWorkspaceStore(createMemoryStorage());
    const template = workflowTemplates[0];

    store.getState().hydrateTemplate(template);
    store.getState().updateField("tone", "Measured and explicit");
    store.getState().selectStep(template.steps[1].id);
    store.getState().updateField("goal", "Protect trust and clarify next checkpoint.");
    store.getState().selectStep(template.steps[0].id);

    expect(store.getState().draftsByStepId[template.steps[0].id].tone).toBe(
      "Measured and explicit",
    );
    expect(store.getState().draftsByStepId[template.steps[1].id].goal).toBe(
      "Protect trust and clarify next checkpoint.",
    );
  });

  it("creates success revisions from an active run", () => {
    const store = createWorkspaceStore(createMemoryStorage());
    const template = workflowTemplates[0];
    const step = template.steps[0];

    store.getState().hydrateTemplate(template);
    store.getState().startRun(step, "success");
    store.getState().appendChunk("Partial streamed output.");
    store.getState().finishRun();

    expect(store.getState().currentRun).toBeNull();
    expect(store.getState().revisionsByStepId[step.id][0]?.status).toBe(
      "success",
    );
  });

  it("creates canceled revisions when a run is stopped", () => {
    const store = createWorkspaceStore(createMemoryStorage());
    const template = workflowTemplates[0];
    const step = template.steps[0];

    store.getState().hydrateTemplate(template);
    store.getState().startRun(step, "success");
    store.getState().appendChunk("Partial");
    store.getState().cancelRun();

    expect(store.getState().revisionsByStepId[step.id][0]?.status).toBe(
      "canceled",
    );
  });
});
