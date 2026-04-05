export type OutputStatus =
  | "idle"
  | "streaming"
  | "success"
  | "error"
  | "canceled";

export type SimulationMode = "success" | "failure";

export type PromptField = {
  id: string;
  label: string;
  kind: "input" | "textarea";
  placeholder: string;
  description: string;
  defaultValue?: string;
  rows?: number;
};

export type PromptVariable = {
  id: string;
  token: string;
  label: string;
  sample: string;
};

export type WorkflowStep = {
  id: string;
  title: string;
  summary: string;
  purpose: string;
  outputLabel: string;
  estimatedMinutes: number;
  fields: PromptField[];
  variables: PromptVariable[];
  seededOutput: string[];
};

export type WorkflowTemplate = {
  id: string;
  name: string;
  audience: string;
  summary: string;
  description: string;
  accent: string;
  tags: string[];
  estimatedMinutes: number;
  steps: WorkflowStep[];
};

export type GenerationRun = {
  id: string;
  templateId: string;
  stepId: string;
  stepTitle: string;
  status: Extract<OutputStatus, "streaming">;
  mode: SimulationMode;
  label: string;
  content: string;
  startedAt: string;
  inputs: Record<string, string>;
};

export type RevisionRecord = {
  id: string;
  templateId: string;
  stepId: string;
  stepTitle: string;
  label: string;
  status: Exclude<OutputStatus, "idle" | "streaming">;
  mode: SimulationMode | "canceled";
  content: string;
  createdAt: string;
  durationMs?: number;
  errorMessage?: string;
  inputs: Record<string, string>;
};

export type WorkspaceLayoutState = {
  historySheetOpen: boolean;
  stepSheetOpen: boolean;
  railCollapsed: boolean;
};

export type WorkspaceSnapshot = {
  activeStepId: string;
  draftsByStepId: Record<string, Record<string, string>>;
  revisionsByStepId: Record<string, RevisionRecord[]>;
  compareRevisionIds: string[];
  layout: WorkspaceLayoutState;
  lastOpenedAt: string;
};

export type RecentSession = {
  templateId: string;
  templateName: string;
  stepTitle: string;
  lastOpenedAt: string;
  lastRunStatus: Exclude<OutputStatus, "idle" | "streaming"> | null;
  revisionCount: number;
};
