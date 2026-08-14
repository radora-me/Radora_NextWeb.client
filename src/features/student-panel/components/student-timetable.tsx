"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { classTimetables, periodTimings, weekDays } from "@/features/timetable/data/mock-timetable";
import type { TimetableSlot } from "@/features/timetable/data/mock-timetable";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const typeColors: Record<TimetableSlot["type"], string> = {
  lecture: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-200",
  lab: "bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-950/40 dark:border-purple-900 dark:text-purple-200",
  break: "bg-gray-100 border-gray-200 text-gray-600 dark:bg-gray-900/50 dark:border-gray-800 dark:text-gray-400",
  assembly: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200",
  sports: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200",
  library: "bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-950/40 dark:border-orange-900 dark:text-orange-200",
};

export function StudentTimetable() {
  const classTimetable = classTimetables.find((t) => t.class === "10" && t.section === "A");
  const slots = classTimetable?.slots || [];

  const getSlot = (day: string, period: number) => {
    return slots.find((s) => s.day === day && s.period === period);
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Class Timetable"
          description="Your weekly schedule for Class 10-A."
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-6 border-b bg-muted/40 divide-x">
                <div className="p-4 font-semibold text-center text-muted-foreground text-sm flex items-center justify-center">
                  Time / Day
                </div>
                {weekDays.map((day) => (
                  <div key={day} className="p-4 font-semibold text-center text-sm text-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid Body */}
              <div className="divide-y">
                {periodTimings.map((period) => (
                  <div key={period.period} className="grid grid-cols-6 divide-x">
                    <div className="p-3 bg-muted/10 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold text-foreground">Period {period.period}</span>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {period.startTime} - {period.endTime}
                      </span>
                    </div>

                    {weekDays.map((day) => {
                      const slot = getSlot(day, period.period);

                      if (!slot) {
                        return (
                          <div key={`${day}-${period.period}`} className="p-2 flex items-center justify-center">
                            <span className="text-muted-foreground/30 text-xs">-</span>
                          </div>
                        );
                      }

                      return (
                        <div key={slot.id} className="p-1.5 h-full">
                          <div
                            className={`h-full w-full rounded-md border p-2 flex flex-col gap-1 transition-colors ${
                              typeColors[slot.type]
                            } ${slot.type === "break" ? "items-center justify-center italic" : ""}`}
                          >
                            <span className="text-sm font-semibold truncate leading-tight">
                              {slot.subject}
                            </span>
                            {slot.type !== "break" && slot.type !== "assembly" && (
                              <>
                                <span className="text-[11px] truncate opacity-80 leading-tight">
                                  {slot.teacher}
                                </span>
                                <div className="mt-auto pt-1 flex items-center justify-between">
                                  <span className="text-[10px] font-medium opacity-70">
                                    {slot.room}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
