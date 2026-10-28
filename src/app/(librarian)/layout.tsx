import { SidebarProvider } from "@/components/ui/sidebar";
import { LibrarianSidebar } from "@/components/layout/librarian-sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function LibrarianLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div suppressHydrationWarning className="flex h-screen w-full overflow-hidden bg-slate-50">
        <LibrarianSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-slate-50/50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
