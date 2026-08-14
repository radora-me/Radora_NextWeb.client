import { Suspense } from "react";
import { TeacherChat } from "@/features/teacher/components/teacher-chat";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading chat...</div>}>
      <TeacherChat />
    </Suspense>
  );
}
