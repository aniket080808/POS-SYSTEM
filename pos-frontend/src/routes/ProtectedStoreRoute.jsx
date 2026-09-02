import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router";
import { useToast } from "../components/ui/use-toast";

/**
 * Route-level guard for store pages that require both:
 *   1. Registration approved (regStatus === 'ACTIVE')
 *   2. Subscription active   (subStatus === 'ACTIVE')
 *
 * If the user is not fully active, they are redirected to /store/dashboard
 * and a toast notification is shown.
 *
 * Usage: wrap any <Route> element that needs protection:
 *   <Route path="products" element={<ProtectedStoreRoute><Products /></ProtectedStoreRoute>} />
 */
export default function ProtectedStoreRoute({ children }) {
  const location = useLocation();
  const { toast } = useToast();
  const hasToasted = useRef(false);

  const { statusResponse } = useSelector((state) => state.storeSubscription);
  const { store } = useSelector((state) => state.store);
  const { userProfile } = useSelector((state) => state.user);

  const isSuperAdmin = userProfile?.role === 'ROLE_ADMIN';
  const isStoreAdmin = userProfile?.role === 'ROLE_STORE_ADMIN';
  const regStatus = statusResponse?.registrationStatus || store?.status || 'PENDING';
  const subStatus = statusResponse?.subscriptionStatus || 'NONE';
  const isFullyActive = isSuperAdmin || (regStatus === 'ACTIVE' && subStatus === 'ACTIVE');

  useEffect(() => {
    // Show toast only once per redirect (avoid re-renders re-toasting)
    if (!isFullyActive && !hasToasted.current) {
      hasToasted.current = true;

      const message = regStatus !== 'ACTIVE'
        ? "Your store registration must be approved before accessing this module."
        : isStoreAdmin
        ? "An active subscription is required to access this module."
        : "This store's subscription needs renewal. Please contact your Store Admin.";

      toast({
        title: "Access Locked",
        description: message,
        variant: "destructive",
      });
    }
  }, [isFullyActive, regStatus, isStoreAdmin, toast]);

  if (!isFullyActive) {
    return <Navigate to="/store/dashboard" replace state={{ from: location.pathname }} />;
  }

  return children;
}
