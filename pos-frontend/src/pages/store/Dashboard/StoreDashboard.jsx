import { Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getStoreByAdmin } from "../../../Redux Toolkit/features/store/storeThunks";
import { fetchStoreSubscriptionStatus } from "../../../Redux Toolkit/features/storeSubscription/storeSubscriptionThunks";
import { fetchStoreSettings } from "@/Redux Toolkit/features/storeSettings/storeSettingsThunks";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import StoreSidebar from "./StoreSidebar";
import StoreTopbar from "./StoreTopbar";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function StoreDashboard({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { settings: storeSettings } = useSelector((state) => state.storeSettings);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [impersonateId, setImpersonateId] = useState(() =>
    sessionStorage.getItem("impersonate_store_id")
  );
  const [impersonateName, setImpersonateName] = useState(() =>
    sessionStorage.getItem("impersonate_store_name")
  );

  // Idle-timer: log user out after sessionTimeout minutes of inactivity.
  const sessionTimeout = storeSettings?.sessionTimeout || 30;
  useIdleTimer(sessionTimeout, { enabled: Boolean(sessionTimeout) && !impersonateId });

  const { store } = useSelector((state) => state.store);
  const { userProfile } = useSelector((state) => state.user);
  const isSuperAdmin = userProfile?.role === "ROLE_ADMIN";

  useEffect(() => {
    if (isSuperAdmin && !impersonateId) {
      navigate("/super-admin/stores", { replace: true });
    }
  }, [isSuperAdmin, impersonateId, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      // If impersonating or store not loaded, refresh store
      dispatch(getStoreByAdmin());
      dispatch(fetchStoreSubscriptionStatus());
      dispatch(fetchStoreSettings());
    }
  }, [dispatch, impersonateId]);

  const handleExitImpersonation = () => {
    sessionStorage.removeItem("impersonate_store_id");
    sessionStorage.removeItem("impersonate_store_name");
    navigate("/super-admin/stores");
  };

  if (isSuperAdmin && !impersonateId) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Impersonation Banner */}
      {impersonateId && (
        <div className="bg-[#B8860B] text-[#1A1816] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold shadow-md z-50 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>
              Super Admin Impersonation: Browsing <strong>{impersonateName || store?.brand || "Store"}</strong> (Tenant ID #{impersonateId})
            </span>
          </div>
          <button
            type="button"
            onClick={handleExitImpersonation}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#262422] text-[#FAF8F3] hover:bg-black text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit to Super Admin
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Persistent Sidebar */}
        <div className="hidden md:flex h-full shrink-0">
          <StoreSidebar />
        </div>

        {/* Mobile Drawer Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64 border-r border-sidebar-border bg-sidebar">
            <StoreSidebar onNavigate={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex-1 flex flex-col min-w-0">
          <StoreTopbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background min-w-0">
            <div className="max-w-7xl mx-auto space-y-6">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
