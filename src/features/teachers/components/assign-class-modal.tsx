"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAssignTeacherClass } from "@/features/admin/services/admin.service";

export function AssignClassModal({
  teacherEmail: initialEmail,
  onClose,
}: {
  teacherEmail: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  const assignMutation = useAssignTeacherClass();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email.trim() || !className.trim() || !section.trim()) {
      setFormError("All fields are required.");
      return;
    }

    try {
      const response = await assignMutation.mutateAsync({
        teacherEmail: email.trim().toLowerCase(),
        className: className.trim(),
        section: section.trim().toUpperCase(),
      });

      setSuccess(true);
    } catch (err: any) {
      setFormError(err.message || "Failed to assign class.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Assign Class to Teacher</CardTitle>
                <CardDescription className="text-sm mt-0.5">
                  Link a teacher to a specific class and course section.
                </CardDescription>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-5"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Class Assigned!</p>
                  <p className="text-sm text-muted-foreground mt-1 font-medium text-slate-600">
                    Teacher {email} has been successfully assigned to Class {className}-{section.toUpperCase()}.
                  </p>
                </div>
                <div className="pt-2">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={onClose}>
                    Done
                  </Button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="assign-email">Teacher Email</Label>
                  <Input
                    id="assign-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@school.edu"
                    disabled={!!initialEmail}
                  />
                </div>

                {/* Class */}
                <div className="space-y-1.5">
                  <Label htmlFor="assign-class">Class Name (e.g. 10)</Label>
                  <Select value={className} onValueChange={(v) => setClassName(v ?? "")}>
                    <SelectTrigger id="assign-class">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          Class {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Section */}
                <div className="space-y-1.5">
                  <Label htmlFor="assign-section">Section (e.g. A)</Label>
                  <Select value={section} onValueChange={(v) => setSection(v ?? "")}>
                    <SelectTrigger id="assign-section">
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A", "B", "C", "D"].map((s) => (
                        <SelectItem key={s} value={s}>
                          Section {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <AnimatePresence>
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {formError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={assignMutation.isPending}
                  >
                    {assignMutation.isPending ? "Assigning..." : "Assign Class"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
