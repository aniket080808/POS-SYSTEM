
import { Outlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getStoreByAdmin } from "../../../Redux Toolkit/features/store/storeThunks";
import { fetchStoreSubscriptionStatus } from "../../../Redux Toolkit/features/storeSubscription/storeSubscriptionThunks";
import { fetchStoreSettings } from "@/Redux Toolkit/features/storeSettings/storeSettingsThunks";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import StoreSidebar from "./StoreSidebar";
import StoreTopbar from "./StoreTopbar";

export default function StoreDashboard({ children }) {
  const dispatch = useDispatch();
  const { settings: storeSettings } = useSelector((state) => state.storeSettings);

  // Idle-timer: log user out after sessionTimeout minutes of inactivity.
  const sessionTimeout = storeSettings?.sessionTimeout || 30;
  useIdleTimer(sessionTimeout, { enabled: Boolean(sessionTimeout) });

  useEffect(() => {
    if (localStorage.getItem("jwt")) {
      dispatch(getStoreByAdmin(localStorage.getItem("jwt")));
      dispatch(fetchStoreSubscriptionStatus());
      dispatch(fetchStoreSettings());
    }
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <StoreSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StoreTopbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-muted/20 min-w-0">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}

