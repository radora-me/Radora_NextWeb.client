"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Search, Loader2, CheckCircle2, AlertCircle, UserCheck,
  GraduationCap, Hash, BookOpen, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTeacherCourses } from "@/features/attendance/services";
import { useTeacherSearchStudent, useTeacherAddStudent } from "@/features/students/services";

export function AddStudentModal({ onClose }: { onClose: () => void }) {
  const [rollNumber, setRollNumber] = useState("");
  const [debouncedRoll, setDebouncedRoll] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the roll number input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedRoll(rollNumber.trim()), 500);
    return () => clearTimeout(timer);
  }, [rollNumber]);

  // Fetch teacher's own courses (to let them pick which course to enroll into)
  const { data: courses = [], isLoading: coursesLoading } = useTeacherCourses();

  // Search student by roll number
  const {
    data: student,
    isLoading: searching,
    isError: notFound,
    error: searchError,
  } = useTeacherSearchStudent(debouncedRoll, !!debouncedRoll);

  // Mutation
  const addMutation = useTeacherAddStudent();

  // Auto-focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Auto-select all teacher courses when student found
  useEffect(() => {
    if (student && courses.length > 0) {
      // Pre-select courses the student is NOT already enrolled in (from this teacher)
      const alreadyEnrolledIds = student.courses.map((c) => c.id);
      const unenrolled = courses.filter((c) => !alreadyEnrolledIds.includes(c.id));
      setSelectedCourseIds(unenrolled.map((c) => c.id));
    }
  }, [student, courses]);

  const toggleCourse = (id: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setFormError("");

    if (!student) {
      setFormError("Please search for a valid student first.");
      return;
    }
    if (selectedCourseIds.length === 0) {
      setFormError("Please select a class to enroll the student.");
      return;
    }

    try {
      await addMutation.mutateAsync({
        rollNumber: debouncedRoll,
        courseIds: selectedCourseIds,
      });
      setSuccess(true);
    } catch (err: any) {
      setFormError(err.message || "Failed to add student.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900">
                <UserCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Add Student to Class</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Search by roll number and enroll into your classes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center py-6 text-center space-y-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">Student Added!</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-indigo-600">{student?.name}</span> (Roll #{debouncedRoll}) has been
                    successfully enrolled in {selectedCourseIds.length} class{selectedCourseIds.length !== 1 ? "es" : ""}.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={onClose}>Close</Button>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => {
                      setSuccess(false);
                      setRollNumber("");
                      setDebouncedRoll("");
                      setSelectedCourseIds([]);
                      setFormError("");
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Another
                  </Button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Roll Number Search */}
                <div className="space-y-1.5">
                  <Label htmlFor="roll-search" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Student Roll Number
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="roll-search"
                      ref={inputRef}
                      placeholder="e.g. STU001 or 2024001"
                      value={rollNumber}
                      onChange={(e) => {
                        setRollNumber(e.target.value);
                        setFormError("");
                      }}
                      className="pl-9 pr-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-indigo-400 focus:ring-indigo-400"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {searching && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                      {!searching && student && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                      {!searching && notFound && debouncedRoll && (
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Student Preview Card */}
                <AnimatePresence mode="wait">
                  {searching && (
                    <motion.div
                      key="searching"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700"
                    >
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-400 shrink-0" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">Looking up student...</p>
                    </motion.div>
                  )}

                  {!searching && notFound && debouncedRoll && (
                    <motion.div
                      key="notfound"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 border border-red-100 dark:border-red-900"
                    >
                      <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-400">Student not found</p>
                        <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">
                          No student with roll number &quot;{debouncedRoll}&quot; exists in the system.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {!searching && student && (
                    <motion.div
                      key="found"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-4 border border-emerald-100 dark:border-emerald-900 space-y-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-sm font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">{student.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Roll #{student.rollNumber}
                            {student.className ? ` · ${student.className}` : ""}
                          </p>
                        </div>
                        <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-0 shrink-0">
                          Found
                        </Badge>
                      </div>
                      {student.courses.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          <span className="text-xs text-slate-400">Already enrolled:</span>
                          {student.courses.map((c) => (
                            <Badge key={c.id} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">
                              {c.title}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Course Selection */}
                {student && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Select Class to Enroll
                    </Label>
                    {coursesLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading your classes...
                      </div>
                    ) : courses.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">
                        You have no classes assigned. Ask your admin to assign a class first.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {courses.map((course) => {
                          const alreadyEnrolled = student.courses.some((c) => c.id === course.id);
                          const isSelected = selectedCourseIds.includes(course.id);

                          return (
                            <button
                              key={course.id}
                              type="button"
                              disabled={alreadyEnrolled}
                              onClick={() => !alreadyEnrolled && toggleCourse(course.id)}
                              className={`
                                flex items-center gap-3 rounded-xl border p-3 text-left transition-all
                                ${alreadyEnrolled
                                  ? "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-60 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-sm"
                                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-200 hover:bg-indigo-50/30"
                                }
                              `}
                            >
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                  alreadyEnrolled
                                    ? "bg-slate-100 dark:bg-slate-700"
                                    : isSelected
                                    ? "bg-indigo-100 dark:bg-indigo-900"
                                    : "bg-slate-100 dark:bg-slate-700"
                                }`}
                              >
                                <BookOpen
                                  className={`h-4 w-4 ${
                                    alreadyEnrolled
                                      ? "text-slate-400"
                                      : isSelected
                                      ? "text-indigo-600 dark:text-indigo-400"
                                      : "text-slate-500"
                                  }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{course.title}</p>
                                <p className="text-xs text-slate-400 truncate">
                                  {course._count.enrollments} student{course._count.enrollments !== 1 ? "s" : ""} enrolled
                                </p>
                              </div>
                              {alreadyEnrolled ? (
                                <Badge className="shrink-0 bg-slate-100 text-slate-500 border-0 text-[10px]">
                                  Already enrolled
                                </Badge>
                              ) : isSelected ? (
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600">
                                  <CheckCircle2 className="h-3 w-3 text-white" />
                                </div>
                              ) : (
                                <div className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Error */}
                <AnimatePresence>
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 p-3 text-sm text-red-600 dark:text-red-400"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {formError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={!student || selectedCourseIds.length === 0 || addMutation.isPending}
                    onClick={handleSubmit}
                  >
                    {addMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Add to Class
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
