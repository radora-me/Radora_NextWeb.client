"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  CloudUpload, 
  Save, 
  Loader2, 
  BookOpen, 
  Trash2, 
  Edit, 
  FileText, 
  Download, 
  GraduationCap, 
  X, 
  Check, 
  Calendar,
  AlertTriangle,
  ClipboardList
} from "lucide-react";
import { useTeacherAvailableClasses } from "@/features/attendance/services";
import { 
  useTeacherHomework, 
  useCreateHomework, 
  useUpdateHomework,
  useDeleteHomework,
  useTeacherHomeworkDetail,
  useReopenResubmission,
  useTeacherSubmissions,
  useGradeSubmission 
} from "@/features/homework/services";
import type { HomeworkAssignment } from "@/types/api.types";
import { downloadFileWithAuth } from "@/lib/api-client";
import { useTeacherStudents } from "@/features/students/services";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Helper to convert File to Base64 string (excluding metadata prefix)
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

interface AttachmentFile {
  name: string;
  size: number;
  type: string;
  base64: string;
}

export function TeacherHomework() {
  const [activeTab, setActiveTab] = useState("list");
  const [editingHomework, setEditingHomework] = useState<HomeworkAssignment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedHwForSubmissions, setSelectedHwForSubmissions] = useState<HomeworkAssignment | null>(null);
  const [selectedHwDetail, setSelectedHwDetail] = useState<string | null>(null);

  // Form States (Create / Edit)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [courseId, setCourseId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: courses, isLoading: coursesLoading } = useTeacherAvailableClasses();
  const { data: homeworks, isLoading: homeworksLoading, refetch } = useTeacherHomework();
  const { data: students } = useTeacherStudents();
  
  const { mutate: createHomework, isPending: isCreating } = useCreateHomework();
  const { mutate: updateHomework, isPending: isUpdating } = useUpdateHomework();
  const { mutate: deleteHomework, isPending: isDeleting } = useDeleteHomework();
  const { mutate: reopenResubmission, isPending: isReopening } = useReopenResubmission();
  const { data: detailData, isLoading: detailLoading } = useTeacherHomeworkDetail(selectedHwDetail);
  
  const { data: submissionsData, isLoading: submissionsLoading, refetch: refetchSubmissions } = useTeacherSubmissions(selectedHwForSubmissions?.id || null);
  const { mutate: gradeSubmission, isPending: isGrading } = useGradeSubmission();

  const todayStr = new Date().toLocaleDateString("en-CA");

  // Handle File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const newAttachments: AttachmentFile[] = [...attachments];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds the 10MB size limit.`);
        continue;
      }
      try {
        const base64 = await fileToBase64(file);
        newAttachments.push({
          name: file.name,
          size: file.size,
          type: file.type,
          base64,
        });
      } catch (err) {
        console.error("Error reading file:", err);
      }
    }
    setAttachments(newAttachments);
    setIsUploading(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Create Homework
  const handleCreateAssignment = () => {
    if (!title || !courseId) {
      toast.error("Title and Course are required.");
      return;
    }

    if (dueAt && dueAt < todayStr) {
      toast.error("Due date cannot be in the past.");
      return;
    }

    const payload = {
      title,
      description: description || undefined,
      instructions: instructions || undefined,
      courseId,
      dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      totalMarks: parseInt(totalMarks) || 100,
      attachments: attachments.map(att => ({
        fileName: att.name,
        base64: att.base64,
        mimeType: att.type,
      })),
    };

    createHomework(payload, {
      onSuccess: () => {
        toast.success("Homework created successfully!");
        refetch();
        resetForm();
        setActiveTab("list");
      },
      onError: (err: any) => toast.error(`Error: ${err.message}`),
    });
  };

  // Start Editing
  const startEdit = (hw: HomeworkAssignment) => {
    setEditingHomework(hw);
    setTitle(hw.title);
    setDescription(hw.description || "");
    setInstructions(hw.instructions || "");
    setCourseId(hw.course.id);
    setDueAt(hw.dueAt ? new Date(hw.dueAt).toISOString().split("T")[0] : "");
    setTotalMarks(hw.totalMarks?.toString() || "100");
    setAttachments([]); // reset attachments (will be newly uploaded if any)
    setActiveTab("edit");
  };

  // Update Homework
  const handleUpdateAssignment = () => {
    if (!editingHomework) return;

    if (dueAt && dueAt < todayStr) {
      toast.error("Due date cannot be in the past.");
      return;
    }

    const payload = {
      title,
      description,
      instructions,
      dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      totalMarks: parseInt(totalMarks) || 100,
      attachments: attachments.length > 0 ? attachments.map(att => ({
        fileName: att.name,
        base64: att.base64,
        mimeType: att.type,
      })) : undefined,
    };

    updateHomework(
      { homeworkId: editingHomework.id, data: payload },
      {
        onSuccess: () => {
          toast.success("Homework updated successfully!");
          refetch();
          resetForm();
          setActiveTab("list");
        },
        onError: (err: any) => toast.error(`Error: ${err.message}`),
      }
    );
  };

  // Delete Homework
  const handleDelete = () => {
    if (!deleteConfirmId) return;
    deleteHomework(deleteConfirmId, {
      onSuccess: () => {
        toast.success("Homework deleted successfully!");
        refetch();
        setDeleteConfirmId(null);
      },
      onError: (err: any) => toast.error(`Error: ${err.message}`),
    });
  };

  // Grade Submission
  const handleSaveGrade = (studentId: string, marks: number, feedback: string) => {
    if (!selectedHwForSubmissions) return;
    
    gradeSubmission(
      { homeworkId: selectedHwForSubmissions.id, studentId, marks, feedback },
      {
        onSuccess: () => {
          toast.success("Submission graded successfully");
          refetchSubmissions();
        },
        onError: (err: any) => {
          toast.error("Failed to grade submission", { description: err.message });
        }
      }
    );
  };

  const handleMockDownload = (file: any) => {
    // Generate a dummy text file since this is a frontend-only mock submission
    const content = `This is a mock downloaded file for: ${file.name}\nSize: ${file.size} bytes\nType: ${file.type}\n\nNote: Because the backend does not yet support file uploads, the file contents were not uploaded to the server. This is a dummy text file to test the UI flow.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // Append .txt so the OS doesn't try to open the dummy text file as a PNG/PDF
    a.download = `${file.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setInstructions("");
    setCourseId("");
    setDueAt("");
    setTotalMarks("100");
    setAttachments([]);
    setEditingHomework(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homework & Assignments"
        description="Create assignments, manage coursework, and grade student submissions."
      />

      <Tabs value={activeTab} onValueChange={(val) => {
        if (val !== "edit") {
          resetForm();
        }
        setActiveTab(val);
      }} className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2 bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="list" className="rounded-md">All Assignments</TabsTrigger>
          <TabsTrigger value="create" className="rounded-md">Create Assignment</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Assignments List ── */}
        <TabsContent value="list">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-indigo-100 shadow-sm overflow-hidden bg-white">
              <CardHeader className="border-b border-indigo-50/50 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Active Assignments</CardTitle>
                    <CardDescription>View, edit, or grade assignments across your classes.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => refetch()} disabled={homeworksLoading} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    {homeworksLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700 pl-6">Title</TableHead>
                      <TableHead className="font-semibold text-slate-700">Class</TableHead>
                      <TableHead className="font-semibold text-slate-700">Due Date</TableHead>
                      <TableHead className="font-semibold text-slate-700">Total Marks</TableHead>
                      <TableHead className="font-semibold text-slate-700">Submissions</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {homeworksLoading ? (
                      <>
                        {[1, 2, 3].map((i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-3/4 bg-slate-100" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-1/2 bg-slate-100" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24 bg-slate-100" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-12 bg-slate-100" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-24 bg-indigo-50/50 rounded-md" /></TableCell>
                            <TableCell className="text-right flex justify-end gap-2"><Skeleton className="h-8 w-8 bg-slate-100 rounded-md" /><Skeleton className="h-8 w-8 bg-slate-100 rounded-md" /></TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : homeworks && homeworks.length > 0 ? (
                      homeworks.map((hw) => (
                        <TableRow 
                          key={hw.id} 
                          className="hover:bg-indigo-50/20 transition-colors cursor-pointer"
                          onClick={() => setSelectedHwDetail(hw.id)}
                        >
                          <TableCell className="font-medium text-slate-900 pl-6">
                            <div className="flex items-center gap-2.5">
                              <BookOpen className="w-4 h-4 text-indigo-500" />
                              <span className="font-semibold">{hw.title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">{hw.course?.title}</TableCell>
                          <TableCell className="text-slate-600">
                            {hw.dueAt ? new Date(hw.dueAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "No due date"}
                          </TableCell>
                          <TableCell className="text-slate-600 font-medium">{hw.totalMarks ?? "N/A"}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => { e.stopPropagation(); setSelectedHwForSubmissions(hw); }}
                              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 flex items-center gap-1.5 h-8 font-medium"
                            >
                              <ClipboardList className="w-4 h-4" />
                              Grade ({hw.submissionsCount || 0} submitted)
                            </Button>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" onClick={() => startEdit(hw)} className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(hw.id)} className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                          No assignments found. Click "Create Assignment" to add one.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Tab 2: Create Assignment ── */}
        <TabsContent value="create">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-indigo-100 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-800">New Assignment</CardTitle>
                <CardDescription>Fill in the details below to create and publish a new homework assignment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-slate-700 font-medium">Title *</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Chapter 3 Math Exercises" 
                      className="focus-visible:ring-indigo-500 bg-slate-50/50" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class" className="text-slate-700 font-medium">Class *</Label>
                    <Select value={courseId} onValueChange={(v) => setCourseId(v ?? "")} disabled={coursesLoading}>
                      <SelectTrigger id="class" className="w-full bg-slate-50/50">
                        <SelectValue placeholder={coursesLoading ? "Loading classes..." : "Select class"} />
                      </SelectTrigger>
                      <SelectContent>
                        {courses?.map(c => {
                          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c.title?.trim() ?? "");
                          const label = isUUID
                            ? `Class${c.description ? ` — Section ${c.description}` : ""}`
                            : `${c.title}${c.description ? ` — Section ${c.description}` : ""}`;
                          return <SelectItem key={c.id} value={c.id}>{label}</SelectItem>;
                        })}
                        {courseId && editingHomework?.course?.id === courseId && (!courses || !courses.some(c => c.id === courseId)) && (
                          <SelectItem key={courseId} value={courseId}>
                            {/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(editingHomework.course.title?.trim() ?? "") 
                              ? `Class${editingHomework.course.description ? ` — Section ${editingHomework.course.description}` : ""}`
                              : `${editingHomework.course.title}${editingHomework.course.description ? ` — Section ${editingHomework.course.description}` : ""}`
                            }
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="due-date" className="text-slate-700 font-medium">Due Date</Label>
                    <Input 
                      id="due-date" 
                      type="date" 
                      min={todayStr}
                      className="focus-visible:ring-indigo-500 bg-slate-50/50" 
                      value={dueAt}
                      onChange={(e) => setDueAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total-marks" className="text-slate-700 font-medium">Total Marks</Label>
                    <Input 
                      id="total-marks" 
                      type="number" 
                      placeholder="100" 
                      className="focus-visible:ring-indigo-500 bg-slate-50/50" 
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 font-medium">Description / Overview</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the assignment details and goals..." 
                    className="min-h-[100px] focus-visible:ring-indigo-500 bg-slate-50/50" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-slate-700 font-medium">Step-by-step Instructions</Label>
                  <Textarea 
                    id="instructions" 
                    placeholder="Provide detailed submission guidelines, formatting rules, etc..." 
                    className="min-h-[100px] focus-visible:ring-indigo-500 bg-slate-50/50" 
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>

                {/* File Attachment Uploader */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Attachments (Max 10 files, 10MB each)</Label>
                  
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 rounded-xl p-6 text-center cursor-pointer transition-all relative">
                    <input 
                      type="file" 
                      multiple 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center mb-2.5">
                      <CloudUpload className="h-5 w-5 text-indigo-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {isUploading ? "Reading files..." : "Click or drag files here to attach"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PDF, DOCX, PNG, JPG, ZIP, etc. are supported.</p>
                  </div>

                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-slate-600">Attached Files:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm text-xs">
                            <div className="flex items-center gap-2 truncate pr-3">
                              <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                              <span className="font-semibold text-slate-700 truncate">{file.name}</span>
                              <span className="text-slate-400 text-[10px]">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => removeAttachment(idx)}
                              className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t bg-slate-50/50 px-6 py-4">
                <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-100" onClick={() => { resetForm(); setActiveTab("list"); }}>Cancel</Button>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white" 
                  onClick={handleCreateAssignment}
                  disabled={isCreating || isUploading}
                >
                  {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Publish Assignment
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Tab 3: Edit Assignment (Conditional) ── */}
        <TabsContent value="edit">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-indigo-100 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-800">Edit Assignment</CardTitle>
                <CardDescription>Make changes to the assignment details. Re-uploading attachments will replace existing ones on Cloudinary.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title" className="text-slate-700 font-medium">Title *</Label>
                    <Input 
                      id="edit-title" 
                      placeholder="e.g. Chapter 3 Math Exercises" 
                      className="focus-visible:ring-indigo-500 bg-slate-50/50" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Class</Label>
                    <Input value={editingHomework?.course.title || ""} disabled className="bg-slate-100 text-slate-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="edit-due-date" className="text-slate-700 font-medium">Due Date</Label>
                    <Input 
                      id="edit-due-date" 
                      type="date" 
                      min={todayStr}
                      className="focus-visible:ring-indigo-500 bg-slate-50/50" 
                      value={dueAt}
                      onChange={(e) => setDueAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-total-marks" className="text-slate-700 font-medium">Total Marks</Label>
                    <Input 
                      id="edit-total-marks" 
                      type="number" 
                      placeholder="100" 
                      className="focus-visible:ring-indigo-500 bg-slate-50/50" 
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-slate-700 font-medium">Description / Overview</Label>
                  <Textarea 
                    id="edit-description" 
                    placeholder="Describe the assignment details..." 
                    className="min-h-[100px] focus-visible:ring-indigo-500 bg-slate-50/50" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-instructions" className="text-slate-700 font-medium">Step-by-step Instructions</Label>
                  <Textarea 
                    id="edit-instructions" 
                    placeholder="Provide detailed submission guidelines..." 
                    className="min-h-[100px] focus-visible:ring-indigo-500 bg-slate-50/50" 
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>

                {/* Attachments Section */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Add New Attachments (Replaces all previous files)</Label>
                  
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 rounded-xl p-6 text-center cursor-pointer transition-all relative">
                    <input 
                      type="file" 
                      multiple 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center mb-2.5">
                      <CloudUpload className="h-5 w-5 text-indigo-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {isUploading ? "Reading files..." : "Click or drag files to replace attachments"}
                    </p>
                  </div>

                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-slate-600">New Files to Upload:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm text-xs">
                            <div className="flex items-center gap-2 truncate pr-3">
                              <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                              <span className="font-semibold text-slate-700 truncate">{file.name}</span>
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => removeAttachment(idx)} className="h-6 w-6 text-slate-400 hover:text-red-500 shrink-0">
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t bg-slate-50/50 px-6 py-4">
                <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-100" onClick={() => { resetForm(); setActiveTab("list"); }}>Cancel</Button>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white" 
                  onClick={handleUpdateAssignment}
                  disabled={isUpdating || isUploading}
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md bg-white border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-950 flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Assignment?
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm mt-2">
              Are you sure you want to delete this assignment? This will permanently remove the homework and all attached files from Cloudinary. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="border-slate-200 hover:bg-slate-100 text-slate-700">Cancel</Button>
            <Button onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Submissions & Grading Modal (Mock) ── */}
      <Dialog open={!!selectedHwForSubmissions} onOpenChange={(open) => !open && setSelectedHwForSubmissions(null)}>
        <DialogContent className="max-w-4xl sm:max-w-4xl bg-white border-slate-100 h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-slate-100 shrink-0">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                  Grade Submissions
                </DialogTitle>
                <DialogDescription className="text-slate-500 mt-1">
                  Evaluating submissions for: <span className="font-semibold text-indigo-950">{selectedHwForSubmissions?.title}</span> ({selectedHwForSubmissions?.course.title})
                </DialogDescription>
              </div>
              
              {selectedHwForSubmissions && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                  onClick={() => {
                    reopenResubmission(selectedHwForSubmissions.id, {
                      onSuccess: () => {
                        toast.success("Homework reopened for resubmission");
                        refetchSubmissions();
                      }
                    });
                  }}
                  disabled={isReopening}
                >
                  <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-500" />
                  Reopen Homework
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {submissionsLoading ? (
              <div className="py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
            ) : (
              <div className="space-y-6">
                {submissionsData?.students.map((row) => {
                  const sub = row.submission;
                  const hasSubmission = row.hasSubmission && sub;
                  return (
                    <div key={row.student.id} className="border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm">
                            {row.student.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 text-sm">{row.student.name}</h4>
                            <p className="text-xs text-slate-500">Roll Number: {row.student.rollNumber}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {row.status === "GRADED" ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                              Graded: {sub?.marks}/{selectedHwForSubmissions?.totalMarks || 100}
                            </Badge>
                          ) : row.status === "SUBMITTED" ? (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                              Submitted
                            </Badge>
                          ) : row.status === "LATE" ? (
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                              Late
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>

                      {hasSubmission && sub ? (
                        <div className="space-y-4">
                          {/* Student text submission */}
                          <div className="bg-white border border-slate-100 rounded-lg p-3.5 text-sm text-slate-700">
                            <p className="font-semibold text-xs text-slate-400 mb-1">STUDENT SUBMISSION NOTE:</p>
                            {sub.textSubmission}
                          </div>

                          {/* Student attachments */}
                          {sub.attachments && sub.attachments.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="font-semibold text-xs text-slate-400">STUDENT ATTACHMENTS:</p>
                            {sub.attachments.map((file: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-100 rounded-lg text-xs max-w-md">
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                                  <span className="font-medium text-slate-700 truncate">{file.fileName}</span>
                                </div>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-7 w-7 text-indigo-600 hover:bg-indigo-50"
                                  onClick={() => {
                                    if (selectedHwForSubmissions) {
                                      downloadFileWithAuth(
                                        `/homework/teacher/${selectedHwForSubmissions.id}/submissions/${sub.studentId}/attachments/${file.id}`,
                                        file.fileName
                                      );
                                    }
                                  }}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Grading Form or Static Display */}
                        {row.status === "GRADED" ? (
                          <div className="border-t border-slate-100 pt-4 mt-2">
                            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">Teacher Feedback</span>
                            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3.5 text-sm text-emerald-800 font-medium">
                              {sub.feedback ? sub.feedback : <span className="italic text-emerald-600/70">No specific feedback provided.</span>}
                            </div>
                          </div>
                        ) : (
                          <div className="border-t border-slate-100 pt-4 mt-2">
                            <GradingForm 
                              maxMarks={selectedHwForSubmissions?.totalMarks || 100} 
                              initialMarks={sub.marks}
                              initialFeedback={sub.feedback || ""}
                              onSave={(marks, feedback) => handleSaveGrade(row.student.id, marks, feedback)}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No submission received yet.</p>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedHwDetail} onOpenChange={(open) => !open && setSelectedHwDetail(null)}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Assignment Details
            </DialogTitle>
          </DialogHeader>
          
          {detailLoading ? (
            <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
          ) : detailData ? (
            <div className="space-y-6 pt-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{detailData.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Due: {detailData.dueAt ? new Date(detailData.dueAt).toLocaleDateString() : 'No date'}</span>
                  <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> Max Marks: {detailData.totalMarks || 100}</span>
                </div>
              </div>
              
              {detailData.description && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap">
                  {detailData.description}
                </div>
              )}
              
              {detailData.instructions && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 text-sm">Instructions</h4>
                  <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {detailData.instructions}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-500">Assignment not found</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-component for Grading Form
function GradingForm({ 
  maxMarks, 
  initialMarks, 
  initialFeedback,
  onSave 
}: { 
  maxMarks: number; 
  initialMarks: number | null;
  initialFeedback: string;
  onSave: (marks: number, feedback: string) => void;
}) {
  const [marks, setMarks] = useState(initialMarks?.toString() || "");
  const [feedback, setFeedback] = useState(initialFeedback || "");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="sm:col-span-3 space-y-1.5">
        <Label className="text-xs font-semibold text-slate-700">Marks (Max: {maxMarks})</Label>
        <Input 
          type="number" 
          max={maxMarks}
          min={0}
          placeholder="Score" 
          value={marks} 
          onChange={(e) => setMarks(e.target.value)}
          className="bg-white h-10 focus-visible:ring-indigo-500 font-medium w-full"
        />
      </div>
      <div className="sm:col-span-6 space-y-1.5">
        <Label className="text-xs font-semibold text-slate-700">Feedback / Comments</Label>
        <Input 
          placeholder="e.g. Excellent work..." 
          value={feedback} 
          onChange={(e) => setFeedback(e.target.value)}
          className="bg-white h-10 focus-visible:ring-indigo-500 w-full"
        />
      </div>
      <Button 
        size="sm" 
        onClick={() => onSave(parseInt(marks) || 0, feedback)}
        disabled={!marks}
        className="sm:col-span-3 w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 shadow-sm"
      >
        <Check className="w-4 h-4" />
        Grade
      </Button>
    </div>
  );
}
