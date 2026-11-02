"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  BookOpen,
  Clock3,
  LibraryBig,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIssues, useLibraryAdminOverview } from "@/features/library/services/library.service";

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  detail: string;
  tone: string;
}) {
  return (
    <Card className="overflow-hidden border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className={`rounded-xl p-3 ${tone}`}>
          <Icon aria-hidden="true" className="size-5 text-white" />
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function LibrarianDashboard() {
  const {
    data: overview,
    isLoading: overviewLoading,
    isError: overviewError,
  } = useLibraryAdminOverview();
  const {
    data: activeIssues = [],
    isLoading: issuesLoading,
    isError: issuesError,
  } = useIssues({ status: "ISSUED" });

  const overdue = activeIssues.filter((issue) => new Date(issue.dueDate) < new Date());
  const isLoading = overviewLoading || issuesLoading;

  return (
    <motion.div
      className="mx-auto w-full max-w-7xl space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Library dashboard"
        description="A clear overview of your collection, circulation, and current returns."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/librarian-books" className={buttonVariants({ variant: "outline", className: "gap-2" })}>
              <BookMarked className="size-4" /> Manage books
            </Link>
            <Link href="/librarian-issues" className={buttonVariants({ className: "gap-2" })}>
              Issue or return <ArrowRight className="size-4" />
            </Link>
          </div>
        }
      />

      {overviewError && (
        <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Library overview could not be loaded. Refresh the page to try again.
        </div>
      )}

      <section aria-label="Library statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }, (_, index) => (
            <Card key={index} className="border-border/70 shadow-sm">
              <CardContent className="space-y-3 p-5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <MetricCard icon={LibraryBig} label="Total books" value={overview?.totalBooks ?? 0} detail="In the library registry" tone="bg-amber-500" />
            <MetricCard icon={BookOpen} label="Currently issued" value={overview?.totalIssued ?? 0} detail="Books with active loans" tone="bg-blue-500" />
            <MetricCard icon={AlertTriangle} label="Overdue returns" value={overview?.overdueCount ?? overdue.length} detail="Need follow-up" tone="bg-rose-500" />
            <MetricCard icon={Clock3} label="Active issues" value={issuesError ? "—" : activeIssues.length} detail="Currently in circulation" tone="bg-emerald-500" />
          </>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]">
        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4 border-b bg-muted/20 px-5 py-4">
            <div>
              <CardTitle className="text-base">Recent circulation</CardTitle>
              <CardDescription className="mt-1">The latest books checked out by students.</CardDescription>
            </div>
            <Link href="/librarian-issues" className={buttonVariants({ variant: "ghost", size: "sm", className: "shrink-0 gap-1 text-primary" })}>
              View all <ArrowUpRight className="size-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {overviewLoading ? (
              <div className="space-y-4 p-5">
                {[0, 1, 2].map((index) => <Skeleton key={index} className="h-12 w-full" />)}
              </div>
            ) : overviewError ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">Recent issues are unavailable right now.</p>
            ) : (overview?.recentIssues ?? []).length ? (
              <div className="divide-y">
                {overview?.recentIssues.slice(0, 6).map((issue) => {
                  const isOverdue = new Date(issue.dueDate) < new Date();
                  return (
                    <div key={issue.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                          <BookMarked className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{issue.book.title}</p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{issue.student.name} · Roll {issue.student.rollNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 pl-[52px] sm:justify-end sm:pl-0">
                        <span className="text-xs text-muted-foreground">Issued {formatDate(issue.issuedAt)}</span>
                        <Badge variant={isOverdue ? "destructive" : "secondary"} className="whitespace-nowrap">
                          Due {formatDate(issue.dueDate)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <BookOpen className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-medium">No recent issues</p>
                <p className="mt-1 text-xs text-muted-foreground">New checkouts will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="border-b bg-muted/20 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Overdue returns</CardTitle>
                <CardDescription className="mt-1">Items past their return date.</CardDescription>
              </div>
              <Badge variant={overdue.length ? "destructive" : "secondary"}>{issuesError ? "—" : overdue.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {issuesLoading ? (
              <div className="space-y-4 p-5">{[0, 1, 2].map((index) => <Skeleton key={index} className="h-12 w-full" />)}</div>
            ) : issuesError ? (
              <p role="alert" className="px-5 py-10 text-center text-sm text-muted-foreground">Overdue items could not be loaded.</p>
            ) : overdue.length ? (
              <div className="divide-y">
                {overdue.slice(0, 5).map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{issue.book.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{issue.student.name} · {issue.student.rollNumber}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-destructive">Due {formatDate(issue.dueDate)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <Clock3 className="mx-auto size-8 text-emerald-500/70" />
                <p className="mt-3 text-sm font-medium">All returns are on track</p>
                <p className="mt-1 text-xs text-muted-foreground">No overdue books at the moment.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </motion.div>
  );
}
