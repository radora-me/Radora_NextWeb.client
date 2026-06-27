"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Download, 
  FileText, 
  Loader2, 
  Award,
  AlertCircle,
  CloudUpload,
  CheckCircle2,
  X,
  Plus
} from "lucide-react";
import { useStudentHomework, StudentHomework } from "@/features/homework/services";

// Helper to convert File to Base64 (just for local storage mock preview)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

interface LocalAttachment {
  name: string;
  size: number;
  type: string;
}

export default function StudentHomeworkPage() {
  const { data: homeworks, isLoading, isError, refetch } = useStudentHomework();
  
  // Selected homework for detail / submission modal
  const [selectedHw, setSelectedHw] = useState<StudentHomework | null>(null);
  
  // Submission states
  const [textSubmission, setTextSubmission] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<LocalAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Local submission states (mapping homeworkId -> submission details)
  const [localSubmissions, setLocalSubmissions] = useState<Record<string, any>>({});

  // Load all local submissions from localStorage on mount
  useEffect(() => {
    const keys = Object.keys(localStorage);
    const submissions: Record<string, any> = {};
    keys.forEach(key => {
      if (key.startsWith("student_submission_")) {
        const hwId = key.replace("student_submission_", "");
        try {
          submissions[hwId] = JSON.parse(localStorage.getItem(key) || "{}");
        } catch (e) {
          console.error(e);
        }
      }
    });
    setLocalSubmissions(submissions);
  }, []);

  // Handle local file attachment
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const newFiles = [...attachedFiles];

    for (const file of files) {
      newFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }
    setAttachedFiles(newFiles);
    setIsUploading(false);
  };

  const removeAttachedFile = (idx: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== idx));
  };

  // Submit Homework
  const handleSubmitHomework = () => {
    if (!selectedHw) return;
    
    const submissionData = {
      submittedAt: new Date().toISOString(),
      textSubmission,
      attachments: attachedFiles,
      status: new Date() > new Date(selectedHw.dueAt || "") ? "LATE" : "SUBMITTED"
    };

    // Save to localStorage
    localStorage.setItem(`student_submission_${selectedHw.id}`, JSON.stringify(submissionData));
    
    // Update local state
    setLocalSubmissions(prev => ({
      ...prev,
      [selectedHw.id]: submissionData
    }));

    // Trigger update in mock submissions (for teacher portal synchronization)
    const mockSubmissionsKey = `mock_submissions_${selectedHw.id}`;
    const savedMocks = localStorage.getItem(mockSubmissionsKey);
    let mocks = [];
    if (savedMocks) {
      mocks = JSON.parse(savedMocks);
    }
    const studentIdx = mocks.findIndex((m: any) => m.studentId === "student-session-id" || m.rollNumber === "101");
    if (studentIdx > -1) {
      mocks[studentIdx] = {
        ...mocks[studentIdx],
        status: submissionData.status,
        submittedAt: submissionData.submittedAt,
        textSubmission: submissionData.textSubmission,
        attachments: submissionData.attachments
      };
      localStorage.setItem(mockSubmissionsKey, JSON.stringify(mocks));
    }

    alert("Homework submitted successfully!");
    
    // Reset form & close modal
    setTextSubmission("");
    setAttachedFiles([]);
    setSelectedHw(null);
  };

  // Helper to get status of the submission (checks backend first, then falls back to localStorage)
  const getSubmissionStatus = (hw: StudentHomework) => {
    // 1. Check if graded/submitted in the backend response
    const backendSub = hw.submissions && hw.submissions[0];
    if (backendSub) {
      switch (backendSub.status) {
        case "GRADED":
          return { text: `Graded: ${backendSub.marks}/${hw.totalMarks}`, color: "bg-emerald-100 text-emerald-700 border-emerald-200", isGraded: true, marks: backendSub.marks, feedback: backendSub.gradedAt };
        case "SUBMITTED":
          return { text: "Submitted", color: "bg-blue-100 text-blue-700 border-blue-200", isSubmitted: true };
        case "LATE":
          return { text: "Submitted Late", color: "bg-orange-100 text-orange-700 border-orange-200", isSubmitted: true };
      }
    }

    // 2. Fallback to localStorage submission
    const localSub = localSubmissions[hw.id];
    if (localSub) {
      // Check if teacher has graded it in mock submissions
      const mockSubmissionsKey = `mock_submissions_${hw.id}`;
      const savedMocks = localStorage.getItem(mockSubmissionsKey);
      if (savedMocks) {
        const mocks = JSON.parse(savedMocks);
        const myMock = mocks.find((m: any) => m.studentId === "student-session-id" || m.rollNumber === "101");
        if (myMock && myMock.status === "GRADED") {
          return {
            text: `Graded: ${myMock.marks}/${hw.totalMarks}`,
            color: "bg-emerald-100 text-emerald-700 border-emerald-200",
            isGraded: true,
            marks: myMock.marks,
            feedback: myMock.feedback
          };
        }
      }

      const isLate = localSub.status === "LATE";
      return { 
        text: isLate ? "Submitted Late" : "Submitted", 
        color: isLate ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-blue-100 text-blue-700 border-blue-200", 
        isSubmitted: true 
      };
    }
    
    return { text: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", isPending: true };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader
          title="My Homework"
          description="View assignments, due dates, instructions, and download attachments."
        />
        <Button variant="outline" size="sm" onClick={() => refetch()} className="bg-white border-indigo-100 hover:bg-indigo-50">
          Refresh
        </Button>
      </div>

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
        <div className="grid gap-6 md:grid-cols-2">
          {homeworks.map((hw) => {
            const status = getSubmissionStatus(hw);
            const dueStr = hw.dueAt 
              ? new Date(hw.dueAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : "No due date";
            const isOverdue = hw.dueAt && new Date(hw.dueAt) < new Date();

            return (
              <Card key={hw.id} className="border-indigo-100 bg-white shadow-sm overflow-hidden flex flex-col justify-between hover:border-indigo-200 hover:shadow-md transition-all">
                <div>
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 mb-2 font-medium">
                          {hw.course?.title}
                        </Badge>
                        <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
                          {hw.title}
                        </CardTitle>
                      </div>
                      <Badge className={`${status.color} shadow-sm border px-2.5 py-0.5 text-xs font-semibold`}>
                        {status.text}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2 text-xs">
                      Assigned by: <span className="font-semibold text-indigo-900">{hw.teacher?.name}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    {hw.description && (
                      <div className="text-sm text-slate-700 leading-relaxed font-medium">
                        {hw.description}
                      </div>
                    )}

                    {hw.instructions && (
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">Instructions</span>
                        <p className="text-xs text-slate-600 leading-relaxed">{hw.instructions}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        <span className={isOverdue && status.isPending ? "text-red-500 font-semibold" : "font-medium"}>
                          Due: {dueStr} {isOverdue && status.isPending && " (Overdue)"}
                        </span>
                      </div>
                      {hw.totalMarks && (
                        <div className="flex items-center gap-1.5 font-medium">
                          <Award className="h-4 w-4 text-indigo-500" />
                          <span>Marks: {hw.totalMarks}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-3">
                  {/* Attachments list */}
                  <div>
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">Attachments</span>
                    {hw.attachments && hw.attachments.length > 0 ? (
                      <div className="space-y-1.5">
                        {hw.attachments.map((att: any) => (
                          <div key={att.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs shadow-sm">
                            <div className="flex items-center gap-2 truncate pr-4">
                              <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                              <span className="font-semibold text-slate-700 truncate">{att.fileName}</span>
                            </div>
                            {/* Uses proxy download link */}
                            <a href={`/api/proxy/homework/student/${hw.id}/attachments/${att.id}`} target="_blank" rel="noopener noreferrer">
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No attachments provided</span>
                    )}
                  </div>

                  {/* Submission Status or Action Button */}
                  <div className="pt-2 border-t border-slate-100">
                    {status.isGraded ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-xs">
                        <p className="font-bold text-emerald-900 mb-0.5">Feedback from Teacher:</p>
                        <p className="text-emerald-800 font-medium">{status.feedback || "Great job!"}</p>
                      </div>
                    ) : status.isSubmitted ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Submitted. Waiting for grading.
                      </div>
                    ) : (
                      <Button 
                        onClick={() => {
                          setSelectedHw(hw);
                          setTextSubmission("");
                          setAttachedFiles([]);
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                      >
                        Submit Assignment
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[45vh] text-center border-2 border-dashed border-indigo-100 rounded-2xl bg-indigo-50/20 p-8">
          <BookOpen className="h-16 w-16 text-indigo-300 mb-4" />
          <h3 className="text-lg font-bold text-indigo-950 mb-1">No homework assigned</h3>
          <p className="text-sm text-zinc-500 max-w-sm">Great job! You have no active homework assignments in your enrolled courses.</p>
        </div>
      )}

      {/* ── Submit Assignment Modal ── */}
      <Dialog open={!!selectedHw} onOpenChange={(open) => !open && setSelectedHw(null)}>
        <DialogContent className="sm:max-w-lg bg-white border-slate-100 p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-6 border-b border-slate-100 shrink-0">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CloudUpload className="h-5 w-5 text-indigo-600" />
                  Submit Assignment
                </DialogTitle>
                <DialogDescription className="text-slate-500 mt-1">
                  Submitting for: <span className="font-semibold text-indigo-950">{selectedHw?.title}</span>
                </DialogDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedHw(null)} className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-5 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="submission-text" className="text-slate-700 font-medium">Text Submission / Notes</Label>
              <Textarea 
                id="submission-text" 
                placeholder="Write any comments or paste your answer here..." 
                className="min-h-[120px] focus-visible:ring-indigo-500 bg-slate-50/50" 
                value={textSubmission}
                onChange={(e) => setTextSubmission(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Upload Files</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 rounded-xl p-6 text-center cursor-pointer transition-all relative">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <Plus className="h-5 w-5 text-indigo-600 mb-1.5" />
                <p className="text-xs font-semibold text-slate-800">
                  {isUploading ? "Reading..." : "Select files to upload"}
                </p>
              </div>

              {attachedFiles.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-xs font-semibold text-slate-600">Selected Files:</p>
                  <div className="space-y-1.5">
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg text-xs shadow-sm">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span className="font-semibold text-slate-700 truncate">{file.name}</span>
                          <span className="text-slate-400 text-[9px]">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => removeAttachedFile(idx)} className="h-6 w-6 text-slate-400 hover:text-red-500 shrink-0">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex gap-2 justify-end shrink-0">
            <Button variant="outline" onClick={() => setSelectedHw(null)} className="border-slate-200 hover:bg-slate-100 text-slate-700">Cancel</Button>
            <Button onClick={handleSubmitHomework} disabled={!textSubmission && attachedFiles.length === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
