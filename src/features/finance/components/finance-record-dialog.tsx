"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { futureDate } from "@/lib/format";

export type FinanceDialogVariant = "invoice" | "payment" | "expense";

const dialogCopy: Record<
  FinanceDialogVariant,
  { title: string; description: string; submitLabel: string }
> = {
  invoice: {
    title: "Issue fee invoice",
    description: "Posts a fee invoice against a student roll number.",
    submitLabel: "Issue invoice",
  },
  payment: {
    title: "Record payment",
    description: "Records a payment against an existing invoice.",
    submitLabel: "Record payment",
  },
  expense: {
    title: "Submit expense bill",
    description: "Submits a vendor bill for approval.",
    submitLabel: "Submit expense",
  },
};

type FinanceRecordDialogProps = {
  variant: FinanceDialogVariant | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (body: Record<string, FormDataEntryValue>) => void;
  isPending: boolean;
};

export function FinanceRecordDialog({
  variant,
  onOpenChange,
  onSubmit,
  isPending,
}: FinanceRecordDialogProps) {
  const copy = dialogCopy[variant ?? "invoice"];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit(Object.fromEntries(form.entries()));
  };

  return (
    <Dialog open={variant !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1">
            {variant === "invoice" ? (
              <>
                <Field
                  name="studentRollNumber"
                  label="Student roll number"
                  placeholder="Example: 1101"
                  required
                />
                <Field name="subtotal" label="Subtotal" type="number" required />
                <Field name="discount" label="Discount" type="number" />
                <Field name="dueDate" label="Due date" type="date" min={futureDate()} required />
              </>
            ) : null}

            {variant === "payment" ? (
              <>
                <Field name="invoiceId" label="Invoice ID (optional)" />
                <Field name="amount" label="Amount" type="number" required />
                <Field
                  name="method"
                  label="Method"
                  placeholder="CASH / UPI / BANK_TRANSFER"
                  required
                />
              </>
            ) : null}

            {variant === "expense" ? (
              <>
                <Field name="amount" label="Amount" type="number" required />
                <Field name="billNumber" label="Vendor bill number" required />
                <Field name="description" label="Description" />
              </>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              {isPending ? "Saving…" : copy.submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  min,
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  min?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <Input
        name={name}
        type={type}
        placeholder={placeholder}
        min={min ?? (type === "number" ? "0" : undefined)}
        step={type === "number" ? "0.01" : undefined}
        required={required}
        className="h-9"
      />
    </label>
  );
}
