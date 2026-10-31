"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatMoney, formatMoneyCompact, formatMoneyRounded } from "@/lib/format";
import type { FinanceDialogVariant } from "./finance-record-dialog";

const collectionsChartConfig: ChartConfig = {
  collections: { label: "Collections", color: "var(--color-chart-1)" },
  expenses: { label: "Expenses", color: "var(--color-chart-4)" },
};

const kpiCells = [
  { key: "collected", label: "Collected" },
  { key: "outstanding", label: "Outstanding" },
  { key: "expenses", label: "Expenses" },
  { key: "netCash", label: "Net cash" },
] as const;

type FinanceDashboardProps = {
  data: any;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onAction: (variant: FinanceDialogVariant) => void;
};

export function FinanceDashboard({
  data,
  isLoading,
  isError,
  onRetry,
  onAction,
}: FinanceDashboardProps) {
  const kpis = data?.kpis;
  const recommendations: any[] = data?.recommendations ?? [];
  const recent: any[] = data?.recent ?? [];

  const trend = useMemo(
    () =>
      (data?.trend ?? []).map((point: any) => ({
        month: point?.month ?? "",
        collections: Number(point?.income ?? 0),
        expenses: Number(point?.expenses ?? 0),
      })),
    [data?.trend]
  );

  return (
    <div className="space-y-4">
      <Card className="grid grid-cols-2 gap-px overflow-hidden bg-border py-0 lg:grid-cols-4">
        {kpiCells.map(({ key, label }) => (
          <div key={key} className="bg-card px-4 py-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-7 w-24" />
            ) : (
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {isError || kpis?.[key] == null
                  ? "—"
                  : formatMoneyRounded(kpis[key])}
              </p>
            )}
          </div>
        ))}
      </Card>

      {isError ? (
        <div className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
          <p className="text-muted-foreground">Unable to load the finance snapshot.</p>
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Collections vs expenses</CardTitle>
            <CardDescription>Last six completed periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
              <Button size="sm" onClick={() => onAction("invoice")}>
                <Plus aria-hidden="true" />
                Invoice
              </Button>
              <Button variant="outline" size="sm" onClick={() => onAction("payment")}>
                <Plus aria-hidden="true" />
                Payment
              </Button>
            </div>
            {isLoading ? (
              <Skeleton className="h-[240px] w-full" />
            ) : trend.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No periods returned.
              </p>
            ) : (
              <ChartContainer
                config={collectionsChartConfig}
                className="aspect-auto h-[240px] w-full"
              >
                <BarChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={11}
                  />
                  <YAxis
                    width={58}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={6}
                    fontSize={11}
                    tickFormatter={(value) => formatMoneyCompact(Number(value))}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div className="flex w-full items-center justify-between gap-6">
                            <span className="text-muted-foreground">{name}</span>
                            <span className="font-medium tabular-nums text-foreground">
                              {formatMoney(Number(value))}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="collections" fill="var(--color-collections)" radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} maxBarSize={22} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Finance intelligence</CardTitle>
          </CardHeader>
          <CardContent className="min-h-0">
            {recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recommendations returned.
              </p>
            ) : (
              <ul className="max-h-[232px] divide-y divide-border overflow-y-auto">
                {recommendations.map((item, index) => (
                  <li key={`${item?.title ?? "item"}-${index}`} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-medium">{item?.title}</p>
                    {item?.detail ? (
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {item.detail}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="recent-finance-activity">
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 id="recent-finance-activity" className="text-sm font-medium">
              Recent finance activity
            </h2>
            <span className="text-xs tabular-nums text-muted-foreground">
              {recent.length} records
            </span>
          </div>
          {isLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Reference</TableHead>
                  <TableHead className="px-4">Kind</TableHead>
                  <TableHead className="px-4">Date</TableHead>
                  <TableHead className="px-4 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                      No activity returned.
                    </TableCell>
                  </TableRow>
                ) : (
                  recent.map((item, index) => (
                    <TableRow key={`${item?.reference ?? "record"}-${index}`}>
                      <TableCell className="px-4 py-2.5 font-medium">
                        {item?.reference ?? "—"}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-muted-foreground">
                        {item?.kind ?? "—"}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-muted-foreground">
                        {formatDate(item?.date)}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-right tabular-nums">
                        {formatMoney(item?.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </div>
  );
}
