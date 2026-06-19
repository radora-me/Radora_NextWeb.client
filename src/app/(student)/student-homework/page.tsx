"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Download, 
  FileText, 
  Loader2, 
  Award,
  AlertCircle
} from "lucide-react";
import { useStudentHomework } from "@/features/student-panel/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function StudentHomeworkPage() {
  const { data: homeworks, isLoading, isError, refetch } = useStudentHomework();

  // Helper to get status of the submission
  const getSubmissionStatus = (hw: any) => {
    // If student has a submission in submissions list
    const submission = hw.submissions && hw.submissions[0];
    if (!submission) return { text: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" };
    
    switch (submission.status) {
      case "SUBMITTED":
        return { text: "Submitted", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" };
      case "LATE":
        return { text: "Submitted Late", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" };
      case "GRADED":
        return { text: `Graded: ${submission.marks}/${hw.totalMarks}`, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" };
      default:
        return { text: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" };
    }
  };

  return (
    <motion.div
      className="p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-start">
        <PageHeader
          title="My Homework"
          description="View assignments, due dates, instructions, and download attachments."
        />
        <Button variant="outline" size="sm" onClick={() => refetch()} className="bg-white">
          Refresh
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center h-[40vh] text-red-500 bg-red-50 rounded-xl border border-red-200 p-6">
          <AlertCircle className="h-10 w-10 mb-2" />
          <h3 className="font-semibold text-lg">Failed to load homework assignments</h3>
          <p className="text-sm opacity-90 mb-4">An error occurred while fetching data from the backend.</p>
          <Button variant="outline" onClick={() => refetch()} className="bg-white">Try Again</Button>
        </div>
      ) : homeworks && homeworks.length > 0 ? (
        <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
          {homeworks.map((hw) => {
            const status = getSubmissionStatus(hw);
            const dueStr = hw.dueAt 
              ? new Date(hw.dueAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : "No due date";
            const isOverdue = hw.dueAt && new Date(hw.dueAt) < new Date();

            return (
              <Card key={hw.id} className="border-indigo-100 shadow-sm overflow-hidden flex flex-col justify-between hover:border-indigo-200 transition-all">
                <div>
                  <CardHeader className="bg-indigo-50/20 border-b border-indigo-50/50 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 mb-2">
                          {hw.course?.title}
                        </Badge>
                        <CardTitle className="text-lg font-bold text-indigo-950 leading-tight">
                          {hw.title}
                        </CardTitle>
                      </div>
                      <Badge className={status.color}>
                        {status.text}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2 text-xs">
                      Assigned by: <span className="font-medium text-indigo-900">{hw.teacher?.name}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {hw.description && (
                      <div className="text-sm text-zinc-700 leading-relaxed">
                        {hw.description}
                      </div>
                    )}

                    {hw.instructions && (
                      <div className="bg-muted/40 rounded-lg p-3 border border-muted-foreground/10">
                        <span className="text-xs font-semibold text-indigo-950 uppercase tracking-wider block mb-1">Instructions</span>
                        <p className="text-xs text-zinc-600 leading-relaxed">{hw.instructions}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-zinc-500 pt-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-indigo-400" />
                        <span className={isOverdue && status.text === "Pending" ? "text-red-500 font-medium" : ""}>
                          Due: {dueStr} {isOverdue && status.text === "Pending" && " (Overdue)"}
                        </span>
                      </div>
                      {hw.totalMarks && (
                        <div className="flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-indigo-400" />
                          <span>Marks: {hw.totalMarks}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                <div className="px-6 py-4 bg-indigo-50/10 border-t border-indigo-50/50">
                  <span className="text-xs font-semibold text-indigo-950 uppercase tracking-wider block mb-2">Attachments</span>
                  {hw.attachments && hw.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {hw.attachments.map((att: any) => (
                        <div key={att.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-indigo-50 text-xs">
                          <div className="flex items-center gap-2 truncate pr-4">
                            <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                            <span className="font-medium text-zinc-700 truncate">{att.file?.originalName}</span>
                            <span className="text-zinc-400 text-[10px]">({(att.file?.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <a href={att.file?.publicUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                              <Download className="h-3 w-3" />
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400 italic">No attachments provided</span>
                  )}
                </div>
              </Card>
            );
          })}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[45vh] text-center border-2 border-dashed border-indigo-100 rounded-2xl bg-indigo-50/20 p-8">
          <BookOpen className="h-16 w-16 text-indigo-300 mb-4" />
          <h3 className="text-lg font-bold text-indigo-950 mb-1">No homework assigned</h3>
          <p className="text-sm text-zinc-500 max-w-sm">Great job! You have no active homework assignments in your enrolled courses.</p>
        </div>
      )}
    </motion.div>
  );
}
