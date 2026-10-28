"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookMarked, Plus, Search, QrCode, Trash2, X, Loader2,
  RefreshCw, AlertCircle, Download, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useBooks, useAddBook, useDeleteBook, useRegenerateQR } from "@/features/library/services/library.service";
import type { Book } from "@/types/api.types";

const STATUS_COLOR: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  ISSUED:    "bg-blue-100 text-blue-700",
  LOST:      "bg-red-100 text-red-700",
  DAMAGED:   "bg-amber-100 text-amber-700",
};

// ── Add Book Form ─────────────────────────────────────────────────────────────
function AddBookForm({ onClose }: { onClose: () => void }) {
  const add = useAddBook();
  const [form, setForm] = useState({
    title: "", author: "", publisher: "", isbn: "", category: "", totalCopies: "1", bookId: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    add.mutate(
      { ...form, totalCopies: Number(form.totalCopies) || 1, bookId: form.bookId.trim() || undefined },
      {
        onSuccess: () => { toast.success("Book added and QR generated!"); onClose(); },
        onError: (err: any) => toast.error(err.message),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-sm font-medium">Title *</label>
          <input required value={form.title} onChange={set("title")} placeholder="e.g. The Great Gatsby"
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Author</label>
          <input value={form.author} onChange={set("author")} placeholder="Author name"
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Publisher</label>
          <input value={form.publisher} onChange={set("publisher")} placeholder="Publisher"
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">ISBN</label>
          <input value={form.isbn} onChange={set("isbn")} placeholder="ISBN number"
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Category</label>
          <input value={form.category} onChange={set("category")} placeholder="e.g. Science, Fiction"
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Total Copies</label>
          <input type="number" min="1" value={form.totalCopies} onChange={set("totalCopies")}
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Custom Book ID <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input value={form.bookId} onChange={set("bookId")} placeholder="Auto-generated if blank"
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">A unique QR code will be generated automatically after saving.</p>
      <div className="flex justify-end gap-2 pt-2 border-t">
        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
        <button type="submit" disabled={add.isPending}
          className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm text-white disabled:opacity-60 hover:bg-amber-600">
          {add.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {add.isPending ? "Saving…" : "Add Book & Generate QR"}
        </button>
      </div>
    </form>
  );
}

// ── QR Modal ──────────────────────────────────────────────────────────────────
function QRModal({ book, onClose }: { book: Book; onClose: () => void }) {
  const regen = useRegenerateQR();

  const handleDownload = () => {
    if (!book.qrCode) return;
    const a = document.createElement("a");
    a.href = book.qrCode;
    a.download = `QR-${book.bookId}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">QR Code</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex flex-col items-center gap-4">
          {book.qrCode ? (
            <img src={book.qrCode} alt="QR Code" className="w-56 h-56 rounded-xl border p-2 bg-white" />
          ) : (
            <div className="w-56 h-56 rounded-xl border flex items-center justify-center text-muted-foreground">
              <QrCode className="h-16 w-16 opacity-30" />
            </div>
          )}
          <div className="text-center">
            <p className="font-semibold">{book.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">ID: {book.bookId}</p>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Print this QR code and paste it on the book cover. Scan it when issuing to a student.
          </p>
          <div className="flex gap-2 w-full">
            <button onClick={handleDownload} disabled={!book.qrCode}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50">
              <Download className="h-4 w-4" /> Download
            </button>
            <button
              onClick={() => regen.mutate(book.id, {
                onSuccess: () => toast.success("QR regenerated"),
                onError: (err: any) => toast.error(err.message),
              })}
              disabled={regen.isPending}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50">
              {regen.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Regenerate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Book Row ──────────────────────────────────────────────────────────────────
function BookRow({ book }: { book: Book }) {
  const [expanded, setExpanded] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const del = useDeleteBook();

  return (
    <>
      {showQR && <QRModal book={book} onClose={() => setShowQR(false)} />}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium truncate">{book.title}</p>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLOR[book.status] ?? "bg-slate-100 text-slate-600"}`}>
                {book.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {book.author || "Unknown author"} · ID: {book.bookId}
              {book.category && ` · ${book.category}`}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-muted-foreground mr-2">{book.availableCopies}/{book.totalCopies} avail.</span>
            <button onClick={() => setShowQR(true)}
              className="rounded-lg p-1.5 hover:bg-amber-50 hover:text-amber-600 transition-colors" title="View QR">
              <QrCode className="h-4 w-4" />
            </button>
            <button onClick={() => setExpanded((p) => !p)}
              className="rounded-lg p-1.5 hover:bg-muted transition-colors">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <button
              onClick={() => del.mutate(book.id, {
                onSuccess: () => toast.success("Book deleted"),
                onError: (err: any) => toast.error(err.message),
              })}
              disabled={del.isPending}
              className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {expanded && (
          <div className="border-t px-4 py-3 bg-muted/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><p className="text-xs text-muted-foreground">Publisher</p><p>{book.publisher || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">ISBN</p><p>{book.isbn || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Total Copies</p><p>{book.totalCopies}</p></div>
            <div><p className="text-xs text-muted-foreground">Added By</p><p>{book.addedBy?.name || "—"}</p></div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function LibrarianBooksPage() {
  const { data: books = [], isLoading, isError } = useBooks();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = books.filter((b) =>
    !search ||
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.bookId.toLowerCase().includes(search.toLowerCase()) ||
    (b.author || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.category || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Add New Book</h2>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <AddBookForm onClose={() => setShowAdd(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-amber-600">
            <BookMarked className="h-4 w-4" /> BOOK REGISTRY
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Books</h1>
          <p className="mt-1 text-sm text-muted-foreground">Register books and generate QR codes for each copy.</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
          <Plus className="h-4 w-4" /> Add Book
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, author, ID…"
          className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none ring-primary focus:ring-2" />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl border bg-muted animate-pulse" />)}
        </div>
      )}
      {isError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">Failed to load books. Please refresh.</p>
        </div>
      )}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-muted-foreground">
          <BookMarked className="h-12 w-12 mb-3 text-slate-300" />
          <p className="font-medium">{search ? "No books match your search" : "No books registered yet"}</p>
          {!search && <p className="text-sm mt-1">Click "Add Book" to register the first book.</p>}
        </div>
      )}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((book) => <BookRow key={book.id} book={book} />)}
        </div>
      )}
    </motion.div>
  );
}
