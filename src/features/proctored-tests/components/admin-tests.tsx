"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdminTests, useTestAttempts } from "../services/proctored-tests.service";

export function AdminTests() {
  const { data: tests, isLoading } = useAdminTests(); const [selected, setSelected] = useState<string | null>(null); const attempts = useTestAttempts(selected, true);
  return <div className="space-y-6"><PageHeader title="Proctored Tests" description="Review assessments, secure attempt activity, and teacher grading across the school." /><Card><CardHeader><CardTitle>Assessment activity</CardTitle></CardHeader><CardContent>{isLoading ? <p>Loading tests…</p> : <div className="space-y-3">{(tests || []).map((test) => <div key={test.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"><div><p className="font-semibold">{test.title}</p><p className="text-sm text-muted-foreground">{test.course?.title} · by {test.teacher?.name || "Teacher"} · {test.totalMarks} marks · {test.attemptsCount || 0} attempts</p></div><div className="flex items-center gap-2"><Badge>{test.status}</Badge><Button variant="outline" size="sm" onClick={() => setSelected(test.id)}>View results</Button></div></div>)}{!tests?.length && <p className="text-sm text-muted-foreground">No proctored tests have been created.</p>}</div>}</CardContent></Card><Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="max-w-4xl"><DialogHeader><DialogTitle>Attempt results</DialogTitle></DialogHeader>{attempts.isLoading ? <p>Loading results…</p> : <div className="space-y-3">{(attempts.data?.attempts || []).map((attempt) => <div key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"><div><p className="font-medium">{attempt.student?.name} {attempt.student?.rollNumber ? `· ${attempt.student.rollNumber}` : ""}</p><p className="text-xs text-muted-foreground">{attempt.status} · started {new Date(attempt.startedAt).toLocaleString()} · violations {attempt.violationCount}</p></div><div className="text-right"><p className="font-semibold">{attempt.teacherMarks ?? attempt.score ?? "—"}/{attempt.totalMarks}</p><p className="text-xs text-muted-foreground">{attempt.percentage ?? "—"}%</p></div></div>)}{!attempts.data?.attempts?.length && <p className="text-sm text-muted-foreground">No attempts recorded.</p>}</div>}</DialogContent></Dialog></div>;
}
