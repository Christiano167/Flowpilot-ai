import { Badge } from "@/components/ui/badge";
import type { OutputStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusLabels: Record<Exclude<OutputStatus, "idle">, string> = {
  streaming: "Streaming",
  success: "Ready",
  error: "Failed",
  canceled: "Canceled",
};

const statusClasses: Record<Exclude<OutputStatus, "idle">, string> = {
  streaming:
    "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  success:
    "border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-200",
  error:
    "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-200",
  canceled:
    "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200",
};

export function StatusBadge({
  status,
  className,
}: {
  status: Exclude<OutputStatus, "idle">;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-[11px] tracking-[0.14em] uppercase",
        statusClasses[status],
        className,
      )}
    >
      {statusLabels[status]}
    </Badge>
  );
}
