import React from "react";
import { Outlet } from "react-router";
import SuperAdminSidebar from "./components/SuperAdminSidebar";
import SuperAdminTopbar from "./components/SuperAdminTopbar";

export default function SuperAdminDashboard({ children }) {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SuperAdminTopbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-muted/20">
          <div className="max-w-7xl mx-auto space-y-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}