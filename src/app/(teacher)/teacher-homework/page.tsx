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
import { useTeacherCourses } from "@/features/attendance/services";
import { 
  useTeacherHomework, 
  useCreateHomework, 
  useUpdateHomework, 
  useDeleteHomework,
  HomeworkAssignment 
} from "@/features/homework/services";

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

export default function TeacherHomeworkPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [editingHomework, setEditingHomework] = useState<HomeworkAssignment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedHwForSubmissions, setSelectedHwForSubmissions] = useState<HomeworkAssignment | null>(null);

  // Form States (Create / Edit)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [courseId, setCourseId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Mock Grading States (since backend has no submissions/grading endpoints yet)
  const [mockSubmissions, setMockSubmissions] = useState<any[]>([]);

  const { data: courses, isLoading: coursesLoading } = useTeacherCourses();
  const { data: homeworks, isLoading: homeworksLoading, refetch } = useTeacherHomework();
  
  const { mutate: createHomework, isPending: isCreating } = useCreateHomework();
  const { mutate: updateHomework, isPending: isUpdating } = useUpdateHomework();
  const { mutate: deleteHomework, isPending: isDeleting } = useDeleteHomework();

  // Load mock submissions from localStorage on selection
  useEffect(() => {
    if (selectedHwForSubmissions) {
      const hwId = selectedHwForSubmissions.id;
      // Fetch mock students or load existing ones
      const localKey = `mock_submissions_${hwId}`;
      const saved = localStorage.getItem(localKey);
      if (saved) {
        setMockSubmissions(JSON.parse(saved));
      } else {
        // Generate initial mock submissions for this homework
        const initialMocks = [
          { studentId: "std-1", name: "Amit Kumar", rollNumber: "101", status: "SUBMITTED", submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(), textSubmission: "Please find my attached solutions for Chapter 3 exercises.", marks: null as number | null, feedback: "", attachments: [] as any[] },
          { studentId: "std-2", name: "Priya Sharma", rollNumber: "105", status: "SUBMITTED", submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(), textSubmission: "I have completed all the questions listed in the assignment.", marks: null as number | null, feedback: "", attachments: [] as any[] },
          { studentId: "std-3", name: "Rahul Verma", rollNumber: "112", status: "PENDING", submittedAt: null as string | null, textSubmission: null as string | null, marks: null as number | null, feedback: "", attachments: [] as any[] },
          { studentId: "std-4", name: "Sneha Patel", rollNumber: "118", status: "GRADED", submittedAt: new Date(Date.now() - 3600000 * 48).toISOString(), textSubmission: "Submitted the complete assignment on time.", marks: 85, feedback: "Good effort! Check question 4 again.", attachments: [] as any[] },
        ];
        // Also check if the student submitted anything via the student portal
        const studentSubmitKey = `student_submission_${hwId}`;
        const studentSubmit = localStorage.getItem(studentSubmitKey);
        if (studentSubmit) {
          const parsed = JSON.parse(studentSubmit);
          // Replace or add student submission
          const idx = initialMocks.findIndex(m => m.studentId === "student-session-id" || m.rollNumber === "101"); // Mock student
          if (idx > -1) {
            initialMocks[idx] = {
              ...initialMocks[idx],
              status: "SUBMITTED",
              submittedAt: parsed.submittedAt,
              textSubmission: parsed.textSubmission,
              attachments: parsed.attachments || []
            };
          }
        }
        localStorage.setItem(localKey, JSON.stringify(initialMocks));
        setMockSubmissions(initialMocks);
      }
    }
  }, [selectedHwForSubmissions]);

  // Handle File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const newAttachments: AttachmentFile[] = [...attachments];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} exceeds the 10MB size limit.`);
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
      alert("Title and Course are required.");
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
        alert("Homework created successfully!");
        refetch();
        resetForm();
        setActiveTab("list");
      },
      onError: (err: any) => alert(`Error: ${err.message}`),
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
          alert("Homework updated successfully!");
          refetch();
          resetForm();
          setActiveTab("list");
        },
        onError: (err: any) => alert(`Error: ${err.message}`),
      }
    );
  };

  // Delete Homework
  const handleDelete = () => {
    if (!deleteConfirmId) return;
    deleteHomework(deleteConfirmId, {
      onSuccess: () => {
        alert("Homework deleted successfully!");
        refetch();
        setDeleteConfirmId(null);
      },
      onError: (err: any) => alert(`Error: ${err.message}`),
    });
  };

  // Grade Mock Submission
  const handleSaveGrade = (studentId: string, marks: number, feedback: string) => {
    if (!selectedHwForSubmissions) return;
    const updated = mockSubmissions.map(sub => {
      if (sub.studentId === studentId) {
        return { ...sub, status: "GRADED", marks, feedback };
      }
      return sub;
    });
    setMockSubmissions(updated);
    localStorage.setItem(`mock_submissions_${selectedHwForSubmissions.id}`, JSON.stringify(updated));
    alert("Grade saved successfully!");
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
                    <CardDescription>View, edit, or grade assignments across your courses.</CardDescription>
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
                      <TableHead className="font-semibold text-slate-700">Course</TableHead>
                      <TableHead className="font-semibold text-slate-700">Due Date</TableHead>
                      <TableHead className="font-semibold text-slate-700">Total Marks</TableHead>
                      <TableHead className="font-semibold text-slate-700">Submissions</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {homeworksLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                          Loading assignments...
                        </TableCell>
                      </TableRow>
                    ) : homeworks && homeworks.length > 0 ? (
                      homeworks.map((hw) => (
                        <TableRow key={hw.id} className="hover:bg-indigo-50/20 transition-colors">
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
                              onClick={() => setSelectedHwForSubmissions(hw)}
                              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 flex items-center gap-1.5 h-8 font-medium"
                            >
                              <ClipboardList className="w-4 h-4" />
                              Grade ({hw.submissionsCount || 2} submitted)
                            </Button>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2">
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
                    <Label htmlFor="class" className="text-slate-700 font-medium">Course *</Label>
                    <Select value={courseId} onValueChange={(v) => setCourseId(v ?? "")} disabled={coursesLoading}>
                      <SelectTrigger id="class" className="w-full bg-slate-50/50">
                        <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Select course"} />
                      </SelectTrigger>
                      <SelectContent>
                        {courses?.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
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
                    <Label className="text-slate-700 font-medium">Course</Label>
                    <Input value={editingHomework?.course.title || ""} disabled className="bg-slate-100 text-slate-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="edit-due-date" className="text-slate-700 font-medium">Due Date</Label>
                    <Input 
                      id="edit-due-date" 
                      type="date" 
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
        <DialogContent className="max-w-4xl bg-white border-slate-100 h-[85vh] flex flex-col p-0 overflow-hidden">
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
              <Button variant="ghost" size="icon" onClick={() => setSelectedHwForSubmissions(null)} className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            <div className="space-y-6">
              {mockSubmissions.map((sub) => {
                const hasSubmission = sub.status !== "PENDING";
                return (
                  <div key={sub.studentId} className="border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm">
                          {sub.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">{sub.name}</h4>
                          <p className="text-xs text-slate-500">Roll Number: {sub.rollNumber}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {sub.status === "GRADED" ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            Graded: {sub.marks}/{selectedHwForSubmissions?.totalMarks || 100}
                          </Badge>
                        ) : sub.status === "SUBMITTED" ? (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            Submitted
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>

                    {hasSubmission ? (
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
                                  <span className="font-medium text-slate-700 truncate">{file.name}</span>
                                </div>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-indigo-600 hover:bg-indigo-50">
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Grading Form */}
                        <div className="border-t border-slate-100 pt-4 mt-2">
                          <GradingForm 
                            maxMarks={selectedHwForSubmissions?.totalMarks || 100} 
                            initialMarks={sub.marks}
                            initialFeedback={sub.feedback}
                            onSave={(marks, feedback) => handleSaveGrade(sub.studentId, marks, feedback)}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No submission received yet.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-700">Marks Assigned (Max: {maxMarks})</Label>
        <Input 
          type="number" 
          max={maxMarks}
          min={0}
          placeholder="Enter score" 
          value={marks} 
          onChange={(e) => setMarks(e.target.value)}
          className="bg-white h-9 focus-visible:ring-indigo-500"
        />
      </div>
      <div className="space-y-1.5 md:col-span-2 flex gap-3 items-end">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Feedback / Comments</Label>
          <Input 
            placeholder="Good job! Or area of improvements..." 
            value={feedback} 
            onChange={(e) => setFeedback(e.target.value)}
            className="bg-white h-9 focus-visible:ring-indigo-500"
          />
        </div>
        <Button 
          size="sm" 
          onClick={() => onSave(parseInt(marks) || 0, feedback)}
          disabled={!marks}
          className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4 flex items-center gap-1.5 shrink-0"
        >
          <Check className="w-4 h-4" />
          Grade
        </Button>
      </div>
    </div>
  );
}
