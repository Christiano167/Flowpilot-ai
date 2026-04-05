import { describe, expect, it, vi } from "vitest";

import { workflowTemplates } from "@/lib/mocks/templates";
import {
  buildSimulatedOutput,
  streamSimulatedGeneration,
} from "@/lib/simulators/generation";

describe("generation simulator", () => {
  const template = workflowTemplates[0];
  const step = template.steps[0];
  const values = {
    ticketSummary: "Payments are blocked after verification reset.",
    customerContext: "Enterprise account with renewal next week.",
    tone: "Calm and direct",
  };

  it("builds deterministic output from step and values", () => {
    const output = buildSimulatedOutput({
      template,
      step,
      values,
      attempt: 1,
    });

    expect(output).toContain("Payments are blocked");
    expect(output).toContain(step.outputLabel);
    expect(output.toLowerCase()).toContain(template.audience.toLowerCase());
  });

  it("streams a success path", async () => {
    const chunks: string[] = [];
    const onChunk = vi.fn((chunk: string) => chunks.push(chunk));

    const output = await streamSimulatedGeneration({
      template,
      step,
      values,
      mode: "success",
      attempt: 2,
      onChunk,
      chunkDelayMs: 0,
    });

    expect(onChunk).toHaveBeenCalled();
    expect(chunks.join("")).toBe(output);
    expect(output).toContain("Revision 2");
  }, 15000);

  it("throws a stable failure after partial output", async () => {
    const chunks: string[] = [];

    await expect(
      streamSimulatedGeneration({
        template,
        step,
        values,
        mode: "failure",
        attempt: 1,
        onChunk: (chunk) => chunks.push(chunk),
        chunkDelayMs: 0,
      }),
    ).rejects.toThrow("mock model stream stalled");

    expect(chunks.length).toBeGreaterThan(0);
  });
});
