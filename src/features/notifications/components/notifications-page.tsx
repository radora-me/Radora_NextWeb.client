"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Plus,
  Search,
  Megaphone,
  Trash2,
  FileText,
  Download,
  Loader2,
  X,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import { downloadFileWithAuth, API_BASE_URL } from "@/lib/api-client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotices, useCreateNotice, useDeleteNotice } from "@/features/notifications/services/notice.service";
import { useAuth } from "@/features/auth/context/auth-context";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface AttachmentFile {
  name: string;
  base64: string;
  type: string;
}

export function NotificationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Compose form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: notices, isLoading, isError, refetch } = useNotices();
  const { mutate: createNotice, isPending: isCreating } = useCreateNotice();
  const { mutate: deleteNotice, isPending: isDeleting } = useDeleteNotice();

  const filteredNotices = (notices ?? []).filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      (n.content ?? "").toLowerCase().includes(q) ||
      n.createdBy.name.toLowerCase().includes(q)
    );
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newFiles: AttachmentFile[] = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`);
        continue;
      }
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      newFiles.push({ name: file.name, base64, type: file.type });
    }
    setAttachments((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    createNotice(
      {
        title: title.trim(),
        content: content.trim() || undefined,
        attachments:
          attachments.length > 0
            ? attachments.map((a) => ({ fileName: a.name, mimeType: a.type, base64: a.base64 }))
            : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Notice published successfully!");
          setTitle("");
          setContent("");
          setAttachments([]);
          refetch();
          setActiveTab("all");
        },
        onError: (err: any) => toast.error(`Failed to publish notice: ${err.message}`),
      }
    );
  };

  const handleDelete = (noticeId: string) => {
    deleteNotice(noticeId, {
      onSuccess: () => {
        toast.success("Notice deleted");
        refetch();
      },
      onError: (err: any) => toast.error(`Failed to delete: ${err.message}`),
    });
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Notice Board"
          description="School announcements and important notices."
          action={
            isAdmin ? (
              <Button size="sm" onClick={() => setActiveTab("compose")}>
                <Plus className="mr-1.5 h-4 w-4" />
                Post Notice
              </Button>
            ) : undefined
          }
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              <Bell className="h-4 w-4 mr-1.5" />
              All Notices
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="compose">
                <Megaphone className="h-4 w-4 mr-1.5" />
                Post Notice
              </TabsTrigger>
            )}
          </TabsList>

          {/* ── All Notices Tab ───────────────────────────────────── */}
          <TabsContent value="all" className="mt-4 space-y-4">
            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notices..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-5">
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-3 w-24" />
                  </Card>
                ))}
              </div>
            )}

            {/* Error */}
            {isError && (
              <Card className="border-red-100 bg-red-50">
                <CardContent className="p-6 flex items-center gap-3 text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm">Failed to load notices. Please refresh and try again.</p>
                </CardContent>
              </Card>
            )}

            {/* Empty */}
            {!isLoading && !isError && filteredNotices.length === 0 && (
              <Card>
                <CardContent className="p-12 flex flex-col items-center text-center text-muted-foreground gap-3">
                  <Bell className="h-10 w-10 text-slate-300" />
                  <p className="font-medium">No notices yet</p>
                  <p className="text-sm">
                    {searchQuery
                      ? "No results match your search."
                      : isAdmin
                      ? "Post the first notice using the 'Post Notice' button."
                      : "Check back later for announcements."}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Notice Cards */}
            {!isLoading && !isError && (
              <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                {filteredNotices.map((notice) => (
                  <motion.div key={notice.id} variants={itemVariants}>
                    <Card className="hover:shadow-md transition-shadow border-slate-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-lg bg-indigo-100 p-2 shrink-0">
                              <Megaphone className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-semibold text-slate-900 leading-snug">
                                {notice.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {notice.createdBy.name}
                                </Badge>
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  {formatDate(notice.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {isAdmin && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 shrink-0"
                              onClick={() => handleDelete(notice.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>

                      {(notice.content || notice.attachments.length > 0) && (
                        <CardContent className="pt-0 pl-14">
                          {notice.content && (
                            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed mb-3">
                              {notice.content}
                            </p>
                          )}

                          {notice.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {notice.attachments.map((att) => (
                                <button
                                  key={att.id}
                                  type="button"
                                  onClick={() => downloadFileWithAuth(`/notices/${notice.id}/attachments/${att.id}`, att.fileName)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
                                >
                                  <FileText className="h-3.5 w-3.5 text-indigo-500" />
                                  {att.fileName}
                                  <Download className="h-3 w-3 ml-0.5 opacity-60" />
                                </button>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          {/* ── Compose Tab (admin only) ──────────────────────────── */}
          {isAdmin && (
            <TabsContent value="compose" className="mt-4">
              <Card className="max-w-2xl">
                <form onSubmit={handleCompose}>
                  <CardHeader>
                    <CardTitle>Post a Notice</CardTitle>
                    <CardDescription>
                      This notice will be visible to all teachers and students.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="notice-title">Title *</Label>
                      <Input
                        id="notice-title"
                        placeholder="e.g. School Annual Day — 5th August"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notice-content">Content</Label>
                      <Textarea
                        id="notice-content"
                        placeholder="Write the notice details here..."
                        rows={5}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </div>

                    {/* Attachments */}
                    <div className="space-y-2">
                      <Label>Attachments</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add Files
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {attachments.map((a, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-700"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              {a.name}
                              <button
                                type="button"
                                onClick={() =>
                                  setAttachments((prev) => prev.filter((_, j) => j !== i))
                                }
                                className="ml-1 hover:text-red-500"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end gap-2 border-t pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setTitle("");
                        setContent("");
                        setAttachments([]);
                        setActiveTab("all");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {isCreating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Megaphone className="h-4 w-4 mr-2" />
                      )}
                      Publish Notice
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
