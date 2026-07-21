"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  Plus,
  Search,
  Send,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  feeStructures,
  feePayments,
  collectionSummary,
} from "@/features/fees/data/mock-fees";
import type { FeePayment } from "@/types/api.types";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatCompact(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return formatINR(amount);
}

const statusColors: Record<FeePayment["status"], string> = {
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  partial: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  pending: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

const frequencyColors: Record<string, string> = {
  monthly: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  quarterly: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  annually: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  "one-time": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
};

/* ------------------------------------------------------------------ */
/*  Animations                                                        */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ------------------------------------------------------------------ */
/*  Status Badge                                                      */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: FeePayment["status"] }) {
  return (
    <Badge className={`${statusColors[status]} border-0 capitalize`}>
      {status}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export function FeesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  /* ---- Payments tab filtering ---- */
  const filteredPayments = useMemo(() => {
    return feePayments.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.feeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  /* ---- Defaulters ---- */
  const defaulters = useMemo(
    () => feePayments.filter((p) => p.status === "overdue"),
    []
  );

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Fee Management"
          description="Manage fee structures, payments, and invoices."
          action={
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Payment
            </Button>
          }
        />
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={itemVariants}
      >
        <StatCard
          title="Total Collected"
          value={formatCompact(collectionSummary.totalCollected)}
          change="+8.2%"
          trend="positive"
          icon={IndianRupee}
        />
        <StatCard
          title="Pending"
          value={formatCompact(collectionSummary.totalPending)}
          change="-3.1%"
          trend="positive"
          icon={CreditCard}
        />
        <StatCard
          title="Overdue"
          value={formatCompact(collectionSummary.totalOverdue)}
          change="+2.4%"
          trend="negative"
          icon={AlertTriangle}
        />
        <StatCard
          title="Collection Rate"
          value={`${collectionSummary.collectionRate}%`}
          change="+1.8%"
          trend="positive"
          icon={TrendingUp}
        />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="payments">
          <TabsList>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="structure">Fee Structure</TabsTrigger>
            <TabsTrigger value="defaulters">Defaulters</TabsTrigger>
          </TabsList>

          {/* ============================================== */}
          {/*  Payments Tab                                  */}
          {/* ============================================== */}
          <TabsContent value="payments" className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by student, fee type…"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v ?? "all")}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No payments match your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {payment.studentName}
                          </TableCell>
                          <TableCell>
                            {payment.class}-{payment.section}
                          </TableCell>
                          <TableCell>{payment.feeType}</TableCell>
                          <TableCell className="text-right">
                            {formatINR(payment.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatINR(payment.paidAmount)}
                          </TableCell>
                          <TableCell>
                            {new Date(payment.dueDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={payment.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================== */}
          {/*  Fee Structure Tab                             */}
          {/* ============================================== */}
          <TabsContent value="structure" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {feeStructures.map((fee) => (
                <Card
                  key={fee.id}
                  className="hover:shadow-md transition-shadow duration-200"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{fee.name}</CardTitle>
                      <Badge
                        className={`${frequencyColors[fee.frequency]} border-0 capitalize`}
                      >
                        {fee.frequency}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-2xl font-bold text-primary">
                      {formatINR(fee.amount)}
                    </p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        <span className="font-medium text-foreground">
                          Applicable to:
                        </span>{" "}
                        {fee.applicableTo}
                      </p>
                      {fee.description && <p>{fee.description}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ============================================== */}
          {/*  Defaulters Tab                                */}
          {/* ============================================== */}
          <TabsContent value="defaulters" className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {defaulters.length} student{defaulters.length !== 1 && "s"}
                </span>{" "}
                with overdue payments
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead className="text-right">Amount Due</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defaulters.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No defaulters found. 🎉
                        </TableCell>
                      </TableRow>
                    ) : (
                      defaulters.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium">
                            {d.studentName}
                          </TableCell>
                          <TableCell>
                            {d.class}-{d.section}
                          </TableCell>
                          <TableCell>{d.feeType}</TableCell>
                          <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                            {formatINR(d.amount - d.paidAmount)}
                          </TableCell>
                          <TableCell>
                            {new Date(d.dueDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <Send className="mr-1.5 h-3.5 w-3.5" />
                              Send Reminder
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
