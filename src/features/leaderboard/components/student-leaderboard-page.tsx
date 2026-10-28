"use client";

import { useMemo } from "react";
import { Award, BookOpen, Crown, Loader2, Medal, Star, Trophy } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useStudentLeaderboards } from "../services/leaderboard.service";
import type { StudentLeaderboardData, StudentLeaderboardRow } from "../services/leaderboard.service";

const badgeClass: Record<string, string> = { TOP_PERFORMER: "border-amber-200 bg-amber-50 text-amber-700", EXCELLENCE: "border-violet-200 bg-violet-50 text-violet-700", STRONG_PERFORMER: "border-blue-200 bg-blue-50 text-blue-700", RISING_STAR: "border-emerald-200 bg-emerald-50 text-emerald-700", NEEDS_SUPPORT: "border-orange-200 bg-orange-50 text-orange-700", UNRATED: "border-slate-200 bg-slate-50 text-slate-600" };
const badgeIcon: Record<string, typeof Award> = { TOP_PERFORMER: Crown, EXCELLENCE: Trophy, STRONG_PERFORMER: Medal, RISING_STAR: Star, NEEDS_SUPPORT: Award, UNRATED: Award };

function StudentLeaderboardContent({ data }: { data: StudentLeaderboardData }) {
  return <Card className="overflow-hidden border-indigo-100 shadow-sm"><CardContent className="p-0"><div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white"><div className="flex items-center gap-3"><Trophy className="size-7" /><div><p className="text-lg font-semibold">Class leaderboard</p><p className="text-sm text-indigo-100">Rank, rating, and achievement badges</p></div></div></div><div className="divide-y">{data.leaderboard.map((row: StudentLeaderboardRow) => { const Icon = badgeIcon[row.badge.key] || Award; return <div key={`${row.rank}-${row.student.name}`} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-indigo-50/40"><div className="flex min-w-0 items-center gap-4"><div className={`flex size-10 shrink-0 items-center justify-center rounded-full font-bold ${row.rank === 1 ? "bg-amber-100 text-amber-700" : row.rank === 2 ? "bg-slate-200 text-slate-700" : row.rank === 3 ? "bg-orange-100 text-orange-700" : "bg-indigo-50 text-indigo-700"}`}>{row.rank <= 3 ? <Medal className="size-5" /> : row.rank}</div><p className="truncate font-semibold text-slate-900">{row.student.name}</p></div><div className="flex shrink-0 items-center gap-3"><span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${badgeClass[row.badge.key] || badgeClass.UNRATED}`}><Icon className="size-3.5" />{row.badge.label}</span><div className="min-w-16 text-right"><p className="text-lg font-bold text-slate-900">{row.rating}<span className="text-xs font-medium text-muted-foreground">/10</span></p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Rating</p></div></div></div>; })}{!data.leaderboard.length && <p className="p-8 text-center text-sm text-muted-foreground">No class leaderboard is available yet.</p>}</div></CardContent></Card>;
}

export function StudentLeaderboardPage() {
  const { data, isLoading } = useStudentLeaderboards(); const selected = useMemo(() => data?.classes?.[0], [data]);
  return <div className="space-y-6"><PageHeader title="Class Leaderboard" description="See every student’s rank, rating out of 10, and achievement badge." />{isLoading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading your leaderboard…</div> : <>{selected ? <StudentLeaderboardContent data={selected} /> : <p className="text-sm text-muted-foreground">No enrolled class leaderboard is available yet.</p>}</>}</div>;
}
