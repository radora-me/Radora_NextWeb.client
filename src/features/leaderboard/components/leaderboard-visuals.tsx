"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LeaderboardData, LeaderboardRow } from "../services/leaderboard.service";

export function LeaderboardVisuals({ data }: { data: LeaderboardData }) {
  return <div className="grid gap-4 lg:grid-cols-2"><Card><CardHeader><CardTitle className="text-base">Rating distribution</CardTitle></CardHeader><CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.analysis.distribution}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="label" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="count" name="Students" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent></Card><Card><CardHeader><CardTitle className="text-base">Class performance trend</CardTitle></CardHeader><CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.analysis.performanceTrend}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="label" fontSize={11} /><YAxis domain={[0, 100]} fontSize={11} /><Tooltip /><Line type="monotone" dataKey="averagePercentage" name="Average %" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div></CardContent></Card></div>;
}

export function OverviewVisuals({ courses }: { courses: { title: string; averageRating: number; averagePercentage: number }[] }) {
  return <Card><CardHeader><CardTitle className="text-base">Class performance comparison</CardTitle></CardHeader><CardContent><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={courses}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="title" fontSize={10} interval={0} angle={-20} textAnchor="end" height={65} /><YAxis domain={[0, 10]} fontSize={11} /><Tooltip /><Bar dataKey="averageRating" name="Rating / 10" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent></Card>;
}

export function StudentScoreGraph({ row }: { row: LeaderboardRow }) {
  const data = [...(row.rawScores?.tests || []), ...(row.rawScores?.homework || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((item, index) => ({ label: `${index + 1}`, percentage: item.percentage || 0, title: item.title }));
  if (!data.length) return <p className="text-xs text-muted-foreground">No scored records for the track record graph.</p>;
  return <div className="mt-3 h-28 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><XAxis dataKey="label" fontSize={9} /><YAxis domain={[0, 100]} fontSize={9} width={28} /><Tooltip formatter={(value, _name, item) => [`${value}%`, item.payload.title]} /><Line type="monotone" dataKey="percentage" name="Score" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} /></LineChart></ResponsiveContainer></div>;
}
