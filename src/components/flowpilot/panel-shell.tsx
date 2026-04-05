import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PanelShellProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function PanelShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: PanelShellProps) {
  return (
    <section
      className={cn(
        "panel-surface flex h-full flex-col overflow-hidden rounded-[28px] border border-border/70",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 px-5 py-4">
        <div className="space-y-1">
          <p className="section-kicker">{eyebrow}</p>
          <div>
            <h2 className="font-sans text-lg font-semibold tracking-[-0.03em] text-foreground">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </header>
      <div className={cn("flex-1 p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
