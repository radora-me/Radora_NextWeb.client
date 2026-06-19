"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudUpload, Save, Loader2, BookOpen } from "lucide-react";
import { useTeacherCourses, useTeacherHomework, useCreateHomework } from "@/features/teacher/api";

export default function TeacherHomeworkPage() {
  const [activeTab, setActiveTab] = useState("list");

  // Create Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");

  const { data: courses, isLoading: coursesLoading } = useTeacherCourses();
  const { data: homeworks, isLoading: homeworksLoading, refetch } = useTeacherHomework();
  const { mutate: createHomework, isPending: isCreating } = useCreateHomework();

  const handleCreateAssignment = () => {
    if (!title || !courseId) {
      alert("Title and Course are required.");
      return;
    }

    createHomework(
      {
        title,
        description,
        courseId,
        dueAt: dueAt || undefined,
        totalMarks: parseInt(totalMarks) || 100,
      },
      {
        onSuccess: () => {
          alert("Homework created successfully!");
          refetch();
          setTitle("");
          setDescription("");
          setDueAt("");
          setActiveTab("list");
        },
        onError: (err) => alert(`Error: ${err.message}`),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homework & Assignments"
        description="Create assignments and manage student coursework."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list">All Assignments</TabsTrigger>
          <TabsTrigger value="create">Create Assignment</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-indigo-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-white pb-4">
                <CardTitle className="text-xl text-indigo-950 flex justify-between items-center">
                  <span>Active Assignments</span>
                  <Button variant="outline" size="sm" onClick={() => refetch()} disabled={homeworksLoading}>
                    {homeworksLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
                  </Button>
                </CardTitle>
                <CardDescription>View all published and draft assignments across your courses.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-indigo-50/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-indigo-900 pl-6">Title</TableHead>
                      <TableHead className="font-semibold text-indigo-900">Course</TableHead>
                      <TableHead className="font-semibold text-indigo-900">Due Date</TableHead>
                      <TableHead className="font-semibold text-indigo-900">Total Marks</TableHead>
                      <TableHead className="text-right font-semibold text-indigo-900 pr-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {homeworksLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                          Loading assignments...
                        </TableCell>
                      </TableRow>
                    ) : homeworks && homeworks.length > 0 ? (
                      homeworks.map((hw) => (
                        <TableRow key={hw.id} className="hover:bg-indigo-50/30">
                          <TableCell className="font-medium text-indigo-950 pl-6">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-indigo-400" />
                              {hw.title}
                            </div>
                          </TableCell>
                          <TableCell className="text-indigo-800">{hw.course?.title}</TableCell>
                          <TableCell className="text-zinc-600">
                            {hw.dueAt ? new Date(hw.dueAt).toLocaleDateString() : "No due date"}
                          </TableCell>
                          <TableCell className="text-zinc-600">{hw.totalMarks}</TableCell>
                          <TableCell className="text-right pr-6">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${hw.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {hw.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
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

        <TabsContent value="create">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-indigo-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-indigo-950">New Assignment</CardTitle>
                <CardDescription>Fill in the details below to create a new homework assignment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Chapter 3 Math Exercises" 
                      className="focus-visible:ring-indigo-500" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">Course *</Label>
                    <Select value={courseId} onValueChange={(v) => setCourseId(v ?? "")} disabled={coursesLoading}>
                      <SelectTrigger id="class" className="w-full focus:ring-indigo-500">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input 
                      id="due-date" 
                      type="date" 
                      className="focus-visible:ring-indigo-500" 
                      value={dueAt}
                      onChange={(e) => setDueAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total-marks">Total Marks</Label>
                    <Input 
                      id="total-marks" 
                      type="number" 
                      placeholder="100" 
                      className="focus-visible:ring-indigo-500" 
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the assignment requirements..." 
                    className="min-h-[120px] focus-visible:ring-indigo-500" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attachment (Coming Soon)</Label>
                  <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-not-allowed opacity-70">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                      <CloudUpload className="h-6 w-6 text-indigo-600" />
                    </div>
                    <p className="text-sm font-medium text-indigo-950">File uploading is disabled in this demo</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t bg-muted/20 px-6 py-4">
                <Button variant="outline" className="border-indigo-200 text-indigo-900 hover:bg-indigo-50" onClick={() => setActiveTab("list")}>Cancel</Button>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white" 
                  onClick={handleCreateAssignment}
                  disabled={isCreating}
                >
                  {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Create Assignment
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
