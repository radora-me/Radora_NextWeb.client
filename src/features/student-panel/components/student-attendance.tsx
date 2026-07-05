"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  CalendarDays, 
  RefreshCw, 
  Send
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudentAttendance, useApplyLeave, useLeaveHistory } from "@/features/attendance/services";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function StudentAttendance() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  const { data: attendanceData, isLoading: isAttendanceLoading } = useStudentAttendance();
  const { data: leaveHistory, isLoading: isLeaveLoading, refetch: refetchLeave } = useLeaveHistory();
  const { mutate: applyLeave, isPending: isApplying } = useApplyLeave();

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) {
      toast.error("Please fill in all fields.");
      return;
    }

    applyLeave(
      { fromDate, toDate, reason },
      {
        onSuccess: () => {
          toast.success("Leave application submitted successfully!");
          setFromDate("");
          setToDate("");
          setReason("");
          refetchLeave();
        },
        onError: (error: any) => {
          toast.error(`Error applying for leave: ${error.message}`);
        },
      }
    );
  };

  const isLoading = isAttendanceLoading;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center text-muted-foreground">
        Failed to load attendance records.
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="My Attendance"
          description="View your daily attendance records and statistics."
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Working Days</p>
              <h3 className="text-3xl font-bold mt-1">{attendanceData.totalClasses}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
              <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Present Days</p>
              <h3 className="text-3xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                {attendanceData.presentClasses}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/30">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Absent Days</p>
              <h3 className="text-3xl font-bold mt-1 text-red-600 dark:text-red-400">
                {attendanceData.absentClasses}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-900/30">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
              <h3 className="text-3xl font-bold mt-1">
                {attendanceData.overallAttendance.toFixed(1)}%
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/30">
              <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <Card className="border-indigo-100 shadow-sm overflow-hidden bg-white">
            <Tabs defaultValue="records" className="w-full">
              <div className="bg-indigo-50/50 border-b px-6 py-2">
                <TabsList className="bg-transparent border-b-0 gap-4">
                  <TabsTrigger value="records" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Attendance Records</TabsTrigger>
                  <TabsTrigger value="apply-leave" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Apply for Leave</TabsTrigger>
                  <TabsTrigger value="leave-history" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Leave History</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="records" className="p-6 m-0">
                <div className="space-y-4">
                  {attendanceData.records.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No recent records found.</div>
                  ) : (
                    attendanceData.records.slice(0, 8).map((record, i) => {
                      const dateStr = new Date(record.date).toLocaleDateString([], { 
                        weekday: 'short', month: 'short', day: '2-digit' 
                      });
                      return (
                        <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${
                              record.status === "PRESENT" ? "bg-emerald-500" :
                              record.status === "ABSENT" ? "bg-red-500" : "bg-amber-500"
                            }`} />
                            <span className="font-medium text-sm">{dateStr}</span>
                          </div>
                          <Badge variant="secondary" className={
                            record.status === "PRESENT" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" :
                            record.status === "ABSENT" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" :
                            "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                          }>
                            {record.status}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              <TabsContent value="apply-leave" className="p-6 m-0">
                <form onSubmit={handleApplyLeave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from-date">From Date</Label>
                      <Input 
                        id="from-date" 
                        type="date" 
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to-date">To Date</Label>
                      <Input 
                        id="to-date" 
                        type="date" 
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Leave</Label>
                    <Textarea 
                      id="reason" 
                      placeholder="Please describe the reason for your leave request..." 
                      className="min-h-[100px]"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required 
                    />
                  </div>
                  <Button type="submit" disabled={isApplying} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    {isApplying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Submit Application
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="leave-history" className="p-6 m-0">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-muted-foreground">List of all leave requests submitted.</span>
                  <Button variant="ghost" size="sm" onClick={() => refetchLeave()} className="h-7 text-xs">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </div>
                <div className="space-y-4">
                  {isLeaveLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-indigo-500 mb-2" />
                      Loading leave history...
                    </div>
                  ) : leaveHistory && leaveHistory.length > 0 ? (
                    leaveHistory.map((leave) => {
                      const fromStr = new Date(leave.fromDate).toLocaleDateString([], { month: 'short', day: '2-digit' });
                      const toStr = new Date(leave.toDate).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' });
                      return (
                        <div key={leave.id} className="border-b pb-4 last:border-0 last:pb-0 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-semibold text-sm text-indigo-950">
                              <CalendarDays className="h-4 w-4 text-indigo-400" />
                              {fromStr} - {toStr}
                            </div>
                            <Badge variant="secondary" className={
                              leave.status === "APPROVED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" :
                              leave.status === "REJECTED" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" :
                              "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                            }>
                              {leave.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-600 line-clamp-2 pl-6">{leave.reason}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">No leave history found.</div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow"
              modifiers={{
                present: attendanceData.records.filter(r => r.status === "PRESENT").map(r => new Date(r.date)),
                absent: attendanceData.records.filter(r => r.status === "ABSENT").map(r => new Date(r.date)),
                holiday: attendanceData.holidays.map(h => new Date(h.date))
              }}
              modifiersClassNames={{
                present: "bg-emerald-100 text-emerald-900 font-bold",
                absent: "bg-red-100 text-red-900 font-bold",
                holiday: "bg-blue-100 text-blue-900 font-bold",
              }}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
