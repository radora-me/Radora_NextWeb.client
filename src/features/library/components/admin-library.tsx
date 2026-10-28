"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookMarked, Users, Plus, Trash2, X, Loader2, AlertCircle,
  BookOpen, AlertTriangle, Search, QrCode, Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  useLibraryAdminOverview, useAdminIssues, useBooks,
  useLibrarians, useCreateLibrarian, useDeleteLibrarian,
} from "@/features/library/services/library.service";
import type { BookIssueRecord, LibrarianProfile } from "@/types/api.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function fmt(d: string) {
  return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_COLOR: Record<string, string> = {
  ISSUED:   "bg-blue-100 text-blue-700",
  RETURNED: "bg-emerald-100 text-emerald-700",
  OVERDUE:  "bg-red-100 text-red-700",
  LOST:     "bg-slate-100 text-slate-600",
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm flex items-center gap-4">
      <div className={`rounded-xl p-3 ${color}`}><Icon className="h-5 w-5 text-white" /></div>
      <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
    </div>
  );
}

// ── Create Librarian Modal ────────────────────────────────────────────────────
function CreateLibrarianModal({ onClose }: { onClose: () => void }) {
  const create = useCreateLibrarian();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(form, {
      onSuccess: () => { toast.success("Librarian account created!"); onClose(); },
      onError: (err: any) => toast.error(err.message),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Create Librarian Account</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Full Name *</label>
            <input required value={form.name} onChange={set("name")} placeholder="Librarian name"
              className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email *</label>
            <input required type="email" value={form.email} onChange={set("email")} placeholder="librarian@school.com"
              className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Password *</label>
            <input required type="password" value={form.password} onChange={set("password")} placeholder="Min 6 characters"
              className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
          </div>
          <p className="text-xs text-muted-foreground">The librarian will use their email and this password to log in.</p>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={create.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60">
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {create.isPending ? "Creating…" : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── QR View Modal ─────────────────────────────────────────────────────────────
function QRViewModal({ qrCode, title, bookId, onClose }: { qrCode: string; title: string; bookId: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={onClose}>
      <div className="w-full max-w-xs rounded-2xl bg-card p-6 shadow-2xl flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between w-full">
          <h2 className="font-semibold">QR Code</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <img src={qrCode} alt="QR" className="w-52 h-52 rounded-xl border p-2 bg-white" />
        <div className="text-center"><p className="font-semibold">{title}</p><p className="text-xs text-muted-foreground">ID: {bookId}</p></div>
        <button onClick={() => { const a = document.createElement("a"); a.href = qrCode; a.download = `QR-${bookId}.png`; a.click(); }}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-muted w-full justify-center">
          <Download className="h-4 w-4" /> Download QR
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminLibraryPage() {
  const { data: overview, isLoading: ovLoading } = useLibraryAdminOverview();
  const { data: allIssues = [], isLoading: issLoading } = useAdminIssues();
  const { data: books = [], isLoading: bkLoading } = useBooks();
  const { data: librarians = [], isLoading: libLoading } = useLibrarians();
  const delLib = useDeleteLibrarian();

  const [showCreate, setShowCreate] = useState(false);
  const [qrBook, setQrBook] = useState<{ qrCode: string; title: string; bookId: string } | null>(null);
  const [issueSearch, setIssueSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");

  const filteredIssues = allIssues.filter((i) =>
    !issueSearch ||
    i.book.title.toLowerCase().includes(issueSearch.toLowerCase()) ||
    i.student.name.toLowerCase().includes(issueSearch.toLowerCase()) ||
    i.student.rollNumber.includes(issueSearch),
  );

  const filteredBooks = books.filter((b) =>
    !bookSearch ||
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.bookId.toLowerCase().includes(bookSearch.toLowerCase()),
  );

  const overdue = allIssues.filter((i) => i.status === "ISSUED" && new Date(i.dueDate) < new Date());

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {showCreate && <CreateLibrarianModal onClose={() => setShowCreate(false)} />}
      {qrBook && <QRViewModal {...qrBook} onClose={() => setQrBook(null)} />}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-primary">
            <BookMarked className="h-4 w-4" /> LIBRARY MANAGEMENT
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">Full overview of books, issues, and librarian accounts.</p>
        </div>
      </div>

      {/* Stats */}
      {ovLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-24 rounded-2xl border bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BookMarked}    label="Total Books"      value={overview?.totalBooks   ?? 0} color="bg-amber-500" />
          <StatCard icon={BookOpen}      label="Currently Issued" value={overview?.totalIssued  ?? 0} color="bg-blue-500" />
          <StatCard icon={AlertTriangle} label="Overdue"          value={overview?.overdueCount ?? 0} color="bg-red-500" />
          <StatCard icon={Users}         label="Librarians"       value={librarians.length}           color="bg-indigo-500" />
        </div>
      )}

      <Tabs defaultValue="issues">
        <TabsList>
          <TabsTrigger value="issues">All Issues</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdue.length})</TabsTrigger>
          <TabsTrigger value="books">Books & QR</TabsTrigger>
          <TabsTrigger value="librarians">Librarians</TabsTrigger>
        </TabsList>

        {/* ── All Issues ── */}
        <TabsContent value="issues" className="mt-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={issueSearch} onChange={(e) => setIssueSearch(e.target.value)} placeholder="Search book, student…"
              className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none ring-primary focus:ring-2" />
          </div>
          {issLoading ? (
            <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl border bg-muted animate-pulse" />)}</div>
          ) : filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-muted-foreground">
              <BookOpen className="h-10 w-10 mb-3 text-slate-300" /><p>No issue records found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredIssues.map((issue) => {
                const isOverdue = issue.status === "ISSUED" && new Date(issue.dueDate) < new Date();
                return (
                  <div key={issue.id} className="rounded-xl border bg-card px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{issue.book.title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${isOverdue ? "bg-red-100 text-red-700" : STATUS_COLOR[issue.status] ?? ""}`}>
                          {isOverdue ? "OVERDUE" : issue.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {issue.student.name} · Roll {issue.student.rollNumber}
                        {issue.student.className && ` · ${issue.student.className}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Issued: {fmt(issue.issuedAt)} · Due: {fmtDate(issue.dueDate)}
                        {issue.returnedAt && ` · Returned: ${fmt(issue.returnedAt)}`}
                        {issue.issuedBy && ` · By: ${issue.issuedBy.name}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Overdue ── */}
        <TabsContent value="overdue" className="mt-4 space-y-2">
          {overdue.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-muted-foreground">
              <AlertTriangle className="h-10 w-10 mb-3 text-slate-300" /><p>No overdue books 🎉</p>
            </div>
          ) : overdue.map((issue) => (
            <div key={issue.id} className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-red-800">{issue.book.title}</p>
                <p className="text-xs text-red-600">{issue.student.name} · Roll {issue.student.rollNumber}</p>
                <p className="text-xs text-red-500">Due: {fmtDate(issue.dueDate)} · Issued: {fmtDate(issue.issuedAt)}</p>
              </div>
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">OVERDUE</span>
            </div>
          ))}
        </TabsContent>

        {/* ── Books & QR ── */}
        <TabsContent value="books" className="mt-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={bookSearch} onChange={(e) => setBookSearch(e.target.value)} placeholder="Search books…"
              className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none ring-primary focus:ring-2" />
          </div>
          {bkLoading ? (
            <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-14 rounded-xl border bg-muted animate-pulse" />)}</div>
          ) : filteredBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-muted-foreground">
              <BookMarked className="h-10 w-10 mb-3 text-slate-300" /><p>No books registered.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBooks.map((book) => (
                <div key={book.id} className="rounded-xl border bg-card px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{book.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {book.author || "Unknown"} · ID: {book.bookId} · {book.availableCopies}/{book.totalCopies} available
                    </p>
                  </div>
                  {book.qrCode && (
                    <button onClick={() => setQrBook({ qrCode: book.qrCode!, title: book.title, bookId: book.bookId })}
                      className="shrink-0 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs hover:bg-muted">
                      <QrCode className="h-3.5 w-3.5" /> View QR
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Librarians ── */}
        <TabsContent value="librarians" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Create Librarian
            </button>
          </div>
          {libLoading ? (
            <div className="space-y-3">{[1,2].map((i) => <div key={i} className="h-16 rounded-xl border bg-muted animate-pulse" />)}</div>
          ) : librarians.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-muted-foreground">
              <Users className="h-10 w-10 mb-3 text-slate-300" />
              <p className="font-medium">No librarians yet</p>
              <p className="text-sm mt-1">Create a librarian account using the button above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {librarians.map((lib: LibrarianProfile) => (
                <div key={lib.id} className="rounded-xl border bg-card px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-sm font-bold text-white uppercase">
                      {lib.name.split(" ").slice(0, 2).map((p) => p[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium">{lib.name}</p>
                      <p className="text-xs text-muted-foreground">{lib.email}</p>
                      {lib.address && <p className="text-xs text-muted-foreground">{lib.address}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!confirm(`Delete librarian "${lib.name}"? This cannot be undone.`)) return;
                      delLib.mutate(lib.id, {
                        onSuccess: () => toast.success("Librarian deleted"),
                        onError: (err: any) => toast.error(err.message),
                      });
                    }}
                    className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
