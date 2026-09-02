import React, { useState } from "react";
import { Outlet } from "react-router";
import SuperAdminSidebar from "./components/SuperAdminSidebar";
import SuperAdminTopbar from "./components/SuperAdminTopbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function SuperAdminDashboard({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <SuperAdminSidebar />
      </div>

      {/* Mobile Drawer Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r border-sidebar-border bg-sidebar">
          <SuperAdminSidebar onNavigate={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        <SuperAdminTopbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background min-w-0">
          <div className="max-w-7xl mx-auto space-y-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}