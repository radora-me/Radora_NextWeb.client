"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTeacherAvailableClasses } from "@/features/attendance/services";
import { useCreateTest, useGradeTestAttempt, usePublishResults, usePublishTest, useTeacherTests, useTestAttempts, type ProctoredTest } from "../services/proctored-tests.service";
import { toast } from "sonner";

type DraftQuestion = { prompt: string; options: string[]; correctOption: string; marks: number };
const blankQuestion = (): DraftQuestion => ({ prompt: "", options: ["", "", "", ""], correctOption: "", marks: 1 });
const futureDateTimeLocal = () => {
  const date = new Date(Date.now() + 60_000);
  date.setSeconds(0, 0);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function TeacherTests() {
  const { data: tests, isLoading } = useTeacherTests();
  const { data: classes } = useTeacherAvailableClasses();
  const create = useCreateTest(); const publish = usePublishTest(); const publishResults = usePublishResults(); const grade = useGradeTestAttempt();
  const [title, setTitle] = useState(""); const [courseId, setCourseId] = useState(""); const [duration, setDuration] = useState("30"); const [dueAt, setDueAt] = useState(""); const [description, setDescription] = useState(""); const [instructions, setInstructions] = useState(""); const [questions, setQuestions] = useState<DraftQuestion[]>([blankQuestion()]);
  const [selected, setSelected] = useState<string | null>(null); const attempts = useTestAttempts(selected); const [marks, setMarks] = useState(""); const [feedback, setFeedback] = useState("");
  const updateQuestion = (index: number, patch: Partial<DraftQuestion>) => setQuestions((items) => items.map((item, i) => {
    if (i !== index) return item;
    const next = { ...item, ...patch };
    if (patch.options && !next.options.includes(next.correctOption)) next.correctOption = "";
    return next;
  }));
  const createTest = () => {
    if (!title || !courseId || !dueAt || questions.some((q) => !q.prompt || q.options.some((o) => !o.trim()) || !q.correctOption || !q.options.includes(q.correctOption))) return toast.error("Complete every question and select a correct option that matches one of its choices.");
    if (new Date(dueAt).getTime() <= Date.now()) return toast.error("Test due date and time must be in the future.");
    create.mutate({ title, courseId, durationMinutes: Number(duration), dueAt: new Date(dueAt).toISOString(), description, instructions, questions }, { onSuccess: () => { toast.success("Test saved as draft"); setTitle(""); setDescription(""); setInstructions(""); setQuestions([blankQuestion()]); }, onError: (e) => toast.error(e.message) });
  };
  return <div className="space-y-6"><PageHeader title="Proctored Tests" description="Build timed MCQ assessments, monitor secure attempts, and grade results." />
    <Card><CardHeader><CardTitle>Create a proctored test</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 md:grid-cols-2"><Input placeholder="Test title" value={title} onChange={(e) => setTitle(e.target.value)} /><select className="h-10 rounded-md border bg-background px-3 text-sm" value={courseId} onChange={(e) => setCourseId(e.target.value)}><option value="">Select class</option>{(classes || []).map((item: any) => <option key={item.id} value={item.id}>{item.title || item.name || item.className}</option>)}</select><Input type="number" min={1} max={480} placeholder="Duration (minutes)" value={duration} onChange={(e) => setDuration(e.target.value)} /><Input type="datetime-local" min={futureDateTimeLocal()} value={dueAt} onChange={(e) => setDueAt(e.target.value)} /></div><Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} /><Textarea placeholder="Proctoring instructions for students" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
      <div className="space-y-4">{questions.map((question, index) => <div key={index} className="rounded-xl border p-4 space-y-3"><div className="flex items-center justify-between"><p className="font-medium">Question {index + 1}</p>{questions.length > 1 && <Button variant="ghost" size="sm" onClick={() => setQuestions((items) => items.filter((_, i) => i !== index))}>Remove</Button>}</div><Textarea placeholder="Question prompt" value={question.prompt} onChange={(e) => updateQuestion(index, { prompt: e.target.value })} /><div className="grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <Input key={optionIndex} placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`} value={option} onChange={(e) => updateQuestion(index, { options: question.options.map((item, i) => i === optionIndex ? e.target.value : item) })} />)}</div><div className="flex gap-2"><select className="h-10 rounded-md border bg-background px-3 text-sm" value={question.correctOption} onChange={(e) => updateQuestion(index, { correctOption: e.target.value })}><option value="">Correct answer</option>{question.options.filter(Boolean).map((option) => <option key={option} value={option}>{option}</option>)}</select><Input className="max-w-28" type="number" min={1} value={question.marks} onChange={(e) => updateQuestion(index, { marks: Number(e.target.value) })} /></div></div>)}</div><div className="flex gap-2"><Button variant="outline" onClick={() => setQuestions((items) => [...items, blankQuestion()])}>Add question</Button><Button onClick={createTest} loading={create.isPending}>{create.isPending ? "Saving..." : "Save draft"}</Button></div></CardContent></Card>
    <Card><CardHeader><CardTitle>Tests and results</CardTitle></CardHeader><CardContent>{isLoading ? <p>Loading tests…</p> : <div className="space-y-3">{(tests || []).map((test) => <div key={test.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"><div><p className="font-semibold">{test.title}</p><p className="text-sm text-muted-foreground">{test.course?.title} · {test.totalMarks} marks · due {new Date(test.dueAt).toLocaleString()}</p></div><div className="flex flex-wrap items-center gap-2"><Badge>{test.status}</Badge><Button variant="outline" size="sm" onClick={() => setSelected(test.id)}>Attempts</Button>{test.status === "DRAFT" && <Button size="sm" loading={publish.isPending} onClick={() => publish.mutate(test.id, { onSuccess: () => toast.success("Test published"), onError: (e) => toast.error(e.message) })}>Publish</Button>}{test.status === "PUBLISHED" && <Button variant="secondary" size="sm" loading={publishResults.isPending} onClick={() => publishResults.mutate({ testId: test.id, resultPublished: !test.resultPublished }, { onSuccess: () => toast.success(test.resultPublished ? "Results hidden" : "Results published") })}>{test.resultPublished ? "Hide results" : "Publish results"}</Button>}</div></div>)}{!tests?.length && <p className="text-sm text-muted-foreground">No tests created yet.</p>}</div>}</CardContent></Card>
    <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="max-w-4xl"><DialogHeader><DialogTitle>Student attempts</DialogTitle></DialogHeader>{attempts.isLoading ? <p>Loading attempts…</p> : <div className="space-y-3">{(attempts.data?.attempts || []).map((attempt) => <div key={attempt.id} className="rounded-lg border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-medium">{attempt.student?.name} {attempt.student?.rollNumber ? `· ${attempt.student.rollNumber}` : ""}</p><p className="text-xs text-muted-foreground">{attempt.status} · violations {attempt.violationCount} · auto score {attempt.score ?? "—"}/{attempt.totalMarks}</p></div><Badge>{attempt.teacherMarks ?? attempt.score ?? "Ungraded"}/{attempt.totalMarks}</Badge></div>{attempt.status !== "IN_PROGRESS" && <div className="mt-3 flex gap-2"><Input className="max-w-28" type="number" placeholder="Marks" value={marks} onChange={(e) => setMarks(e.target.value)} /><Input placeholder="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} /><Button loading={grade.isPending} onClick={() => grade.mutate({ attemptId: attempt.id, marks: Number(marks || attempt.score || 0), feedback }, { onSuccess: () => { toast.success("Attempt graded"); attempts.refetch(); }, onError: (e) => toast.error(e.message) })}>{grade.isPending ? "Saving..." : "Save grade"}</Button></div>}</div>)}{!attempts.data?.attempts?.length && <p className="text-sm text-muted-foreground">No students have started this test.</p>}</div>}</DialogContent></Dialog>
  </div>;
}
