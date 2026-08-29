import React from "react";
import { Outlet } from "react-router";
import SuperAdminSidebar from "./components/SuperAdminSidebar";
import SuperAdminTopbar from "./components/SuperAdminTopbar";

export default function SuperAdminDashboard({ children }) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-accent selection:text-accent-foreground">
      {/* Executive Charcoal Slate Sidebar */}
      <SuperAdminSidebar />

      {/* Main Administrative Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-muted/20">
        <SuperAdminTopbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}