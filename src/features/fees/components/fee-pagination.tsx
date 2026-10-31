"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type FeePaginationProps = {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function FeePagination({
  page,
  pageCount,
  from,
  to,
  total,
  onPageChange,
}: FeePaginationProps) {
  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <p className="text-xs tabular-nums text-muted-foreground">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={page === 0}
          onClick={() => onPageChange(Math.max(0, page - 1))}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <span className="px-2 text-xs tabular-nums text-muted-foreground">
          {page + 1} / {pageCount}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={page >= pageCount - 1}
          onClick={() => onPageChange(Math.min(pageCount - 1, page + 1))}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
