"use client";

import { Calendar, Clock, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyTimetables } from "@/features/timetable/services/timetable.service";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function StudentTimetableLive() {
  const { data: timetables, isLoading, isError } = useMyTimetables();
  const timetable = timetables?.[0];
  const entries = [...(timetable?.entries || [])].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Timetable"
        description={timetable ? `${timetable.className}${timetable.section ? ` · ${timetable.section}` : ""} weekly schedule` : "Your published weekly schedule"}
      />
      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading your timetable…</div>}
      {isError && <p className="text-sm text-destructive">Unable to load your timetable.</p>}
      {!isLoading && !isError && !entries.length && <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No published timetable is assigned to your class yet.</CardContent></Card>}
      {!isLoading && !isError && entries.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/20"><CardTitle className="flex items-center gap-2 text-base"><Calendar className="size-4 text-indigo-500" />{timetable?.name || "Weekly Schedule"}</CardTitle></CardHeader>
          <CardContent className="p-0"><div className="divide-y">
            {entries.map((entry, index) => <div key={`${entry.dayOfWeek}-${entry.startTime}-${entry.subject}-${index}`} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="flex w-28 items-center gap-2 text-sm font-medium"><Clock className="size-4 text-muted-foreground" />{days[entry.dayOfWeek] || `Day ${entry.dayOfWeek}`}</div>
              <div className="w-28 text-xs text-muted-foreground">{entry.startTime} – {entry.endTime}</div>
              <div className="min-w-40 flex-1"><p className="font-medium">{entry.subject}</p>{entry.teacherName && <p className="text-xs text-muted-foreground">{entry.teacherName}</p>}</div>
              <div className="text-xs text-muted-foreground">{entry.room || "Room not assigned"}</div>
            </div>)}
          </div></CardContent>
        </Card>
      )}
    </div>
  );
}
