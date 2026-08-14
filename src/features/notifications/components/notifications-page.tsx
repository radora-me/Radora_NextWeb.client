"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Send,
  Plus,
  Search,
  Megaphone,
  AlertTriangle,
  Clock,
  Mail,
  CheckCircle2,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { mockNotifications } from "@/features/notifications/data/mock-notifications";
import type { Notification } from "@/features/notifications/data/mock-notifications";

const typeIcons: Record<Notification["type"], React.ElementType> = {
  announcement: Megaphone,
  alert: AlertTriangle,
  reminder: Clock,
  message: Mail,
};

const typeColors: Record<Notification["type"], string> = {
  announcement: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  alert: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  reminder: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  message: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
};

const priorityColors: Record<Notification["priority"], string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [showSuccess, setShowSuccess] = useState(false);

  // Stats
  const totalCount = mockNotifications.length;
  const unreadCount = mockNotifications.filter((n) => !n.read).length;
  const highPriorityCount = mockNotifications.filter((n) => n.priority === "high").length;

  const filteredNotifications = useMemo(() => {
    return mockNotifications.filter((n) => {
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      if (priorityFilter !== "all" && n.priority !== priorityFilter) return false;
      if (
        searchQuery &&
        !n.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !n.message.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [typeFilter, priorityFilter, searchQuery]);

  const handleCompose = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
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
          title="Notifications"
          description="Send announcements and manage messages."
          action={
            <Button size="sm" onClick={() => setActiveTab("compose")}>
              <Plus className="mr-1.5 h-4 w-4" />
              Compose
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-3">
        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
          Total: {totalCount}
        </Badge>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          Unread: {unreadCount}
        </Badge>
        <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          High Priority: {highPriorityCount}
        </Badge>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Notifications</TabsTrigger>
            <TabsTrigger value="compose">Compose</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-lg">Recent Updates</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search notifications..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="alert">Alert</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="message">Message</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v ?? "all")}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No notifications found matching your filters.
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => {
                      const Icon = typeIcons[notification.type];
                      return (
                        <div
                          key={notification.id}
                          className={`group relative flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 cursor-pointer ${
                            !notification.read ? "bg-muted/20" : ""
                          }`}
                        >
                          {!notification.read && (
                            <div className="absolute left-0 top-1/2 h-full w-1 -translate-y-1/2 bg-blue-500" />
                          )}
                          <div
                            className={`rounded-full p-2.5 ${typeColors[notification.type]}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4
                                className={`text-sm ${
                                  !notification.read ? "font-semibold text-foreground" : "font-medium text-foreground/80"
                                }`}
                              >
                                {notification.title}
                              </h4>
                              <span className="shrink-0 text-xs text-muted-foreground">
                                {formatDate(notification.date)}
                              </span>
                            </div>
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                              <span className="text-xs text-muted-foreground/80">
                                <span className="font-medium text-foreground/70">From:</span> {notification.sender}
                              </span>
                              <span className="text-xs text-muted-foreground/80">
                                <span className="font-medium text-foreground/70">To:</span> {notification.recipients}
                              </span>
                              <Badge
                                variant="secondary"
                                className={`ml-auto border-0 text-[10px] uppercase tracking-wider ${
                                  priorityColors[notification.priority]
                                }`}
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compose" className="mt-4">
            <Card className="max-w-3xl">
              <form onSubmit={handleCompose}>
                <CardHeader>
                  <CardTitle>Compose Message</CardTitle>
                  <CardDescription>
                    Create a new announcement, alert, or message to send to users.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Message sent successfully!
                    </motion.div>
                  )}
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select defaultValue="announcement">
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="announcement">Announcement</SelectItem>
                          <SelectItem value="alert">Alert</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                          <SelectItem value="message">Message</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipients">Recipients</Label>
                    <Input id="recipients" placeholder="e.g., All Students, Parents — Class 10" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="Message subject or title" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      rows={5}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("all")}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
