import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  GitCompareArrows,
  PanelLeft,
  Sparkles,
} from "lucide-react";

import { RecentSessions } from "@/components/flowpilot/recent-sessions";
import { TemplateGallery } from "@/components/flowpilot/template-gallery";
import { Badge } from "@/components/ui/badge";
import { workflowTemplates } from "@/lib/mocks/templates";

const featureNotes = [
  {
    title: "Complex state that stays readable",
    description:
      "Multiple panels coordinate step selection, prompt drafting, output status, revision compare, and local persistence without collapsing into prop soup.",
    icon: PanelLeft,
  },
  {
    title: "Mock streaming with believable failure paths",
    description:
      "The workspace simulates token streaming, retries, cancellations, and failure recovery so the UI can prove its async credibility.",
    icon: BrainCircuit,
  },
  {
    title: "Revision compare as a first-class surface",
    description:
      "Every run becomes a saved revision with side-by-side comparison, runtime metadata, and input snapshots for trust-focused review.",
    icon: GitCompareArrows,
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-[1400px] px-4 py-4 md:px-8 md:py-8">
      <section className="hero-grid overflow-hidden rounded-[40px] border border-border/70 bg-card/65 px-6 py-8 shadow-[0_30px_100px_rgba(15,31,47,0.12)] md:px-10 md:py-12">
        <div className="grid gap-10 xl:grid-cols-[1.1fr_minmax(320px,0.7fr)] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className="rounded-full border-primary/30 bg-background/70 px-3 py-1 text-[11px] tracking-[0.18em] uppercase"
              >
                Frontend-first SaaS portfolio build
              </Badge>
              <span className="section-kicker">Next.js 16 / Tailwind 4 / shadcn/ui</span>
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-semibold tracking-[-0.08em] text-foreground md:text-7xl">
              FlowPilot AI keeps workflow, prompt, output, and revision state in one sharp interface.
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
              This project is designed to showcase high-density frontend work:
              coordinated panels, async streaming states, local persistence, and
              revision compare that feels production-minded instead of gimmicky.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/workspace/${workflowTemplates[0].id}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-6 text-[11px] font-medium tracking-[0.2em] text-primary-foreground uppercase transition-opacity hover:opacity-90"
              >
                Launch default workspace
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="#templates"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-6 text-[11px] font-medium tracking-[0.2em] text-foreground uppercase transition-colors hover:bg-secondary/60"
              >
                Browse templates
              </Link>
            </div>
          </div>

          <div className="rounded-[34px] border border-border/70 bg-background/80 p-5">
            <div className="grid gap-4">
              {featureNotes.map((note) => {
                const Icon = note.icon;

                return (
                  <article
                    key={note.title}
                    className="rounded-[24px] border border-border/70 bg-card/75 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <h2 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
                        {note.title}
                      </h2>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {note.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div id="templates" className="space-y-5">
          <div>
            <p className="section-kicker">Template gallery</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-foreground md:text-4xl">
              Pick a workflow and stress-test the UI state model.
            </h2>
          </div>
          <TemplateGallery templates={workflowTemplates} />
        </div>

        <aside className="space-y-5">
          <div className="rounded-[30px] border border-border/70 bg-card/70 p-6">
            <p className="section-kicker">Why this project exists</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
              Built to prove frontend control under pressure.
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              <li>Multi-panel layout that remains usable across desktop and tablet.</li>
              <li>Local persistence for draft fields, selected step, and revision history.</li>
              <li>Streaming, cancel, retry, and failure branches with clear state messaging.</li>
            </ul>
          </div>

          <div className="rounded-[30px] border border-border/70 bg-card/70 p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-accent" />
              <p className="section-kicker">Recent sessions</p>
            </div>
            <div className="mt-4">
              <RecentSessions templates={workflowTemplates} />
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
