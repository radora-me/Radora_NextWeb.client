import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/layout/student-sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <StudentSidebar />
      <SidebarInset>
        <Topbar />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
