"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays, Plus, MapPin, Clock, Image as ImageIcon,
  Trash2, X, Upload, ChevronLeft, ChevronRight, Loader2,
  AlertCircle, CalendarCheck, Search, Eye, Download,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/auth-context";
import {
  useEvents, useCreateEvent, useUpdateEventStatus,
  useAddEventMedia, useRemoveEventMedia, useDeleteEvent,
} from "../services/events.service";
import type { SchoolEvent, EventMedia, EventStatus } from "@/types/api.types";

const STATUS_COLORS: Record<EventStatus, string> = {
  UPCOMING: "bg-blue-100 text-blue-700",
  ONGOING: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-red-100 text-red-600",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

type MediaFile = { name: string; base64: string; type: string; caption: string; preview: string };

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({
  media, index, onClose, onPrev, onNext,
}: {
  media: EventMedia[]; index: number; onClose: () => void;
  onPrev: () => void; onNext: () => void;
}) {
  const current = media[index];

  const handleDownload = async () => {
    try {
      const res = await fetch(current.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = current.fileName || `photo-${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed");
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent z-10">
        <span className="text-white/70 text-sm">
          {index + 1} / {media.length}
          {current.caption && <span className="ml-3 text-white">{current.caption}</span>}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm text-white transition-colors"
          >
            <Download className="h-4 w-4" /> Download
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="rounded-full bg-white/10 hover:bg-white/20 p-2 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Prev */}
      {media.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 hover:bg-white/25 p-3 text-white transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <img
        src={current.url}
        alt={current.caption || current.fileName}
        className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain select-none"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      {media.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 hover:bg-white/25 p-3 text-white transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Thumbnail strip */}
      {media.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4">
          {media.map((m, i) => (
            <button
              key={m.id}
              onClick={(e) => { e.stopPropagation(); if (i < index) onPrev(); else if (i > index) onNext(); }}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Create Event Form ─────────────────────────────────────────────────────────
function CreateEventForm({ onClose }: { onClose: () => void }) {
  const create = useCreateEvent();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ title: "", description: "", location: "", startDate: "", endDate: "", status: "UPCOMING" });
  const [media, setMedia] = useState<MediaFile[]>([]);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    for (const file of Array.from(e.target.files)) {
      if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} exceeds 10 MB`); continue; }
      if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type)) { toast.error(`${file.name} is not a supported image`); continue; }
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res((r.result as string).split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const preview = URL.createObjectURL(file);
      setMedia((p) => [...p, { name: file.name, base64, type: file.type, caption: "", preview }]);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.startDate) { toast.error("Start date is required"); return; }
    create.mutate(
      {
        ...form,
        endDate: form.endDate || undefined,
        media: media.length
          ? media.map((m) => ({ fileName: m.name, mimeType: m.type, base64: m.base64, caption: m.caption || undefined }))
          : undefined,
      },
      {
        onSuccess: () => { toast.success("Event created and notification sent!"); onClose(); },
        onError: (err: any) => toast.error(err.message),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-sm font-medium">Title *</label>
          <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Annual Sports Day 2025"
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Event details..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2 resize-none" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Location</label>
          <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            placeholder="e.g. School Auditorium"
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Status</label>
          <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2">
            {["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Start Date *</label>
          <input required type="datetime-local" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">End Date</label>
          <input type="datetime-local" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Gallery Images</label>
        <button type="button" onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-2.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <Upload className="h-4 w-4" /> Upload Images
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
        {media.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {media.map((m, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden border aspect-square">
                <img src={m.preview} alt={m.name} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setMedia((p) => p.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </button>
                <input value={m.caption}
                  onChange={(e) => setMedia((p) => p.map((item, j) => j === i ? { ...item, caption: e.target.value } : item))}
                  placeholder="Caption..."
                  className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1.5 py-1 outline-none placeholder:text-white/60" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
        <button type="submit" disabled={create.isPending}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60">
          {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
          {create.isPending ? "Creating…" : "Create & Notify"}
        </button>
      </div>
    </form>
  );
}

// ── Event Gallery View ────────────────────────────────────────────────────────
function EventGallery({ event, isAdmin, onBack }: { event: SchoolEvent; isAdmin: boolean; onBack: () => void }) {
  const addMedia = useAddEventMedia();
  const removeMedia = useRemoveEventMedia();
  const updateStatus = useUpdateEventStatus();
  const fileRef = useRef<HTMLInputElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevPhoto = useCallback(() => setLightboxIndex((i) => i === null ? null : (i - 1 + event.media.length) % event.media.length), [event.media.length]);
  const nextPhoto = useCallback(() => setLightboxIndex((i) => i === null ? null : (i + 1) % event.media.length), [event.media.length]);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files: { fileName: string; mimeType: string; base64: string }[] = [];
    for (const file of Array.from(e.target.files)) {
      if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} exceeds 10 MB`); continue; }
      if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type)) { toast.error(`${file.name} is not a supported image`); continue; }
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader(); r.onload = () => res((r.result as string).split(",")[1]); r.onerror = rej; r.readAsDataURL(file);
      });
      files.push({ fileName: file.name, mimeType: file.type, base64 });
    }
    if (!files.length) return;
    addMedia.mutate({ id: event.id, media: files }, {
      onSuccess: () => toast.success("Photos added to gallery"),
      onError: (err: any) => toast.error(err.message),
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-5">
      {lightboxIndex !== null && (
        <Lightbox media={event.media} index={lightboxIndex} onClose={closeLightbox} onPrev={prevPhoto} onNext={nextPhoto} />
      )}

      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to Events
      </button>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[event.status]}`}>{event.status}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{formatDate(event.startDate)}{event.endDate && ` → ${formatDate(event.endDate)}`}</span>
              {event.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{event.location}</span>}
            </div>
            {event.description && <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">{event.description}</p>}
          </div>
          {isAdmin && (
            <div className="flex gap-2 flex-wrap">
              <select value={event.status}
                onChange={(e) => updateStatus.mutate({ id: event.id, status: e.target.value }, {
                  onSuccess: () => toast.success("Status updated"),
                  onError: (err: any) => toast.error(err.message),
                })}
                className="h-9 rounded-lg border bg-background px-2 text-xs outline-none ring-primary focus:ring-2">
                {["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"].map((s) => <option key={s}>{s}</option>)}
              </select>
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                {addMedia.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Add Photos
              </button>
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <ImageIcon className="h-4 w-4" /> Gallery · {event.media.length} photo{event.media.length !== 1 ? "s" : ""}
        </h3>
        {event.media.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-muted-foreground">
            <ImageIcon className="h-10 w-10 mb-3 text-slate-300" />
            <p className="text-sm">No photos yet{isAdmin ? " — click 'Add Photos' to upload" : ""}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {event.media.map((m, i) => (
              <div key={m.id}
                className="group relative rounded-xl overflow-hidden border aspect-square bg-muted cursor-pointer"
                onClick={() => setLightboxIndex(i)}>
                <img src={m.url} alt={m.caption || m.fileName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <span className="rounded-full bg-white/90 p-2 text-slate-800 pointer-events-none">
                    <Eye className="h-4 w-4" />
                  </span>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMedia.mutate({ eventId: event.id, mediaId: m.id }, {
                          onSuccess: () => toast.success("Photo removed"),
                          onError: (err: any) => toast.error(err.message),
                        });
                      }}
                      className="rounded-full bg-red-500/90 p-2 text-white hover:bg-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {m.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-[11px] text-white truncate">{m.caption}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Events Page ──────────────────────────────────────────────────────────
export function EventsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: events = [], isLoading, isError } = useEvents();
  const deleteEvent = useDeleteEvent();

  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<SchoolEvent | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<EventStatus | "ALL">("ALL");

  const filtered = events.filter((e) => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || (e.location || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (selected) {
    const live = events.find((e) => e.id === selected.id) || selected;
    return <EventGallery event={live} isAdmin={isAdmin} onBack={() => setSelected(null)} />;
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-primary">
            <CalendarDays className="h-4 w-4" /> EVENTS & GALLERY
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">School Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">Upcoming events, announcements, and photo galleries.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Create Event
          </button>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Create New Event</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <CreateEventForm onClose={() => setShowCreate(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events…"
            className="h-9 w-56 rounded-lg border bg-background pl-9 pr-3 text-sm outline-none ring-primary focus:ring-2" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["ALL", "UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filterStatus === s ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}>
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-2xl border bg-muted animate-pulse" />)}
        </div>
      )}
      {isError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">Failed to load events. Please refresh.</p>
        </div>
      )}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-muted-foreground">
          <CalendarDays className="h-12 w-12 mb-3 text-slate-300" />
          <p className="font-medium">No events found</p>
          <p className="text-sm mt-1">{isAdmin ? "Create the first event using the button above." : "Check back later for upcoming events."}</p>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="group rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="relative h-40 bg-gradient-to-br from-indigo-100 to-violet-100 overflow-hidden">
                {event.media.length > 0 ? (
                  <img src={event.media[0].url} alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <CalendarDays className="h-12 w-12 text-indigo-300" />
                  </div>
                )}
                <span className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[event.status]}`}>{event.status}</span>
                {event.media.length > 0 && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[11px] text-white">
                    <ImageIcon className="h-3 w-3" /> {event.media.length}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold leading-snug line-clamp-1">{event.title}</h3>
                <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(event.startDate)}</span>
                  {event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>}
                </div>
                {event.description && <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{event.description}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <button onClick={() => setSelected(event)}
                    className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                    <Eye className="h-3.5 w-3.5" /> View Gallery
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => deleteEvent.mutate(event.id, {
                        onSuccess: () => toast.success("Event deleted"),
                        onError: (err: any) => toast.error(err.message),
                      })}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
