import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LibrarianSidebar } from "@/components/layout/librarian-sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function LibrarianLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LibrarianSidebar />
      <SidebarInset>
          <Topbar />
          <main className="flex-1 overflow-auto bg-muted/30 p-6">
            {children}
          </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
