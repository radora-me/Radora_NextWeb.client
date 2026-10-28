"use client";

import { motion } from "framer-motion";
import { BookMarked, BookOpen, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLibraryAdminOverview, useIssues } from "@/features/library/services/library.service";

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className={`rounded-2xl border bg-card p-5 shadow-sm flex items-center gap-4`}>
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function LibrarianDashboard() {
  const { data: overview, isLoading } = useLibraryAdminOverview();
  const { data: activeIssues = [] } = useIssues({ status: "ISSUED" });

  const overdue = activeIssues.filter((i) => new Date(i.dueDate) < new Date());

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs font-medium text-amber-600">
          <BookMarked className="h-4 w-4" /> LIBRARY PORTAL
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of library activity and book circulation.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-2xl border bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BookMarked} label="Total Books"    value={overview?.totalBooks   ?? 0} color="bg-amber-500" />
          <StatCard icon={BookOpen}   label="Currently Issued" value={overview?.totalIssued ?? 0} color="bg-blue-500" />
          <StatCard icon={AlertTriangle} label="Overdue"     value={overview?.overdueCount ?? 0} color="bg-red-500" />
          <StatCard icon={Clock}      label="Active Issues"  value={activeIssues.length}          color="bg-emerald-500" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Issues */}
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="font-semibold">Recent Issues</h2>
            <Link href="/librarian-issues" className="flex items-center gap-1 text-xs text-amber-600 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {(overview?.recentIssues ?? []).slice(0, 6).map((issue) => (
              <div key={issue.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{issue.book.title}</p>
                  <p className="text-xs text-muted-foreground">{issue.student.name} · Roll {issue.student.rollNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Issued {fmt(issue.issuedAt)}</p>
                  <p className={`text-xs font-medium ${new Date(issue.dueDate) < new Date() ? "text-red-500" : "text-emerald-600"}`}>
                    Due {fmt(issue.dueDate)}
                  </p>
                </div>
              </div>
            ))}
            {(overview?.recentIssues ?? []).length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No issues yet.</p>
            )}
          </div>
        </div>

        {/* Overdue */}
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="font-semibold text-red-600">Overdue Books</h2>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">{overdue.length}</span>
          </div>
          <div className="divide-y">
            {overdue.slice(0, 6).map((issue) => (
              <div key={issue.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{issue.book.title}</p>
                  <p className="text-xs text-muted-foreground">{issue.student.name} · {issue.student.rollNumber}</p>
                </div>
                <p className="text-xs font-semibold text-red-500">
                  Due {fmt(issue.dueDate)}
                </p>
              </div>
            ))}
            {overdue.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No overdue books 🎉</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
