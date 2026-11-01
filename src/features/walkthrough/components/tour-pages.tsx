"use client";

import { useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, BookOpen, CalendarDays,
  Check, Clock3, Download, Filter, GraduationCap, MoreHorizontal,
  Plus, Search, Users, WalletCards,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DemoNotice } from "@/features/walkthrough/components/tour-pages-shared";
import {
  StudentDashboardDemo,
  TeacherDashboardDemo,
} from "@/features/walkthrough/components/role-dashboard-demos";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  demoAttendanceTrend, demoBooks, demoClassPerformance, demoEvents,
  demoExams, demoFeeRows, demoNotifications, demoRecentActivity,
  demoStudents, demoTeachers, demoTimetable,
  type DemoPageId,
} from "@/features/walkthrough/data/demo-data";

type PageProps = {
  onLock: (feature: string, description: string) => void;
  onNavigate: (page: DemoPageId) => void;
  isTarget: (id: string) => boolean;
};

const highlight = (active: boolean) => active
  ? "relative z-10 rounded-xl ring-2 ring-indigo-500 ring-offset-4 ring-offset-background shadow-[0_0_0_8px_rgba(99,102,241,0.08)]"
  : "";

export function TourPage({ page, onLock, onNavigate, isTarget }: PageProps & { page: DemoPageId }) {
  switch (page) {
    case "dashboard": return <DashboardDemo {...{ onLock, onNavigate, isTarget }} />;
    case "teacher-dashboard": return <TeacherDashboardDemo {...{ onLock, onNavigate, isTarget }} />;
    case "student-dashboard": return <StudentDashboardDemo {...{ onLock, onNavigate, isTarget }} />;
    case "students": return <StudentsDemo {...{ onLock, isTarget }} />;
    case "teachers": return <TeachersDemo {...{ onLock }} />;
    case "attendance": return <AttendanceDemo isTarget={isTarget} />;
    case "exams": return <ExamsDemo {...{ onLock }} />;
    case "timetable": return <TimetableDemo />;
    case "events": return <EventsDemo />;
    case "fees": return <FeesDemo {...{ onLock, isTarget }} />;
    case "library": return <LibraryDemo {...{ onLock }} />;
    case "notifications": return <NotificationsDemo />;
  }
}

