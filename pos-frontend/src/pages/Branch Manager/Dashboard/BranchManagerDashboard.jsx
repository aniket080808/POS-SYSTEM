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
    if (localStorage.getItem("jwt") && userProfile?.branchId) {
      dispatch(getBranchById({ id: userProfile.branchId, jwt: localStorage.getItem("jwt") }));
    }
  }, [dispatch, userProfile?.branchId]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <BranchManagerSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <BranchManagerTopbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          <div className="max-w-7xl mx-auto space-y-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}