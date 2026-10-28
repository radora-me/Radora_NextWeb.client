"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, QrCode, Search, X, Loader2, AlertCircle,
  CheckCircle2, RotateCcw, Camera, ScanLine,
} from "lucide-react";
import { toast } from "sonner";
import { useIssues, useIssueBook, useReturnBook, useBookByQR } from "@/features/library/services/library.service";
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

type ScanState = "requesting" | "active" | "denied" | "error";

// ── QR Scanner ────────────────────────────────────────────────────────────────
function QRScanner({ onScan, onClose }: { onScan: (value: string) => void; onClose: () => void }) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef    = useRef<number>(0);
  const scannedRef = useRef(false);

  const [state, setState] = useState<ScanState>("requesting");
  const [manualId, setManualId] = useState("");

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const handleClose = useCallback(() => { stopCamera(); onClose(); }, [stopCamera, onClose]);

  useEffect(() => {
    let active = true;

    (async () => {
      // Try rear camera first (phones), fall back to any camera (laptops)
      const constraints: MediaStreamConstraints[] = [
        { video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } } },
        { video: true },
      ];

      let stream: MediaStream | null = null;
      for (const c of constraints) {
        try { stream = await navigator.mediaDevices.getUserMedia(c); break; } catch { /* try next */ }
      }

      if (!active) { stream?.getTracks().forEach((t) => t.stop()); return; }

      if (!stream) {
        setState("denied");
        return;
      }

      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;

      try {
        await video.play();
      } catch {
        setState("error");
        return;
      }

      setState("active");

      // ── Decode loop: BarcodeDetector (Chrome/Edge) → jsQR canvas fallback ──
      const canvas  = canvasRef.current!;
      const ctx     = canvas.getContext("2d", { willReadFrequently: true })!;

      // Lazy-load jsQR only when BarcodeDetector is unavailable
      let jsqr: ((data: Uint8ClampedArray, w: number, h: number) => { data: string } | null) | null = null;
      if (!("BarcodeDetector" in window)) {
        const mod = await import("jsqr");
        jsqr = mod.default;
      }

      const decode = async () => {
        if (!active || scannedRef.current) return;
        if (video.readyState < video.HAVE_ENOUGH_DATA) {
          rafRef.current = requestAnimationFrame(decode);
          return;
        }

        let raw: string | null = null;

        if ("BarcodeDetector" in window) {
          try {
            const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
            const codes = await detector.detect(video);
            if (codes.length > 0) raw = codes[0].rawValue as string;
          } catch { /* ignore */ }
        } else if (jsqr) {
          canvas.width  = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsqr(img.data, img.width, img.height);
          if (code) raw = code.data;
        }

        if (raw) {
          scannedRef.current = true;
          stopCamera();
          try {
            const parsed = JSON.parse(raw);
            onScan(parsed.bookId ?? raw);
          } catch {
            onScan(raw);
          }
          return;
        }

        rafRef.current = requestAnimationFrame(decode);
      };

      rafRef.current = requestAnimationFrame(decode);
    })();

    return () => { active = false; stopCamera(); };
  }, [onScan, stopCamera]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-amber-500" /> Scan Book QR
          </h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Camera viewport */}
        <div className="relative bg-black" style={{ aspectRatio: "1" }}>

          {/* Requesting permission overlay */}
          {state === "requesting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
              <div className="rounded-full bg-amber-500/20 p-4">
                <Camera className="h-8 w-8 text-amber-400" />
              </div>
              <p className="text-sm font-medium">Requesting camera access…</p>
              <p className="text-xs text-white/60 text-center px-6">Allow camera permission in the browser prompt to scan QR codes.</p>
              <Loader2 className="h-5 w-5 animate-spin text-amber-400 mt-1" />
            </div>
          )}

          {/* Denied overlay */}
          {(state === "denied" || state === "error") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white px-6">
              <div className="rounded-full bg-red-500/20 p-4">
                <Camera className="h-8 w-8 text-red-400" />
              </div>
              <p className="text-sm font-medium text-center">
                {state === "denied" ? "Camera access was denied" : "Could not start camera"}
              </p>
              <p className="text-xs text-white/60 text-center">
                {state === "denied"
                  ? "Please allow camera access in your browser settings and try again."
                  : "Your browser could not start the camera. Use manual entry below."}
              </p>
            </div>
          )}

          {/* Live video */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
            style={{ display: state === "active" ? "block" : "none" }}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scan frame + animated line */}
          {state === "active" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Corner brackets */}
              <div className="relative w-52 h-52">
                {/* TL */}
                <span className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-amber-400 rounded-tl-lg" />
                {/* TR */}
                <span className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-amber-400 rounded-tr-lg" />
                {/* BL */}
                <span className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-amber-400 rounded-bl-lg" />
                {/* BR */}
                <span className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-amber-400 rounded-br-lg" />
                {/* Animated scan line */}
                <motion.div
                  className="absolute left-1 right-1 h-0.5 bg-amber-400/80 rounded-full shadow-[0_0_6px_2px_rgba(251,191,36,0.5)]"
                  initial={{ top: "4px" }}
                  animate={{ top: ["4px", "calc(100% - 4px)", "4px"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Manual entry */}
        <div className="px-5 py-4 space-y-3">
          {state === "active" && (
            <p className="text-xs text-center text-muted-foreground">Hold the QR code steady inside the frame</p>
          )}
          <p className="text-xs font-medium text-muted-foreground">Or enter Book ID manually:</p>
          <div className="flex gap-2">
            <input
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && manualId.trim()) { stopCamera(); onScan(manualId.trim()); } }}
              placeholder="e.g. BK-ABC123"
              className="flex-1 h-9 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2"
            />
            <button
              onClick={() => { if (manualId.trim()) { stopCamera(); onScan(manualId.trim()); } }}
              disabled={!manualId.trim()}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm text-white disabled:opacity-50 hover:bg-amber-600"
            >
              Use
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Issue Book Form ───────────────────────────────────────────────────────────
function IssueBookForm({ onClose }: { onClose: () => void }) {
  const [showScanner, setShowScanner] = useState(false);
  const [qrBookId, setQrBookId] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");

  const { data: scannedBook } = useBookByQR(qrBookId, !!qrBookId);
  const issue = useIssueBook();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrBookId.trim()) { toast.error("Scan or enter a Book QR ID"); return; }
    if (!rollNumber.trim()) { toast.error("Student roll number is required"); return; }
    issue.mutate(
      { qrBookId: qrBookId.trim(), studentRollNumber: rollNumber.trim(), dueDate, notes: notes.trim() || undefined },
      {
        onSuccess: () => { toast.success("Book issued successfully! Details logged."); onClose(); },
        onError: (err: any) => toast.error(err.message),
      },
    );
  };

  return (
    <>
      {showScanner && <QRScanner onScan={(id) => { setQrBookId(id); setShowScanner(false); }} onClose={() => setShowScanner(false)} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Book QR ID *</label>
          <div className="flex gap-2">
            <input value={qrBookId} onChange={(e) => setQrBookId(e.target.value)} placeholder="Scan QR or enter Book ID"
              className="flex-1 h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
            <button type="button" onClick={() => setShowScanner(true)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:bg-muted">
              <QrCode className="h-4 w-4" /> Scan
            </button>
          </div>
          {scannedBook && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span><strong>{scannedBook.title}</strong> · {scannedBook.availableCopies} copies available</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Student Roll Number *</label>
          <input required value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="e.g. 2024001"
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any remarks…"
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button type="submit" disabled={issue.isPending}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm text-white disabled:opacity-60 hover:bg-amber-600">
            {issue.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
            {issue.isPending ? "Issuing…" : "Issue Book"}
          </button>
        </div>
      </form>
    </>
  );
}

// ── Return Modal ──────────────────────────────────────────────────────────────
function ReturnModal({ issue, onClose }: { issue: BookIssueRecord; onClose: () => void }) {
  const ret = useReturnBook();
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("RETURNED");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Return Book</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
          <p><span className="text-muted-foreground">Book:</span> <strong>{issue.book.title}</strong></p>
          <p><span className="text-muted-foreground">Student:</span> {issue.student.name} ({issue.student.rollNumber})</p>
          <p><span className="text-muted-foreground">Issued:</span> {fmtDate(issue.issuedAt)}</p>
          <p><span className="text-muted-foreground">Due:</span> {fmtDate(issue.dueDate)}</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Return Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2">
            <option value="RETURNED">Returned</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notes</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Condition, remarks…"
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button
            onClick={() => ret.mutate({ issueId: issue.id, status, notes: notes || undefined }, {
              onSuccess: () => { toast.success("Book returned successfully!"); onClose(); },
              onError: (err: any) => toast.error(err.message),
            })}
            disabled={ret.isPending}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-60 hover:bg-emerald-700">
            {ret.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            {ret.isPending ? "Processing…" : "Confirm Return"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function LibrarianIssuesPage() {
  const [tab, setTab] = useState<"ISSUED" | "RETURNED" | "ALL">("ISSUED");
  const [search, setSearch] = useState("");
  const [showIssue, setShowIssue] = useState(false);
  const [returning, setReturning] = useState<BookIssueRecord | null>(null);

  const { data: issues = [], isLoading, isError } = useIssues(tab === "ALL" ? {} : { status: tab });

  const filtered = issues.filter((i) =>
    !search ||
    i.book.title.toLowerCase().includes(search.toLowerCase()) ||
    i.student.name.toLowerCase().includes(search.toLowerCase()) ||
    i.student.rollNumber.includes(search),
  );

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {showIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Issue Book to Student</h2>
              <button onClick={() => setShowIssue(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <IssueBookForm onClose={() => setShowIssue(false)} />
          </div>
        </div>
      )}
      {returning && <ReturnModal issue={returning} onClose={() => setReturning(null)} />}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-amber-600">
            <BookOpen className="h-4 w-4" /> ISSUE & RETURN
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Book Issues</h1>
          <p className="mt-1 text-sm text-muted-foreground">Scan QR to issue books and manage returns.</p>
        </div>
        <button onClick={() => setShowIssue(true)}
          className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
          <QrCode className="h-4 w-4" /> Issue Book (Scan QR)
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search book, student…"
            className="h-9 w-56 rounded-lg border bg-background pl-9 pr-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>
        <div className="flex gap-1.5">
          {(["ISSUED", "RETURNED", "ALL"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${tab === t ? "bg-amber-500 text-white" : "border hover:bg-muted"}`}>
              {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl border bg-muted animate-pulse" />)}
        </div>
      )}
      {isError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">Failed to load issues. Please refresh.</p>
        </div>
      )}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-muted-foreground">
          <BookOpen className="h-12 w-12 mb-3 text-slate-300" />
          <p className="font-medium">No records found</p>
        </div>
      )}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((issue) => {
            const isOverdue = issue.status === "ISSUED" && new Date(issue.dueDate) < new Date();
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
                    {issue.student.name} · Roll {issue.student.rollNumber}
                    {issue.student.className && ` · ${issue.student.className}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Issued: {fmt(issue.issuedAt)} · Due: {fmtDate(issue.dueDate)}
                    {issue.returnedAt && ` · Returned: ${fmt(issue.returnedAt)}`}
                  </p>
                </div>
                {issue.status === "ISSUED" && (
                  <button onClick={() => setReturning(issue)}
                    className="shrink-0 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                    <RotateCcw className="h-3.5 w-3.5" /> Return
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
