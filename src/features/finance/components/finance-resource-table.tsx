"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FilePlus2, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/format";
import {
  financeColumnLabels,
  financeRowKind,
  formatStatusLabel,
  rowAmountValue,
  rowDateValue,
  rowReference,
  rowSecondary,
  rowStatusValue,
  rowTitle,
  statusTone,
  statusToneClass,
  type FinanceSection,
} from "../lib/finance-utils";
import type { FinanceDialogVariant } from "./finance-record-dialog";

const PAGE_SIZE = 10;

type FinanceResourceTableProps = {
  section: FinanceSection;
  rows: any[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  onCreate?: (variant: FinanceDialogVariant) => void;
  onApprove: (id: string) => void;
  isApproving?: boolean;
};

export function FinanceResourceTable({
  section,
  rows,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onCreate,
  onApprove,
  isApproving = false,
}: FinanceResourceTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);

  const kind = financeRowKind(section.resource);
  const labels = financeColumnLabels[kind];
  const showApprove = kind === "expense";

  const statuses = useMemo(() => {
    const unique = new Set<string>();
    for (const row of rows) {
      const value = rowStatusValue(row);
      if (value) unique.add(value);
    }
    return Array.from(unique).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return rows.filter((row) => {
      if (status !== "all" && rowStatusValue(row) !== status) return false;
      if (!needle) return true;

      const haystack = [
        rowReference(row),
        rowTitle(row),
        rowSecondary(row),
        row?.invoiceNumber,
        row?.description,
        row?.student?.name,
        row?.student?.rollNumber,
        row?.vendor?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [rows, query, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const to = Math.min(filtered.length, (currentPage + 1) * PAGE_SIZE);
  const hasFilters = query.trim().length > 0 || status !== "all";

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <div className="relative w-full max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder="Search records"
            aria-label={`Search ${section.label}`}
            className="h-8 pl-8 text-[13px]"
          />
        </div>

        {statuses.length > 1 ? (
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(String(value));
              setPage(0);
            }}
          >
            <SelectTrigger size="sm" className="w-[152px]" aria-label="Filter by status">
              <span className="truncate">
                {status === "all" ? "All statuses" : formatStatusLabel(status)}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((value) => (
                <SelectItem key={value} value={value}>
                  {formatStatusLabel(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {filtered.length} records
          </span>
          {onCreate ? (
            <Button size="sm" onClick={() => onCreate(kind === "expense" ? "expense" : kind === "payment" ? "payment" : "invoice")}>
              <FilePlus2 aria-hidden="true" />
              Add record
            </Button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-wrap items-center gap-3 px-4 py-6 text-sm">
          <p className="text-muted-foreground">
            {errorMessage || "Unable to load records."}
          </p>
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">{labels.reference}</TableHead>
                <TableHead className="px-4">{labels.title}</TableHead>
                <TableHead className="px-4">{labels.date}</TableHead>
                <TableHead className="px-4 text-right">{labels.amount}</TableHead>
                <TableHead className="px-4">Status</TableHead>
                {showApprove ? <TableHead className="px-4 text-right">Action</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={showApprove ? 6 : 5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <p>No records returned.</p>
                    {hasFilters ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setQuery("");
                          setStatus("all");
                          setPage(0);
                        }}
                      >
                        Clear filters
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((row, index) => {
                  const statusValue = rowStatusValue(row);
                  const secondary = rowSecondary(row);
                  const rowId = String(row?.id ?? index);

                  return (
                    <TableRow key={rowId}>
                      <TableCell className="px-4 py-2.5 font-medium">
                        {rowReference(row)}
                      </TableCell>
                      <TableCell className="max-w-[220px] px-4 py-2.5">
                        <span className="block truncate">{rowTitle(row)}</span>
                        {secondary ? (
                          <span className="block truncate text-xs text-muted-foreground">
                            {secondary}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-muted-foreground">
                        {formatDate(rowDateValue(row))}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-right tabular-nums">
                        {formatMoney(rowAmountValue(row))}
                      </TableCell>
                      <TableCell className="px-4 py-2.5">
                        {statusValue ? (
                          <Badge
                            variant="secondary"
                            className={statusToneClass[statusTone(statusValue)]}
                          >
                            {formatStatusLabel(statusValue)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      {showApprove ? (
                        <TableCell className="px-4 py-2.5 text-right">
                          {statusValue === "SUBMITTED" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isApproving}
                              onClick={() => onApprove(rowId)}
                            >
                              Approve
                            </Button>
                          ) : null}
                        </TableCell>
                      ) : null}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs tabular-nums text-muted-foreground">
              Showing {from}–{to} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Previous page"
                disabled={currentPage === 0}
                onClick={() => setPage(Math.max(0, currentPage - 1))}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <span className="px-2 text-xs tabular-nums text-muted-foreground">
                {currentPage + 1} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Next page"
                disabled={currentPage >= pageCount - 1}
                onClick={() => setPage(Math.min(pageCount - 1, currentPage + 1))}
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
