"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { StatusBadge } from "@/components/flowpilot/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getRecentSessions } from "@/lib/storage/workspace-storage";
import type { RecentSession, WorkflowTemplate } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";

export function RecentSessions({
  templates,
}: {
  templates: WorkflowTemplate[];
}) {
  const [sessions, setSessions] = useState<RecentSession[]>([]);

  useEffect(() => {
    const syncSessions = () => setSessions(getRecentSessions(templates));

    syncSessions();
    window.addEventListener("storage", syncSessions);

    return () => window.removeEventListener("storage", syncSessions);
  }, [templates]);

  if (sessions.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-border/80 bg-card/50 p-6 text-sm leading-7 text-muted-foreground">
        No local session history yet. Open a template, run a mock generation, and
        FlowPilot will keep a recent-work snapshot here.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {sessions.slice(0, 3).map((session) => (
        <article
          key={session.templateId}
          className="rounded-[26px] border border-border/70 bg-card/60 p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-kicker">Recent workspace</p>
              <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
                {session.templateName}
              </h3>
            </div>
            {session.lastRunStatus ? (
              <StatusBadge status={session.lastRunStatus} />
            ) : (
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-0.5 text-[11px] tracking-[0.14em] uppercase"
              >
                Draft only
              </Badge>
            )}
          </div>

          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p>Last step: {session.stepTitle}</p>
            <p>Revisions saved: {session.revisionCount}</p>
            <p>Opened {formatRelativeTime(session.lastOpenedAt)}</p>
          </div>

          <Link
            href={`/workspace/${session.templateId}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-5 w-full rounded-full text-[11px] tracking-[0.18em] uppercase",
            )}
          >
            Resume
            <ArrowUpRight className="size-4" />
          </Link>
        </article>
      ))}
    </div>
  );
}
