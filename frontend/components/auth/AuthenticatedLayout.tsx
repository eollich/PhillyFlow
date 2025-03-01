//"use client";
//
//import { useAuth } from "@/context/AuthContext";
//import { useRouter } from "next/navigation";
//import { useEffect } from "react";
//
//export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
//  const { user, loading } = useAuth();
//  const router = useRouter();
//
//  useEffect(() => {
//    if (!loading && !user) {
//      router.push("/login"); // 🚀 Redirects guests to login
//    }
//  }, [user, loading, router]);
//
//  if (loading) return <p>Loading...</p>; // ✅ Prevent flickering
//
//  return (
//    <div className="flex">
//      <aside className="w-64 bg-gray-800 text-white p-4">Sidebar</aside>
//      <main className="flex-grow p-4">{children}</main>
//    </div>
//  );
//}


"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/theme-toggle";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          <main className="flex justify-between items-start p-4">
            {isMobile && <SidebarTrigger />}
            {children}
          </main>
        </SidebarProvider>
      </ThemeProvider>
    </>
  );
}

