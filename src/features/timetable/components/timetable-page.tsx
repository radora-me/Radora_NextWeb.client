"use client";

import { useState, useMemo, Fragment } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  classTimetables,
  periodTimings,
  weekDays,
  type TimetableSlot,
} from "@/features/timetable/data/mock-timetable";

// ── Slot type styling map ──────────────────────────────────────────────
const slotStyles: Record<
  TimetableSlot["type"],
  { bg: string; label: string; dot: string }
> = {
  lecture: {
    bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800",
    label: "Lecture",
    dot: "bg-blue-400",
  },
  lab: {
    bg: "bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800",
    label: "Lab",
    dot: "bg-purple-400",
  },
  break: {
    bg: "bg-gray-100 border-gray-200 dark:bg-gray-800/40 dark:border-gray-700",
    label: "Break",
    dot: "bg-gray-400",
  },
  assembly: {
    bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800",
    label: "Assembly",
    dot: "bg-amber-400",
  },
  sports: {
    bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800",
    label: "Sports",
    dot: "bg-emerald-400",
  },
  library: {
    bg: "bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800",
    label: "Library",
    dot: "bg-orange-400",
  },
};

// ── Helpers ────────────────────────────────────────────────────────────
const uniqueClasses = Array.from(
  new Set(classTimetables.map((t) => t.class))
).sort((a, b) => Number(a) - Number(b));

function getSectionsForClass(cls: string) {
  return Array.from(
    new Set(classTimetables.filter((t) => t.class === cls).map((t) => t.section))
  ).sort();
}

// ── Page ───────────────────────────────────────────────────────────────
export function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState("10");
  const [selectedSection, setSelectedSection] = useState("A");

  const availableSections = useMemo(
    () => getSectionsForClass(selectedClass),
    [selectedClass]
  );

  const timetable = useMemo(
    () =>
      classTimetables.find(
        (t) => t.class === selectedClass && t.section === selectedSection
      ),
    [selectedClass, selectedSection]
  );

  // Build a lookup: day -> period -> slot
  const slotMap = useMemo(() => {
    const map = new Map<string, TimetableSlot>();
    timetable?.slots.forEach((slot) => {
      map.set(`${slot.day}-${slot.period}`, slot);
    });
    return map;
  }, [timetable]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title="Timetable"
        description="Manage class schedules and room assignments."
      />

      {/* Selector Row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-center gap-3"
      >
        {/* Class selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Class
          </span>
          <Select
            value={selectedClass}
            onValueChange={(v) => {
              const cls = v ?? "10";
              setSelectedClass(cls);
              // Reset section to first available
              const sections = getSectionsForClass(cls);
              setSelectedSection(sections[0] ?? "A");
            }}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              {uniqueClasses.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  Class {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Section selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Section
          </span>
          <Select
            value={selectedSection}
            onValueChange={(v) => setSelectedSection(v ?? "A")}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              {availableSections.map((sec) => (
                <SelectItem key={sec} value={sec}>
                  Section {sec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active timetable badge */}
        <Badge variant="secondary" className="ml-auto gap-1.5">
          <Calendar className="size-3" />
          Class {selectedClass} – Section {selectedSection}
        </Badge>
      </motion.div>

      {/* Timetable Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-4 text-indigo-500" />
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {timetable ? (
              <div className="min-w-[800px]">
                {/* Grid: first col = period info, remaining = days */}
                <div
                  className="grid gap-px rounded-lg bg-border"
                  style={{
                    gridTemplateColumns: `140px repeat(${weekDays.length}, 1fr)`,
                  }}
                >
                  {/* ── Header Row ── */}
                  <div className="rounded-tl-lg bg-muted/60 p-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Period
                  </div>
                  {weekDays.map((day, i) => (
                    <div
                      key={day}
                      className={`bg-muted/60 p-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground ${
                        i === weekDays.length - 1 ? "rounded-tr-lg" : ""
                      }`}
                    >
                      {day}
                    </div>
                  ))}

                  {/* ── Period Rows ── */}
                  {periodTimings.map((period, rowIdx) => {
                    const isLastRow = rowIdx === periodTimings.length - 1;

                    return (
                      <Fragment key={`row-${period.period}`}>
                        {/* Period info cell */}
                        <div
                          key={`period-${period.period}`}
                          className={`flex flex-col justify-center bg-card px-3 py-2 ${
                            isLastRow ? "rounded-bl-lg" : ""
                          }`}
                        >
                          <span className="text-xs font-semibold text-foreground">
                            Period {period.period}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {period.startTime} – {period.endTime}
                          </span>
                        </div>

                        {/* Day cells */}
                        {weekDays.map((day, colIdx) => {
                          const slot = slotMap.get(`${day}-${period.period}`);
                          const style = slot
                            ? slotStyles[slot.type]
                            : undefined;
                          const isBreak = slot?.type === "break";
                          const isLastCell =
                            isLastRow && colIdx === weekDays.length - 1;

                          return (
                            <div
                              key={`${day}-${period.period}`}
                              className={`border bg-card p-2 transition-colors ${
                                style?.bg ?? ""
                              } ${isLastCell ? "rounded-br-lg" : ""}`}
                            >
                              {slot ? (
                                <div
                                  className={`flex flex-col gap-0.5 ${
                                    isBreak ? "items-center justify-center" : ""
                                  }`}
                                >
                                  <span
                                    className={`text-xs font-medium leading-tight ${
                                      isBreak
                                        ? "italic text-muted-foreground"
                                        : "text-foreground"
                                    }`}
                                  >
                                    {slot.subject}
                                  </span>
                                  {!isBreak && slot.teacher && (
                                    <span className="text-[11px] text-muted-foreground">
                                      {slot.teacher}
                                    </span>
                                  )}
                                  {!isBreak && slot.room && (
                                    <span className="text-[10px] font-medium text-muted-foreground/70">
                                      {slot.room}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground/50">
                                  —
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Calendar className="size-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No timetable found for Class {selectedClass}, Section{" "}
                  {selectedSection}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="flex flex-wrap items-center gap-4 rounded-lg border bg-card px-4 py-3"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Legend
        </span>
        {Object.entries(slotStyles).map(([type, style]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span
              className={`inline-block size-2.5 rounded-full ${style.dot}`}
            />
            <span className="text-xs text-muted-foreground">{style.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
