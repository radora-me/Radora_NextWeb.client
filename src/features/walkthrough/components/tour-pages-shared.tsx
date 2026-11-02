import { ShieldCheck } from "lucide-react";

export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-xs leading-5 text-indigo-900">
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-indigo-600" />
      <p>{children}</p>
    </div>
  );
}
