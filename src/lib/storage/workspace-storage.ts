import type {
  RecentSession,
  RevisionRecord,
  WorkflowTemplate,
  WorkspaceSnapshot,
} from "@/lib/types";

const STORAGE_KEY = "flowpilot-workspace-v1";

export type WorkspaceSnapshotStorage = {
  load: (templateId: string) => WorkspaceSnapshot | null;
  save: (templateId: string, snapshot: WorkspaceSnapshot) => void;
  list: () => Record<string, WorkspaceSnapshot>;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function readAllSnapshots() {
  if (!isBrowser()) {
    return {} as Record<string, WorkspaceSnapshot>;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {} as Record<string, WorkspaceSnapshot>;
  }

  try {
    return JSON.parse(raw) as Record<string, WorkspaceSnapshot>;
  } catch {
    return {} as Record<string, WorkspaceSnapshot>;
  }
}

function writeAllSnapshots(snapshots: Record<string, WorkspaceSnapshot>) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
}

export const browserWorkspaceStorage: WorkspaceSnapshotStorage = {
  load(templateId) {
    return readAllSnapshots()[templateId] ?? null;
  },
  save(templateId, snapshot) {
    const nextSnapshots = readAllSnapshots();
    nextSnapshots[templateId] = snapshot;
    writeAllSnapshots(nextSnapshots);
  },
  list() {
    return readAllSnapshots();
  },
};

function getLatestRevision(snapshot: WorkspaceSnapshot): RevisionRecord | null {
  const revisions = Object.values(snapshot.revisionsByStepId).flat();

  return revisions
    .slice()
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    )[0] ?? null;
}

export function getRecentSessions(templates: WorkflowTemplate[]) {
  const snapshots = browserWorkspaceStorage.list();
  const templateMap = new Map(templates.map((template) => [template.id, template]));

  return Object.entries(snapshots)
    .map(([templateId, snapshot]): RecentSession | null => {
      const template = templateMap.get(templateId);

      if (!template) {
        return null;
      }

      const latestRevision = getLatestRevision(snapshot);
      const revisionCount = Object.values(snapshot.revisionsByStepId).reduce(
        (count, revisions) => count + revisions.length,
        0,
      );
      const stepTitle =
        template.steps.find((step) => step.id === snapshot.activeStepId)?.title ??
        template.steps[0]?.title ??
        "Untitled step";

      return {
        templateId,
        templateName: template.name,
        stepTitle,
        lastOpenedAt: snapshot.lastOpenedAt,
        lastRunStatus: latestRevision?.status ?? null,
        revisionCount,
      };
    })
    .filter((session): session is RecentSession => session !== null)
    .sort(
      (left, right) =>
        new Date(right.lastOpenedAt).getTime() -
        new Date(left.lastOpenedAt).getTime(),
    );
}