function DashboardDemo({ onLock, onNavigate, isTarget }: PageProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Good morning, Radora Academy"
        description="Here’s what’s happening across your institution today."
        action={<Button variant="outline" onClick={() => onNavigate("events")}><CalendarDays className="mr-2 size-4" /> View calendar</Button>}
      />
      <div data-tour="analytics" className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${highlight(isTarget("analytics"))}`}>
        <StatCard title="Total Students" value="1,248" change="4.2%" trend="positive" icon={GraduationCap} />
        <StatCard title="Attendance Today" value="94.6%" change="1.8%" trend="positive" icon={Check} />
        <StatCard title="Fee Collection" value="82.4%" change="2.1%" trend="positive" icon={WalletCards} />
        <StatCard title="Teaching Staff" value="86" change="2 new" trend="positive" icon={Users} />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader className="flex flex-row items-start justify-between">
            <div><CardTitle>Attendance overview</CardTitle><CardDescription>Daily attendance trend · past 6 months</CardDescription></div>
            <Badge variant="secondary">Demo data</Badge>
          </CardHeader>
          <CardContent><div className="h-[250px] w-full" aria-label="Attendance trend chart">
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 250 }}>
              <AreaChart data={demoAttendanceTrend} margin={{ left: -16, right: 10, top: 12 }}>
                <defs><linearGradient id="demoAttendanceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.24} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} /></linearGradient></defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e7e9f0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis domain={[70, 100]} tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} />
                <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2.5} fill="url(#demoAttendanceFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div></CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Class performance</CardTitle><CardDescription>Average assessment score</CardDescription></CardHeader>
          <CardContent><div className="h-[250px] w-full" aria-label="Class performance chart">
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 440, height: 250 }}>
              <BarChart data={demoClassPerformance} margin={{ left: -18, right: 4, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e7e9f0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => [`${value}%`, "Average score"]} />
                <Bar dataKey="score" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card data-tour="recent-activity" className="xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Recent activity</CardTitle><CardDescription>A live view of activity across your school</CardDescription></div><Button variant="ghost" size="icon" aria-label="More activity options"><MoreHorizontal className="size-4" /></Button></CardHeader>
          <CardContent className="space-y-1">
            {demoRecentActivity.map((item) => <div key={item.title} className="flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-muted/60">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${item.tone === "emerald" ? "bg-emerald-50 text-emerald-600" : item.tone === "violet" ? "bg-violet-50 text-violet-600" : item.tone === "amber" ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"}`}><Activity className="size-4" /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.title}</p><p className="truncate text-xs text-muted-foreground">{item.detail}</p></div>
              <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
            </div>)}
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Advanced financial insights</CardTitle><CardDescription>Forecasting and assisted analysis</CardDescription></CardHeader>
          <CardContent className={`space-y-4 ${highlight(isTarget("advanced-insights"))}`} data-tour="advanced-insights">
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4"><p className="text-sm font-medium text-indigo-950">A clearer view of what’s next</p><p className="mt-1 text-xs leading-5 text-indigo-900/70">Explore trends and planning insights across your financial records.</p></div>
            <Button className="w-full" onClick={() => onLock("Advanced Financial Insights", "The full platform includes deeper financial analysis to help your team plan with confidence.")}>Explore advanced insights <ArrowUpRight className="ml-2 size-4" /></Button>
            <p className="text-center text-[11px] text-muted-foreground">Available in the full Radora platform</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StudentsDemo({ onLock, isTarget }: Pick<PageProps, "onLock" | "isTarget">) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => demoStudents.filter((student) => `${student.name} ${student.id} ${student.grade}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <div className="space-y-6">
    <PageHeader title="Students" description="Search and review student records across your institution." action={<Button onClick={() => onLock("Student record changes", "Creating and updating records is disabled in this read-only product tour.")}><Plus className="mr-2 size-4" /> Add student</Button>} />
    <div className="grid gap-4 sm:grid-cols-3"><MiniMetric label="Enrolled students" value="1,248" note="Across 24 sections" icon={GraduationCap} /><MiniMetric label="Average attendance" value="94.6%" note="This academic term" icon={Activity} /><MiniMetric label="New admissions" value="+32" note="This month" icon={ArrowUpRight} /></div>
    <Card data-tour="students" className={highlight(isTarget("students"))}>
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Student directory</CardTitle><CardDescription>Sample student records for the Radora demo institution</CardDescription></div><div className="flex flex-wrap gap-2"><div className="relative min-w-44 flex-1 sm:w-56"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search demo students" className="pl-9" /></div><Button variant="outline"><Filter className="mr-2 size-4" /> Filters</Button></div></CardHeader>
      <CardContent><Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead>Attendance</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Record</TableHead></TableRow></TableHeader><TableBody>{filtered.map((student) => <TableRow key={student.id}><TableCell><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">{student.name.split(" ").map((part) => part[0]).join("").replace(".", "")}</div><div><p className="font-medium">{student.name}</p><p className="text-xs text-muted-foreground">{student.id}</p></div></div></TableCell><TableCell>{student.grade}</TableCell><TableCell>{student.attendance}</TableCell><TableCell><StatusBadge value={student.status} /></TableCell><TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => onLock("Student profile details", "Sensitive personal information is intentionally hidden in the public demo.")}>View details</Button></TableCell></TableRow>)}</TableBody></Table>{filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No demo records match that search.</p>}</CardContent>
    </Card>
    <DemoNotice>Names and IDs are fictional sample data. Search is local to this demo.</DemoNotice>
  </div>;
}

function TeachersDemo({ onLock }: Pick<PageProps, "onLock">) {
  return <div className="space-y-6"><PageHeader title="Teachers" description="A connected view of staff, subjects and assigned classes." action={<Button onClick={() => onLock("Staff record changes", "Adding or editing staff records is disabled in this read-only demo.")}><Plus className="mr-2 size-4" /> Add teacher</Button>} />
    <div className="grid gap-4 sm:grid-cols-3"><MiniMetric label="Teaching staff" value="86" note="Across 12 departments" icon={Users} /><MiniMetric label="Class coverage" value="98%" note="All core subjects" icon={Check} /><MiniMetric label="On leave today" value="3" note="Coverage arranged" icon={Clock3} /></div>
    <Card><CardHeader><CardTitle>Staff directory</CardTitle><CardDescription>Fictional staff profiles and teaching assignments</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Staff member</TableHead><TableHead>Department</TableHead><TableHead>Assigned classes</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{demoTeachers.map((teacher) => <TableRow key={teacher.id}><TableCell><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">{teacher.name.split(" ").map((part) => part[0]).join("")}</div><div><p className="font-medium">{teacher.name}</p><p className="text-xs text-muted-foreground">{teacher.id}</p></div></div></TableCell><TableCell>{teacher.subject}</TableCell><TableCell>{teacher.classes}</TableCell><TableCell><StatusBadge value={teacher.status} /></TableCell><TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => onLock("Staff profile details", "Personal contact information is not available in this public demo.")}>View profile</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card><DemoNotice>Staff names and assignments are fictional sample data.</DemoNotice></div>;
}

function AttendanceDemo({ isTarget }: Pick<PageProps, "isTarget">) {
  const rows = [
    { className: "Class 6", present: 96, absent: 4, students: 142 },
    { className: "Class 7", present: 93, absent: 7, students: 158 },
    { className: "Class 8", present: 95, absent: 5, students: 164 },
    { className: "Class 9", present: 92, absent: 8, students: 172 },
    { className: "Class 10", present: 97, absent: 3, students: 188 },
  ];
  return <div className="space-y-6"><PageHeader title="Attendance" description="Track daily attendance and identify patterns across classes." action={<Button variant="outline" disabled><Download className="mr-2 size-4" /> Export report</Button>} />
    <div data-tour="attendance" className={`grid gap-4 sm:grid-cols-3 ${highlight(isTarget("attendance"))}`}><MiniMetric label="Today’s attendance" value="94.6%" note="+1.8% from last week" icon={Check} /><MiniMetric label="Students present" value="1,181" note="Across all grades" icon={Users} /><MiniMetric label="Pending registers" value="2" note="Demo status only" icon={Clock3} /></div>
    <div className="grid gap-4 xl:grid-cols-5"><Card className="xl:col-span-3"><CardHeader><CardTitle>Attendance by class</CardTitle><CardDescription>Today · sample summary</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Class</TableHead><TableHead>Students</TableHead><TableHead>Present</TableHead><TableHead>Absent</TableHead><TableHead>Rate</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={row.className}><TableCell className="font-medium">{row.className}</TableCell><TableCell>{row.students}</TableCell><TableCell className="text-emerald-700">{Math.round(row.students * row.present / 100)}</TableCell><TableCell>{Math.round(row.students * row.absent / 100)}</TableCell><TableCell><div className="flex items-center gap-2"><span>{row.present}%</span><span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-emerald-500" style={{ width: `${row.present}%` }} /></span></div></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
      <Card className="xl:col-span-2"><CardHeader><CardTitle>Term trend</CardTitle><CardDescription>Monthly attendance rate</CardDescription></CardHeader><CardContent><div className="h-60"><ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 440, height: 240 }}><AreaChart data={demoAttendanceTrend}><CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e7e9f0" /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis domain={[70, 100]} tickLine={false} axisLine={false} /><Tooltip formatter={(value) => [`${value}%`, "Attendance"]} /><Area dataKey="rate" type="monotone" stroke="#10b981" fill="#d1fae5" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></CardContent></Card></div>
    <DemoNotice>Register changes and exports are disabled. All attendance figures are synthetic.</DemoNotice></div>;
}

function ExamsDemo({ onLock }: Pick<PageProps, "onLock">) {
  return <div className="space-y-6"><PageHeader title="Proctored Tests" description="Plan assessments and review readiness across classes." action={<Button onClick={() => onLock("Assessment creation", "Creating or publishing tests is disabled in the public walkthrough.")}><Plus className="mr-2 size-4" /> Create assessment</Button>} /><div className="grid gap-4 sm:grid-cols-3"><MiniMetric label="Scheduled" value="12" note="Across 8 classes" icon={CalendarDays} /><MiniMetric label="In draft" value="4" note="Ready for review" icon={BookOpen} /><MiniMetric label="Published results" value="8" note="This term" icon={Check} /></div><Card><CardHeader><CardTitle>Assessment schedule</CardTitle><CardDescription>Sample test plans · all actions are disabled</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Assessment</TableHead><TableHead>Class groups</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{demoExams.map((exam) => <TableRow key={exam.name}><TableCell className="font-medium">{exam.name}</TableCell><TableCell>{exam.group}</TableCell><TableCell>{exam.date}</TableCell><TableCell><StatusBadge value={exam.state} /></TableCell><TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => onLock("Assessment details", "Test questions and student results are not exposed in the demo.")}>Preview</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card><DemoNotice>Assessment data is fictional; no test can be launched from this tour.</DemoNotice></div>;
}

function TimetableDemo() {
  const days = [["mon", "Monday"], ["tue", "Tuesday"], ["wed", "Wednesday"], ["thu", "Thursday"], ["fri", "Friday"]] as const;
  return <div className="space-y-6"><PageHeader title="Timetable" description="A coordinated weekly schedule for classes and staff." action={<Button variant="outline" disabled><Download className="mr-2 size-4" /> Download</Button>} /><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">Class 8 · Section A</Badge><span className="text-sm text-muted-foreground">Week of 9 November 2026</span></div><Card><CardHeader><CardTitle>Weekly schedule</CardTitle><CardDescription>Sample timetable · editing is disabled</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Time</TableHead>{days.map(([, label]) => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader><TableBody>{demoTimetable.map((row) => <TableRow key={row.time}><TableCell className="font-medium text-muted-foreground">{row.time}</TableCell>{days.map(([day]) => <TableCell key={day}><span className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-800">{row[day]}</span></TableCell>)}</TableRow>)}</TableBody></Table></CardContent></Card><DemoNotice>Schedules are sample content and cannot be changed in demo mode.</DemoNotice></div>;
}

function EventsDemo() {
  return <div className="space-y-6"><PageHeader title="Events & Gallery" description="Keep the school community up to date with what’s happening." action={<Button variant="outline" disabled><Plus className="mr-2 size-4" /> Create event</Button>} /><div className="grid gap-4 lg:grid-cols-2">{demoEvents.map((event) => <Card key={event.title} className="flex flex-row items-center gap-4 p-4"><div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><span className="text-lg font-bold leading-5">{event.day}</span><span className="text-[10px] font-semibold tracking-wider">{event.month}</span></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{event.title}</p><Badge variant="outline">{event.kind}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{event.detail}</p></div><CalendarDays className="hidden size-5 text-muted-foreground sm:block" /></Card>)}</div><Card><CardHeader><CardTitle>Community gallery</CardTitle><CardDescription>A preview of the events and gallery area</CardDescription></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-3">{["Campus life", "Learning together", "Celebration day"].map((caption, index) => <div key={caption} className={`flex h-36 items-end rounded-xl bg-gradient-to-br ${index === 0 ? "from-indigo-100 to-sky-200" : index === 1 ? "from-amber-100 to-rose-200" : "from-emerald-100 to-teal-200"} p-4`}><span className="rounded-lg bg-white/75 px-2.5 py-1 text-xs font-medium text-slate-700">{caption}</span></div>)}</div></CardContent></Card><DemoNotice>Events are sample content. Creating, uploading or publishing is disabled.</DemoNotice></div>;
}

function FeesDemo({ onLock, isTarget }: Pick<PageProps, "onLock" | "isTarget">) {
  return <div className="space-y-6"><PageHeader title="Fee Management" description="Review collection progress and upcoming dues." action={<Button onClick={() => onLock("Fee record management", "Creating or changing fee records is disabled in this public demo.")}><Plus className="mr-2 size-4" /> Add fee plan</Button>} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MiniMetric label="Collected this term" value="₹42.8L" note="82.4% of billed fees" icon={WalletCards} /><MiniMetric label="Pending collection" value="₹9.1L" note="Across active plans" icon={Clock3} /><MiniMetric label="Paid in full" value="1,042" note="Households" icon={Check} /><MiniMetric label="Due this week" value="₹2.4L" note="86 invoices" icon={ArrowDownRight} /></div><Card data-tour="fees" className={highlight(isTarget("fees"))}><CardHeader><CardTitle>Recent fee records</CardTitle><CardDescription>Fictional invoices for walkthrough display</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Group</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Due date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Payment</TableHead></TableRow></TableHeader><TableBody>{demoFeeRows.map((row) => <TableRow key={row.invoice}><TableCell className="font-mono text-xs">{row.invoice}</TableCell><TableCell>{row.group}</TableCell><TableCell>{row.item}</TableCell><TableCell className="font-medium">{row.amount}</TableCell><TableCell>{row.due}</TableCell><TableCell><StatusBadge value={row.status} /></TableCell><TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => onLock("Payment processing", "Real payments and transactions are never available in the product tour.")}>View</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card><DemoNotice>Payment actions and transactions are disabled. Invoice details use synthetic data.</DemoNotice></div>;
}

function LibraryDemo({ onLock }: Pick<PageProps, "onLock">) {
  return <div className="space-y-6"><PageHeader title="Library" description="Browse the catalogue and get a quick view of circulation." action={<Button onClick={() => onLock("Library record changes", "Adding books and issuing items changes live records and is disabled in the demo.")}><Plus className="mr-2 size-4" /> Add book</Button>} /><div className="grid gap-4 sm:grid-cols-3"><MiniMetric label="Catalogue titles" value="3,840" note="Across 12 categories" icon={BookOpen} /><MiniMetric label="Currently issued" value="426" note="Sample circulation data" icon={Users} /><MiniMetric label="Available now" value="3,414" note="Ready to borrow" icon={Check} /></div><Card><CardHeader className="sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Library catalogue</CardTitle><CardDescription>Representative titles from the catalogue</CardDescription></div><Button variant="outline" disabled><Search className="mr-2 size-4" /> Search catalogue</Button></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Author</TableHead><TableHead>Category</TableHead><TableHead>Availability</TableHead><TableHead className="text-right">Record</TableHead></TableRow></TableHeader><TableBody>{demoBooks.map((book) => <TableRow key={book.id}><TableCell><div className="font-medium">{book.title}</div><div className="text-xs text-muted-foreground">{book.id}</div></TableCell><TableCell>{book.author}</TableCell><TableCell>{book.category}</TableCell><TableCell><StatusBadge value={book.availability} /></TableCell><TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => onLock("Circulation actions", "Issuing, returning and renewing books is disabled in demo mode.")}>View</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card><DemoNotice>Catalogue actions are disabled; no library records are queried or changed.</DemoNotice></div>;
}

function NotificationsDemo() {
  const [selected, setSelected] = useState("All");
  const categories = ["All", "Attendance", "Academics", "Fees", "Events"];
  const visible = demoNotifications.filter((item) => selected === "All" || item.category === selected);
  return <div className="space-y-6"><PageHeader title="Notifications" description="A shared place for school updates and reminders." action={<Button variant="outline" disabled><Check className="mr-2 size-4" /> Mark all read</Button>} /><div className="flex flex-wrap gap-2">{categories.map((category) => <Button key={category} variant={selected === category ? "secondary" : "ghost"} size="sm" onClick={() => setSelected(category)}>{category}</Button>)}</div><Card><CardHeader><CardTitle>Recent updates</CardTitle><CardDescription>Sample notifications from the demo institution</CardDescription></CardHeader><CardContent className="divide-y p-0">{visible.map((item) => <article key={item.title} className="flex gap-4 px-5 py-4"><div className={`mt-1 size-2 shrink-0 rounded-full ${item.unread ? "bg-indigo-500" : "bg-slate-200"}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium">{item.title}</p><Badge variant="outline">{item.category}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{item.detail}</p><p className="mt-2 text-xs text-muted-foreground">{item.time}</p></div></article>)}</CardContent></Card><DemoNotice>Category filters are local and do not mark production notices as read.</DemoNotice></div>;
}

function MiniMetric({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: typeof Activity }) {
  return <Card><CardContent className="flex items-start justify-between gap-3 pt-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div><span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Icon className="size-4" /></span></CardContent></Card>;
}

function StatusBadge({ value }: { value: string }) {
  const style = /active|paid|available|scheduled/i.test(value)
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : /leave|review|due soon|draft/i.test(value)
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-50 text-slate-600";
  return <Badge variant="outline" className={style}>{value}</Badge>;
}

