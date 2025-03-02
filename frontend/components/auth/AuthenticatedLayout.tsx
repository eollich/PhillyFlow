"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={false}>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          {isMobile && <SidebarTrigger />}
          <main className="flex flex-1 justify-center items-center w-full min-h-screen p-4">

            {children}
          </main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
