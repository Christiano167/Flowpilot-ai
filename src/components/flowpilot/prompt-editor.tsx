"use client";

import { useDeferredValue } from "react";

import { PanelShell } from "@/components/flowpilot/panel-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { WorkflowStep } from "@/lib/types";

function buildResolvedPrompt(step: WorkflowStep, values: Record<string, string>) {
  const sections = step.fields.map((field) => {
    const value = values[field.id]?.trim() || "(not provided yet)";
    return `${field.label}\n${value}`;
  });

  const variables = step.variables
    .map((item) => `${item.token} => ${item.sample}`)
    .join("\n");

  return [
    `You are preparing the ${step.outputLabel.toLowerCase()} for ${step.title}.`,
    "",
    step.purpose,
    "",
    "Inputs",
    sections.join("\n\n"),
    "",
    "Variable glossary",
    variables || "No variables required for this step.",
  ].join("\n");
}

type PromptEditorProps = {
  step: WorkflowStep;
  values: Record<string, string>;
  onValueChange: (fieldId: string, value: string) => void;
};

export function PromptEditor({
  step,
  values,
  onValueChange,
}: PromptEditorProps) {
  const deferredPrompt = useDeferredValue(buildResolvedPrompt(step, values));

  return (
    <PanelShell
      eyebrow="Editor"
      title={step.title}
      description={step.purpose}
      bodyClassName="p-0"
    >
      <Tabs defaultValue="editor" className="h-full">
        <div className="border-b border-border/70 px-5 py-3">
          <TabsList variant="line" className="gap-3 p-0">
            <TabsTrigger value="editor" className="px-0 pb-2">
              Input controls
            </TabsTrigger>
            <TabsTrigger value="prompt-preview" className="px-0 pb-2">
              Resolved prompt
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="editor" className="h-full outline-none">
          <ScrollArea className="h-[34rem] px-5 py-5 lg:h-[43rem]">
            <Accordion multiple defaultValue={["fields", "variables"]}>
              <AccordionItem value="fields">
                <AccordionTrigger>Instruction block</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {step.fields.map((field) => (
                    <label key={field.id} className="block space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-foreground">
                            {field.label}
                          </span>
                          <Badge
                            variant="outline"
                            className="rounded-full px-2.5 py-0.5 text-[11px] tracking-[0.14em] uppercase"
                          >
                            {field.kind}
                          </Badge>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {field.description}
                        </p>
                      </div>

                      {field.kind === "textarea" ? (
                        <Textarea
                          value={values[field.id] ?? ""}
                          onChange={(event) =>
                            onValueChange(field.id, event.target.value)
                          }
                          rows={field.rows ?? 5}
                          placeholder={field.placeholder}
                          className="min-h-28 rounded-[20px] border-border/80 bg-background/70"
                        />
                      ) : (
                        <Input
                          value={values[field.id] ?? ""}
                          onChange={(event) =>
                            onValueChange(field.id, event.target.value)
                          }
                          placeholder={field.placeholder}
                          className="rounded-[20px] border-border/80 bg-background/70"
                        />
                      )}
                    </label>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="variables">
                <AccordionTrigger>Variable library</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {step.variables.map((variable) => (
                      <div
                        key={variable.id}
                        className="rounded-[20px] border border-border/70 bg-background/70 p-4"
                      >
                        <p className="section-kicker">{variable.label}</p>
                        <p className="mt-2 font-mono text-sm text-foreground">
                          {variable.token}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Example: {variable.sample}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="review">
                <AccordionTrigger>Run checklist</AccordionTrigger>
                <AccordionContent>
                  <div className="rounded-[22px] border border-border/70 bg-secondary/35 p-4">
                    <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                      <li>Keep the primary objective obvious in the first sentence.</li>
                      <li>Use factual context instead of speculative filler.</li>
                      <li>Retry if the draft loses ownership, clarity, or next-step specificity.</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="prompt-preview" className="h-full outline-none">
          <ScrollArea className="h-[34rem] px-5 py-5 font-mono text-sm leading-7 lg:h-[43rem]">
            <pre className="editor-grid overflow-x-auto rounded-[26px] border border-border/70 p-5 text-wrap text-foreground">
              <code>{deferredPrompt}</code>
            </pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </PanelShell>
  );
}
