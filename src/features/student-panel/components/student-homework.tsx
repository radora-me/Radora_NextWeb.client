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
  Plus,
  UploadCloud,
  Trash2
} from "lucide-react";
import { useStudentHomework, useStudentHomeworkDetail, useStudentSubmission, useSubmitHomework } from "@/features/homework/services";
import type { StudentHomework as StudentHomeworkType } from "@/types/api.types";
import { downloadFileWithAuth } from "@/lib/api-client";
import { useAuth } from "@/features/auth/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface LocalAttachment {
  fileName: string;
  size: number;
  mimeType: string;
  base64: string;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export function StudentHomework() {
  const { user } = useAuth();
  const { data: homeworks, isLoading, isError, refetch } = useStudentHomework();
  
  // Selected homework for detail / submission modal
  const [selectedHw, setSelectedHw] = useState<StudentHomeworkType | null>(null);
  const [selectedHwDetail, setSelectedHwDetail] = useState<string | null>(null);

  const { data: hwDetail, isLoading: detailLoading } = useStudentHomeworkDetail(selectedHwDetail);
  const { data: hwSubmission, isLoading: submissionLoading } = useStudentSubmission(selectedHwDetail);
  
  // Submission states
  const [textSubmission, setTextSubmission] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<LocalAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const { mutate: submitHomework, isPending: isSubmitting } = useSubmitHomework();

  // Handle local file attachment
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const newFiles = [...attachedFiles];

    for (const file of files) {
      try {
        const base64 = await fileToBase64(file);
        newFiles.push({
          fileName: file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
          base64
        });
      } catch (err) {
        toast.error(`Failed to read file: ${file.name}`);
      }
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
    
    submitHomework(
      {
        homeworkId: selectedHw.id,
        payload: {
          textSubmission: textSubmission || undefined,
          attachments: attachedFiles.length > 0 ? attachedFiles : undefined
        }
      },
      {
        onSuccess: () => {
          toast.success("Assignment submitted successfully!", {
            description: "Your teacher will review your submission shortly."
          });
          setTextSubmission("");
          setAttachedFiles([]);
          setSelectedHw(null);
        },
        onError: (err: any) => {
          toast.error("Failed to submit homework", { description: err.message });
        }
      }
    );
  };

  // Helper to get status of the submission
  const getSubmissionStatus = (hw: StudentHomeworkType) => {
    const backendSub = hw.mySubmission;
    if (backendSub) {
      switch (backendSub.status) {
        case "GRADED":
          return { text: `Graded: ${backendSub.marks}/${hw.totalMarks}`, color: "bg-emerald-100 text-emerald-700 border-emerald-200", isGraded: true, marks: backendSub.marks, feedback: backendSub.feedback };
        case "SUBMITTED":
          return { text: "Submitted", color: "bg-blue-100 text-blue-700 border-blue-200", isSubmitted: true };
        case "LATE":
          return { text: "Submitted Late", color: "bg-orange-100 text-orange-700 border-orange-200", isSubmitted: true };
      }
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
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-indigo-100 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="w-full">
                      <Skeleton className="h-5 w-24 mb-2 bg-indigo-100/50" />
                      <Skeleton className="h-6 w-3/4 bg-slate-200" />
                    </div>
                    <Skeleton className="h-6 w-20 bg-slate-200 shrink-0" />
                  </div>
                  <Skeleton className="h-3 w-1/3 mt-3 bg-slate-200" />
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  <Skeleton className="h-20 w-full bg-slate-100" />
                  <Skeleton className="h-10 w-full bg-slate-100" />
                </CardContent>
              </div>
            </Card>
          ))}
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
                          {hw.course?.title}{hw.course?.description ? ` — Section ${hw.course.description}` : ""}
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
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                              onClick={() => downloadFileWithAuth(`/homework/student/${hw.id}/attachments/${att.id}`, att.fileName)}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
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
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-xs mb-2">
                        <p className="font-bold text-emerald-900 mb-0.5">Feedback from Teacher:</p>
                        <p className="text-emerald-800 font-medium">{status.feedback || "Great job!"}</p>
                      </div>
                    ) : status.isSubmitted ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mb-2">
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
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs mb-2"
                      >
                        Submit Assignment
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedHwDetail(hw.id)}
                      className="w-full font-semibold text-xs"
                    >
                      View Full Details
                    </Button>
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
                          <span className="font-semibold text-slate-700 truncate">{file.fileName}</span>
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
            <Button onClick={handleSubmitHomework} disabled={isSubmitting || (!textSubmission && attachedFiles.length === 0)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CloudUpload className="w-4 h-4 mr-2" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Detail Modal ── */}
      <Dialog open={!!selectedHwDetail} onOpenChange={(open) => !open && setSelectedHwDetail(null)}>
        <DialogContent className="max-w-2xl bg-white border-slate-100 p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-6 border-b border-slate-100 shrink-0">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Assignment Details
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {detailLoading ? (
              <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
            ) : hwDetail ? (
              <>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{hwDetail.title}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Due: {hwDetail.dueAt ? new Date(hwDetail.dueAt).toLocaleDateString() : 'No date'}</span>
                    <span className="flex items-center gap-1.5"><Award className="w-4 h-4" /> Max Marks: {hwDetail.totalMarks || 100}</span>
                  </div>
                </div>
                
                {hwDetail.description && (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap">
                    {hwDetail.description}
                  </div>
                )}
                
                {hwDetail.instructions && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-900 text-sm">Instructions</h4>
                    <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {hwDetail.instructions}
                    </div>
                  </div>
                )}

                {/* Live Submission Status block */}
                <div className="border-t border-slate-100 pt-6">
                  <h4 className="font-semibold text-slate-900 text-sm mb-3">My Submission Status</h4>
                  {submissionLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : hwSubmission ? (
                    <div className={`p-4 rounded-lg border ${
                      hwSubmission.status === 'GRADED' ? 'bg-emerald-50 border-emerald-100' :
                      hwSubmission.status === 'SUBMITTED' ? 'bg-blue-50 border-blue-100' :
                      'bg-orange-50 border-orange-100'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={
                          hwSubmission.status === 'GRADED' ? 'bg-emerald-100 text-emerald-800' :
                          hwSubmission.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }>{hwSubmission.status}</Badge>
                        {hwSubmission.marks !== null && (
                          <span className="font-bold text-emerald-700">{hwSubmission.marks} / {hwDetail.totalMarks} Marks</span>
                        )}
                      </div>
                      {hwSubmission.feedback && (
                        <p className="text-sm text-slate-700 mt-2"><span className="font-semibold text-slate-900">Feedback:</span> {hwSubmission.feedback}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-2">Submitted on: {hwSubmission.submittedAt ? new Date(hwSubmission.submittedAt).toLocaleString() : 'N/A'}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Not submitted yet.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="py-10 text-center text-slate-500">Assignment not found</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
