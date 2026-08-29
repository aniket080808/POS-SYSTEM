import React, { useEffect } from "react";
import { Outlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getStoreByAdmin } from "../../../Redux Toolkit/features/store/storeThunks";
import { fetchStoreSubscriptionStatus } from "../../../Redux Toolkit/features/storeSubscription/storeSubscriptionThunks";
import { fetchStoreSettings } from "@/Redux Toolkit/features/storeSettings/storeSettingsThunks";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import StoreSidebar from "./StoreSidebar";
import StoreTopbar from "./StoreTopbar";

export default function StoreDashboard({ children }) {
  const dispatch = useDispatch();
  const { settings: storeSettings } = useSelector((state) => state.storeSettings);

  const sessionTimeout = storeSettings?.sessionTimeout || 30;
  useIdleTimer(sessionTimeout, { enabled: Boolean(sessionTimeout) });

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      dispatch(getStoreByAdmin(jwt));
      dispatch(fetchStoreSubscriptionStatus());
      dispatch(fetchStoreSettings());
    }
  }, [dispatch]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-accent selection:text-accent-foreground">
      {/* Executive Charcoal Slate Sidebar */}
      <StoreSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-muted/20">
        <StoreTopbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 min-w-0">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
