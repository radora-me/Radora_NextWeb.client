"use client";

import { useState } from "react";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminTimetables } from "@/features/timetable/services/timetable.service";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function TimetablePageLive() {
  const { data: timetables, isLoading, isError } = useAdminTimetables();
  const [selectedId, setSelectedId] = useState("");
  const selected = timetables?.find((item) => item.id === selectedId) || timetables?.[0];
  const entries = [...(selected?.entries || [])].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));

  return <div className="space-y-6">
    <PageHeader title="Timetable" description="Published schedules and room assignments from the database." />
    {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading timetables…</div>}
    {isError && <p className="text-sm text-destructive">Unable to load timetables.</p>}
    {!isLoading && !isError && !timetables?.length && <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No timetables have been created yet.</CardContent></Card>}
    {!isLoading && !isError && !!timetables?.length && <>
      <div className="flex flex-wrap items-center gap-3"><Calendar className="size-5 text-indigo-500" /><Select value={selected?.id || ""} onValueChange={(v) => v && setSelectedId(v)}><SelectTrigger className="w-full max-w-md"><SelectValue placeholder="Select timetable" /></SelectTrigger><SelectContent>{timetables.map((item) => <SelectItem key={item.id} value={item.id}>{item.name} · {item.className}{item.section ? ` · ${item.section}` : ""}</SelectItem>)}</SelectContent></Select></div>
      {selected && <Card className="overflow-hidden"><CardHeader className="border-b bg-muted/20"><CardTitle className="flex items-center gap-2 text-base"><Clock className="size-4 text-indigo-500" />{selected.name} · {selected.className}{selected.section ? ` · ${selected.section}` : ""}</CardTitle><p className="text-xs text-muted-foreground">{selected.assignments?.map((item) => item.course.title).join(", ") || "No class assignments"}</p></CardHeader><CardContent className="p-0">{entries.length ? <div className="divide-y">{entries.map((entry, index) => <div key={`${entry.dayOfWeek}-${entry.startTime}-${entry.subject}-${index}`} className="flex flex-wrap items-center gap-4 px-5 py-4"><div className="w-28 text-sm font-medium">{days[entry.dayOfWeek] || `Day ${entry.dayOfWeek}`}</div><div className="w-28 text-xs text-muted-foreground">{entry.startTime} – {entry.endTime}</div><div className="min-w-40 flex-1"><p className="font-medium">{entry.subject}</p>{entry.teacherName && <p className="text-xs text-muted-foreground">{entry.teacherName}</p>}</div><div className="text-xs text-muted-foreground">{entry.room || "Room not assigned"}</div></div>)}</div> : <p className="p-8 text-center text-sm text-muted-foreground">This timetable has no entries.</p>}</CardContent></Card>}
    </>}
  </div>;
}
