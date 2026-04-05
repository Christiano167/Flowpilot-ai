import Link from "next/link";
import { ArrowRight, Clock3, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { WorkflowTemplate } from "@/lib/types";

export function TemplateGallery({
  templates,
}: {
  templates: WorkflowTemplate[];
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      {templates.map((template, index) => (
        <article
          key={template.id}
          className="group relative overflow-hidden rounded-[30px] border border-border/70 bg-card/70 p-6 shadow-[0_24px_80px_rgba(15,31,47,0.08)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-accent to-transparent" />
          <div className="flex items-center justify-between gap-3">
            <Badge
              variant="outline"
              className="rounded-full border-border/80 bg-background/70 px-2.5 py-0.5 text-[11px] tracking-[0.16em] uppercase"
            >
              0{index + 1}
            </Badge>
            <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
              {template.accent} system
            </span>
          </div>

          <div className="mt-6">
            <p className="section-kicker">{template.audience}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
              {template.name}
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {template.summary}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] tracking-[0.14em] uppercase"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 rounded-[24px] border border-border/70 bg-background/75 p-4">
            <div>
              <span className="section-kicker">Steps</span>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {template.steps.length}
              </p>
            </div>
            <div>
              <span className="section-kicker">Runtime</span>
              <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Clock3 className="size-4 text-primary" />
                {template.estimatedMinutes}m
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-accent" />
              Mock streaming and revision compare
            </p>
            <Link
              href={`/workspace/${template.id}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-4 text-[11px] font-medium tracking-[0.18em] text-primary-foreground uppercase transition-opacity hover:opacity-90"
            >
              Open
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
