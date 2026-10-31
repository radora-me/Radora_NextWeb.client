"use client";

import { useState } from "react";
import { Mail, UserRound } from "lucide-react";

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
import { useSearchStudent } from "@/features/students/services/student-search.service";
import { futureDate } from "@/lib/format";

type CreateFeeDueDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
};

export function CreateFeeDueDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: CreateFeeDueDialogProps) {
  const [rollNumber, setRollNumber] = useState("");
  const student = useSearchStudent(rollNumber, open);

  const handleOpenChange = (next: boolean) => {
    if (!next) setRollNumber("");
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create fee due</DialogTitle>
          <DialogDescription>
            Confirm the student roll number before issuing a due.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Student roll number or ID</span>
              <Input
                name="studentRollNumber"
                value={rollNumber}
                onChange={(event) => setRollNumber(event.target.value)}
                required
                autoFocus
                className="h-9"
              />
            </label>

            {rollNumber.trim() && student.isFetching ? (
              <p className="text-xs text-muted-foreground">Looking up student…</p>
            ) : null}

            {student.error ? (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                Student not found. Check the roll number and try again.
              </p>
            ) : null}

            {student.data ? (
              <div className="rounded-md bg-muted/60 px-3 py-2.5 text-sm">
                <div className="flex items-start gap-2">
                  <UserRound
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{student.data.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Roll no. {student.data.rollNumber} · Class{" "}
                      {student.data.className || "—"}
                    </p>
                    {student.data.email ? (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="size-3" aria-hidden="true" />
                        {student.data.email}
                      </p>
                    ) : null}
                    {student.data.parentName ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Parent: {student.data.parentName}
                        {student.data.parentPhone ? ` · ${student.data.parentPhone}` : ""}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <Field name="subtotal" label="Amount" type="number" required />
            <Field name="discount" label="Discount" type="number" />
            <Field name="lateFee" label="Late fee" type="number" />
            <Field name="dueDate" label="Due date" type="date" min={futureDate()} required />
            <Field name="notes" label="Notes" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending} disabled={!student.data}>
              {isPending ? "Creating…" : "Confirm & issue due"}
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
  min,
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  min?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <Input
        name={name}
        type={type}
        required={required}
        min={min ?? (type === "number" ? "0" : undefined)}
        step={type === "number" ? "0.01" : undefined}
        className="h-9"
      />
    </label>
  );
}
