import type {
  SimulationMode,
  WorkflowStep,
  WorkflowTemplate,
} from "@/lib/types";

type StreamGenerationOptions = {
  template: WorkflowTemplate;
  step: WorkflowStep;
  values: Record<string, string>;
  mode: SimulationMode;
  attempt: number;
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
  chunkDelayMs?: number;
};

async function wait(delay: number, signal?: AbortSignal) {
  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => resolve(), delay);

    if (!signal) {
      return;
    }

    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException("Canceled", "AbortError"));
      },
      { once: true },
    );
  });
}

function formatFields(values: Record<string, string>) {
  return Object.entries(values)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
}

export function buildSimulatedOutput({
  template,
  step,
  values,
  attempt,
}: Pick<StreamGenerationOptions, "template" | "step" | "values" | "attempt">) {
  const intro =
    attempt > 1
      ? `Revision ${attempt} recalibrates the ${step.title.toLowerCase()} for ${template.audience.toLowerCase()}.`
      : `This ${step.outputLabel.toLowerCase()} translates the current workflow state into a clearer operational draft for ${template.audience.toLowerCase()}.`;

  const guidance = step.seededOutput.map((line) => `- ${line}`).join("\n");
  const fields = formatFields(values);

  return [
    intro,
    "",
    "Current context",
    fields,
    "",
    "Output framing",
    guidance,
    "",
    `${step.outputLabel}`,
    `${step.summary} The response should stay concrete, readable, and ready for revision compare.`,
    "",
    "Operator note: keep the tone aligned with the latest workflow intent and make the next handoff obvious.",
  ].join("\n");
}

export async function streamSimulatedGeneration({
  template,
  step,
  values,
  mode,
  attempt,
  signal,
  onChunk,
  chunkDelayMs = 28,
}: StreamGenerationOptions) {
  const finalOutput = buildSimulatedOutput({ template, step, values, attempt });
  const chunks = finalOutput.match(/\S+\s*/g) ?? [finalOutput];

  for (const [index, chunk] of chunks.entries()) {
    if (signal?.aborted) {
      throw new DOMException("Canceled", "AbortError");
    }

    await wait(
      chunkDelayMs === 0 ? 0 : chunkDelayMs + (index % 4) * 10,
      signal,
    );
    onChunk(chunk);

    if (mode === "failure" && index >= Math.floor(chunks.length * 0.55)) {
      throw new Error(
        "The mock model stream stalled while reconciling the final structured output.",
      );
    }
  }

  return finalOutput;
}
