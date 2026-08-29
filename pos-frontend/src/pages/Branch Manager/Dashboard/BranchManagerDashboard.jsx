import React, { useEffect } from "react";
import { Outlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getBranchById } from "@/Redux Toolkit/features/branch/branchThunks";
import BranchManagerSidebar from "./BranchManagerSidebar";
import BranchManagerTopbar from "./BranchManagerTopbar";

export default function BranchManagerDashboard({ children }) {
  const dispatch = useDispatch();
  const { userProfile } = useSelector((state) => state.user);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt && userProfile?.branchId) {
      dispatch(getBranchById({ id: userProfile.branchId, jwt }));
    }
  }, [dispatch, userProfile]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-accent selection:text-accent-foreground">
      {/* Executive Charcoal Slate Sidebar */}
      <BranchManagerSidebar />

      {/* Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-muted/20">
        <BranchManagerTopbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 min-w-0">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}