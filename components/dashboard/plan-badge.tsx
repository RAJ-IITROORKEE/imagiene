import type { PlanType } from "@/lib/generated/prisma";

import { cn } from "@/lib/utils";

const planBadgeClass: Record<PlanType, string> = {
  FREE: "border-slate-300/70 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200",
  PRO: "border-cyan-300/70 bg-cyan-100 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-200",
  PREMIUM: "border-amber-300/80 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-200",
};

type PlanBadgeProps = {
  plan: PlanType;
  className?: string;
};

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]", planBadgeClass[plan], className)}>
      {plan}
    </span>
  );
}
