"use client";
import { useIsMobile } from "@/hooks/use-mobile";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="flex justify-between items-start p-4">
        {isMobile && <SidebarTrigger />}
        {children}
      </main>
    </SidebarProvider>
  );
}

