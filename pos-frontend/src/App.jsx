import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

// Auth and Store Routes
import AuthRoutes from "./routes/AuthRoutes";
import StoreRoutes from "./routes/StoreRoutes";
import BranchManagerRoutes from "./routes/BranchManagerRoutes";
import { getUserProfile } from "./Redux Toolkit/features/user/userThunks";
import Landing from "./pages/common/Landing/Landing";
import CashierRoutes from "./routes/CashierRoutes";
import Onboarding from "./pages/onboarding/Onboarding";
import { getStoreByAdmin } from "./Redux Toolkit/features/store/storeThunks";
import SuperAdminRoutes from "./routes/SuperAdminRoutes";
import PageNotFound from "./pages/common/PageNotFound";
import AiCopilotWidget from "./components/ai/AiCopilotWidget";

const App = () => {
  const dispatch = useDispatch();
  const { userProfile, loading: userLoading, userProfileChecked } = useSelector((state) => state.user);
  const { store, storeLoading, storeChecked } = useSelector((state) => state.store);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      dispatch(getUserProfile(jwt))
        .unwrap()
        .catch(() => {
          // Token is expired or invalid — clear it so the user
          // sees the landing page instead of repeated errors
          localStorage.removeItem("jwt");
        });
    }
  }, [dispatch]);

  useEffect(() => {
    if (
      userProfile &&
      (userProfile.role === "ROLE_STORE_ADMIN" || userProfile.role === "ROLE_STORE_MANAGER") &&
      !storeChecked &&
      !storeLoading
    ) {
      dispatch(getStoreByAdmin());
    }
  }, [dispatch, userProfile, storeChecked, storeLoading]);

  const hasToken = !!localStorage.getItem("jwt");

  // 1. Session bootstrap loading state: Token exists in storage but user profile is still in-flight
  if (hasToken && !userProfileChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-xs font-semibold text-muted-foreground">Authenticating session...</p>
      </div>
    );
  }

  let content;

  if (userProfile && userProfile.role) {
    // User is logged in
    if (userProfile.role === "ROLE_ADMIN") {
      content = (
        <Routes>
          <Route path="/" element={<Navigate to="/super-admin" replace />} />
          <Route path="/super-admin/*" element={<SuperAdminRoutes />} />
          <Route path="/store/*" element={<StoreRoutes />} />
          <Route path="/branch/*" element={<BranchManagerRoutes />} />
          <Route path="/cashier/*" element={<CashierRoutes />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      );
    } else if (userProfile.role === "ROLE_BRANCH_CASHIER") {
      content = (
        <Routes>
          <Route path="/" element={<Navigate to="/cashier" replace />} />
          <Route path="/cashier/*" element={<CashierRoutes />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      );
    } else if (
      userProfile.role === "ROLE_STORE_ADMIN" ||
      userProfile.role === "ROLE_STORE_MANAGER"
    ) {
      // 2. Initial store check state: Store check has not yet resolved
      if (!storeChecked) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-xs font-semibold text-muted-foreground">Loading store console...</p>
          </div>
        );
      }

      // 3. Store resolved: Check if store exists vs confirmed none
      if (!store) {
        // Genuinely no store registered for this user — cleanly route to onboarding, never 404
        content = (
          <Routes>
            <Route path="/" element={<Navigate to="/auth/onboarding" replace />} />
            <Route path="/auth/onboarding" element={<Onboarding />} />
            <Route path="*" element={<Navigate to="/auth/onboarding" replace />} />
          </Routes>
        );
      } else {
        // Store exists — register full store router with branch and cashier workstations
        content = (
          <Routes>
            <Route path="/" element={<Navigate to="/store/dashboard" replace />} />
            <Route path="/store/*" element={<StoreRoutes />} />
            <Route path="/branch/*" element={<BranchManagerRoutes />} />
            <Route path="/cashier/*" element={<CashierRoutes />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        );
      }
    } else if (
      userProfile.role === "ROLE_BRANCH_MANAGER" ||
      userProfile.role === "ROLE_BRANCH_ADMIN"
    ) {
      content = (
        <Routes>
          <Route path="/" element={<Navigate to="/branch" replace />} />
          <Route path="/branch/*" element={<BranchManagerRoutes />} />
          <Route path="/cashier/*" element={<CashierRoutes />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      );
    } else {
      // Unknown role, redirect to landing
      content = (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      );
    }
  } else {
    // User is not logged in, show landing page and auth routes
    content = (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    );
  }

  return (
    <>
      {content}
      {userProfile && <AiCopilotWidget />}
    </>
  );
};

export default App;
