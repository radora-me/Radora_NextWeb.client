"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { ArrowDownToLine, List } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createActionBySectionId,
  financeSections,
  findFinanceSection,
} from "../lib/finance-utils";
import {
  exportFinance,
  useCreateFinanceRecord,
  useFinanceDashboard,
  useFinanceResource,
  useUpdateExpense,
  type FinanceResource,
} from "../services/finance.service";
import { FinanceAiAnalysis } from "./finance-ai-analysis";
import { FinanceDashboard } from "./finance-dashboard";
import { FinanceRecordDialog, type FinanceDialogVariant } from "./finance-record-dialog";
import { FinanceResourceTable } from "./finance-resource-table";
import { FinanceSectionRail } from "./finance-section-rail";

export function FinancePage() {
  const [active, setActive] = useState("dashboard");
  const [dialog, setDialog] = useState<FinanceDialogVariant | null>(null);
  const [railOpen, setRailOpen] = useState(false);

  const dashboardQuery = useFinanceDashboard();
  const section = useMemo(() => findFinanceSection(active), [active]);
  const isDashboard = section.id === "dashboard";

  const resourceQuery = useFinanceResource(
    section.resource || "invoices",
    Boolean(section.resource) && !isDashboard
  );
  const create = useCreateFinanceRecord();
  const updateExpense = useUpdateExpense();

  const rows: any[] = resourceQuery.data ?? [];

  // The rail only shows a count for a list that is actually loaded, so it
  // never fires 21 extra requests and never renders a fake zero.
  const counts =
    section.resource && resourceQuery.data ? { [section.id]: rows.length } : undefined;

  const selectSection = (id: string) => {
    setActive(id);
    setRailOpen(false);
  };

  const exportResource = (format: "csv" | "pdf") => {
    const target = (isDashboard ? "dashboard" : section.resource || "invoices") as FinanceResource;
    exportFinance(target, format).catch((error: Error) => toast.error(error.message));
  };

  const handleSubmit = (body: Record<string, FormDataEntryValue>) => {
    const type =
      dialog === "invoice" ? "invoices" : dialog === "payment" ? "payments" : "expenses";

    create.mutate(
      { type, body },
      {
        onSuccess: () => {
          setDialog(null);
          toast.success("Finance record saved");
        },
        onError: (error) => toast.error(error.message),
      }
    );
  };

  const approveExpense = (id: string) => {
    updateExpense.mutate(
      { id, body: { status: "APPROVED" } },
      {
        onSuccess: () => toast.success("Expense approved"),
        onError: (error) => toast.error(error.message),
      }
    );
  };

  const createAction = createActionBySectionId[section.id];

  return (
    <div className="mx-auto flex w-full max-w-[1600px] items-start gap-5">
      <aside className="hidden w-[260px] shrink-0 xl:block">
        <div className="sticky top-0">
          <FinanceSectionRail
            sections={financeSections}
            active={active}
            onSelect={selectSection}
            counts={counts}
          />
        </div>
      </aside>

      <main className="min-w-0 flex-1 space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isDashboard ? "Finance & Accounts" : section.label}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="xl:hidden"
              onClick={() => setRailOpen(true)}
            >
              <List aria-hidden="true" />
              Sections
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportResource("csv")}>
              <ArrowDownToLine aria-hidden="true" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportResource("pdf")}>
              <ArrowDownToLine aria-hidden="true" />
              PDF
            </Button>
          </div>
        </header>

        {isDashboard ? (
          <>
            <FinanceAiAnalysis />
            <FinanceDashboard
              data={dashboardQuery.data}
              isLoading={dashboardQuery.isLoading}
              isError={dashboardQuery.isError}
              onRetry={() => dashboardQuery.refetch()}
              onAction={setDialog}
            />
          </>
        ) : section.resource ? (
          <FinanceResourceTable
            section={section}
            rows={rows}
            isLoading={resourceQuery.isLoading}
            isError={resourceQuery.isError}
            errorMessage={
              resourceQuery.error instanceof Error ? resourceQuery.error.message : undefined
            }
            onRetry={() => resourceQuery.refetch()}
            onCreate={createAction ? setDialog : undefined}
            onApprove={approveExpense}
            isApproving={updateExpense.isPending}
          />
        ) : (
          <FinanceAiAnalysis defaultExpanded />
        )}
      </main>

      <Dialog open={railOpen} onOpenChange={setRailOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Finance sections</DialogTitle>
            <DialogDescription>Choose a section to open.</DialogDescription>
          </DialogHeader>
          <FinanceSectionRail
            sections={financeSections}
            active={active}
            onSelect={selectSection}
            counts={counts}
            className="bg-transparent p-0 ring-0"
          />
        </DialogContent>
      </Dialog>

      <FinanceRecordDialog
        variant={dialog}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        onSubmit={handleSubmit}
        isPending={create.isPending}
      />
    </div>
  );
}
