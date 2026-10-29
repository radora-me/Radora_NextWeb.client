"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, BookMarked, AlertTriangle, CheckCircle2,
  Clock, Search, Loader2, AlertCircle,
} from "lucide-react";
import { useStudentLibrary } from "@/features/library/services/library.service";
import type { BookIssueRecord } from "@/types/api.types";

const STATUS_COLOR: Record<string, string> = {
  ISSUED:   "bg-blue-100 text-blue-700",
  RETURNED: "bg-emerald-100 text-emerald-700",
  OVERDUE:  "bg-red-100 text-red-700",
  LOST:     "bg-slate-100 text-slate-600",
};

function fmt(d: string) {
  return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm flex items-center gap-4">
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

export function StudentLibraryPage() {
  const { data, isLoading, isError } = useStudentLibrary();
  const [tab, setTab] = useState<"ALL" | "ISSUED" | "RETURNED">("ALL");
  const [search, setSearch] = useState("");

  const issues = data?.issues ?? [];

  const filtered = issues.filter((i) => {
    const matchesTab = tab === "ALL" || i.status === tab;
    const matchesSearch =
      !search ||
      i.book.title.toLowerCase().includes(search.toLowerCase()) ||
      i.book.bookId.toLowerCase().includes(search.toLowerCase()) ||
      (i.book.author || "").toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs font-medium text-indigo-600">
          <BookMarked className="h-4 w-4" /> MY LIBRARY
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your issued books, due dates, and return history.</p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl border bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={BookOpen}        label="Currently Issued"  value={data?.currentlyIssued ?? 0}  color="bg-blue-500" />
          <StatCard icon={AlertTriangle}   label="Overdue"           value={data?.overdueCount ?? 0}     color="bg-red-500" />
          <StatCard icon={CheckCircle2}    label="Total Returned"    value={data?.totalReturned ?? 0}    color="bg-emerald-500" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, author…"
            className="h-9 w-56 rounded-lg border bg-background pl-9 pr-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>
        <div className="flex gap-1.5">
          {(["ALL", "ISSUED", "RETURNED"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${tab === t ? "bg-indigo-500 text-white" : "border hover:bg-muted"}`}>
              {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl border bg-muted animate-pulse" />)}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">Failed to load your library data. Please refresh.</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-muted-foreground">
          <BookOpen className="h-12 w-12 mb-3 text-slate-300" />
          <p className="font-medium">{search || tab !== "ALL" ? "No matching records" : "No books issued to you yet"}</p>
          {!search && tab === "ALL" && <p className="text-sm mt-1">Books issued by the librarian will appear here.</p>}
        </div>
      )}

      {/* Issue list */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((issue) => {
            const isOverdue = issue.status === "ISSUED" && new Date(issue.dueDate) < new Date();
            const daysLeft = Math.ceil((new Date(issue.dueDate).getTime() - Date.now()) / 86400000);
            return (
              <div key={issue.id} className="rounded-xl border bg-card shadow-sm px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{issue.book.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${isOverdue ? "bg-red-100 text-red-700" : STATUS_COLOR[issue.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {isOverdue ? "OVERDUE" : issue.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {issue.book.author || "Unknown author"} · ID: {issue.book.bookId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Issued: {fmt(issue.issuedAt)} · Due: {fmtDate(issue.dueDate)}
                    {issue.returnedAt && ` · Returned: ${fmt(issue.returnedAt)}`}
                  </p>
                  {issue.notes && (
                    <p className="text-xs text-muted-foreground italic mt-0.5">Note: {issue.notes}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {issue.status === "ISSUED" && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? "text-red-500" : daysLeft <= 3 ? "text-amber-500" : "text-emerald-600"}`}>
                      <Clock className="h-3.5 w-3.5" />
                      {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                    </div>
                  )}
                  {issue.issuedBy && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">By: {issue.issuedBy.name}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
