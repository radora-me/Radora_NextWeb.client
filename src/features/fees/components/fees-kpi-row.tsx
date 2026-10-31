"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoneyRounded } from "@/lib/format";
import type { FeeSummary } from "../lib/fee-selectors";

type FeesKpiRowProps = {
  summary: FeeSummary;
  isLoading: boolean;
};

export function FeesKpiRow({ summary, isLoading }: FeesKpiRowProps) {
  const cells = [
    { label: "Total invoiced", value: summary.invoiced },
    { label: "Collected", value: summary.collected },
    { label: "Outstanding", value: summary.outstanding },
  ];

  return (
    <Card className="grid grid-cols-1 gap-px overflow-hidden bg-border py-0 sm:grid-cols-3">
      {cells.map((cell) => (
        <div key={cell.label} className="bg-card px-4 py-4">
          <p className="text-xs text-muted-foreground">{cell.label}</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-7 w-28" />
          ) : (
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatMoneyRounded(cell.value)}
            </p>
          )}
        </div>
      ))}
    </Card>
  );
}
