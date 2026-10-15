import { StudentFeesPage } from "@/features/fees/components/student-fees-page";
import { Suspense } from "react";

export default function Page() { return <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading fees…</div>}><StudentFeesPage /></Suspense>; }
