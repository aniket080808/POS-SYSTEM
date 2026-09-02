import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import DashboardStats from "./DashboardStats";
import RecentSales from "./RecentSales";
import SalesTrend from "./SalesTrend";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Lock,
  BadgeDollarSign,
  Clock,
  XCircle,
  ShieldOff,
  RotateCcw,
  AlertTriangle,
  Zap,
  Store,
  Users,
  Package,
} from "lucide-react";
import { resubmitRegistration, fetchStoreSubscriptionStatus } from "../../../Redux Toolkit/features/storeSubscription/storeSubscriptionThunks";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { statusResponse } = useSelector((state) => state.storeSubscription);
  const { store } = useSelector((state) => state.store);
  const { userProfile } = useSelector((state) => state.user);
  const { storeOverview } = useSelector((state) => state.storeAnalytics);

  const [resubmitLoading, setResubmitLoading] = useState(false);

  const isSuperAdmin = userProfile?.role === "ROLE_ADMIN";
  const isStoreAdmin = userProfile?.role === "ROLE_STORE_ADMIN";
  const regStatus = statusResponse?.registrationStatus || store?.status || "PENDING";
  const subStatus = statusResponse?.subscriptionStatus || "NONE";
  const isRegistrationApproved = isSuperAdmin || regStatus === "ACTIVE";
  const isSubscriptionActive = isSuperAdmin || subStatus === "ACTIVE";

  const currentPlan = statusResponse?.currentPlan;
  const effectiveMaxBranches = store?.customMaxBranches || currentPlan?.maxBranches;
  const effectiveMaxUsers = store?.customMaxUsers || currentPlan?.maxUsers;
  const effectiveMaxProducts = store?.customMaxProducts || currentPlan?.maxProducts;

  const branchesCount = storeOverview?.totalBranches || 0;
  const employeesCount = storeOverview?.totalEmployees || 0;
  const productsCount = storeOverview?.totalProducts || 0;

  const branchPercent = effectiveMaxBranches ? Math.min(100, Math.round((branchesCount / effectiveMaxBranches) * 100)) : 0;
  const userPercent = effectiveMaxUsers ? Math.min(100, Math.round((employeesCount / effectiveMaxUsers) * 100)) : 0;
  const productPercent = effectiveMaxProducts ? Math.min(100, Math.round((productsCount / effectiveMaxProducts) * 100)) : 0;

  const handleResubmitRegistration = async () => {
    setResubmitLoading(true);
    try {
      await dispatch(resubmitRegistration()).unwrap();
      dispatch(fetchStoreSubscriptionStatus());
    } catch (_err) {
      // Error handled by Redux slice
    } finally {
      setResubmitLoading(false);
    }
  };

  // ─── STATE 1: Registration NOT approved (Pending / Rejected / Blocked) ───
  const renderRegistrationCard = () => {
    if (regStatus === "PENDING") {
      return (
        <Card className="border-[#EED896] bg-[#FDF6E2]/70 shadow-xs">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <div className="p-3.5 bg-card border border-[#EED896] rounded-2xl text-[#B8860B] shadow-2xs">
              <Clock className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-[#785600]">
                Store Registration Pending Approval
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your store registration has been submitted and is awaiting approval by the super administrator.
                Once approved, you can subscribe to a plan and unlock all operational modules.
              </p>
            </div>
            <Button onClick={() => navigate("/store/upgrade")} variant="outline" className="mt-2 text-xs">
              <BadgeDollarSign className="w-4 h-4 mr-2 text-[#B8860B]" /> View Status
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (regStatus === "REJECTED") {
      return (
        <Card className="border-[#EFC8BD] bg-[#FBF0EC]/80 shadow-xs">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <div className="p-3.5 bg-card border border-[#EFC8BD] rounded-2xl text-destructive shadow-2xs">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-[#7A331E]">
                Store Registration Rejected
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your store registration was rejected by the super administrator.
                {(statusResponse?.registrationRejectionReason || store?.registrationRejectionReason) && (
                  <span className="block font-semibold text-[#7A331E] mt-1">
                    Reason: "{statusResponse?.registrationRejectionReason || store?.registrationRejectionReason}"
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Button onClick={handleResubmitRegistration} disabled={resubmitLoading} variant="destructive" className="text-xs">
                <RotateCcw className="w-4 h-4 mr-2" /> {resubmitLoading ? "Submitting..." : "Send Request Again"}
              </Button>
              <Button onClick={() => navigate("/store/upgrade")} variant="outline" className="text-xs">
                View Status
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (regStatus === "BLOCKED") {
      return (
        <Card className="border-[#EFC8BD] bg-[#FBF0EC]/80 shadow-xs">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <div className="p-3.5 bg-card border border-[#EFC8BD] rounded-2xl text-destructive shadow-2xs">
              <ShieldOff className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-[#7A331E]">
                Store Account Blocked
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your store account has been blocked by the platform administrator.
                Access to all modules is restricted. Please contact support for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Real-time insights and business performance across all branches
        </p>
      </div>

      {!isRegistrationApproved ? (
        renderRegistrationCard()
      ) : !isSubscriptionActive ? (
        isStoreAdmin ? (
          <Card className="border-[#EED896] bg-[#FDF6E2]/70 shadow-xs">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="p-3.5 bg-card border border-[#EED896] rounded-2xl text-[#B8860B] shadow-2xs">
                <Lock className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-[#785600]">
                  No Active Subscription
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your store registration is approved! Subscribe to an active plan to unlock business statistics, product catalog, sales reports, and branch features.
                </p>
              </div>
              <Button onClick={() => navigate("/store/upgrade")} className="mt-2 text-xs">
                <BadgeDollarSign className="w-4 h-4 mr-2" /> Upgrade Plan / View Status
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-3 py-8">
              <div className="p-3 bg-secondary rounded-2xl text-muted-foreground">
                <Clock className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Subscription Notice
                </h2>
                <p className="text-muted-foreground text-xs">
                  This store's subscription needs renewal. Please contact your Store Admin.
                </p>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        /* Fully active — normal dashboard */
        <>
          <DashboardStats />

          {/* Subscription Quota & Store Capacity Health Card */}
          {currentPlan && (
            <Card className="border-border shadow-2xs bg-card overflow-hidden">
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#B8860B] shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">
                        Subscription Quota & Capacity Health
                      </h3>
                      <Badge variant="outline" className="text-[10px] font-bold border-amber-500/40 text-amber-700 bg-amber-500/10">
                        {currentPlan.name || "Active Plan"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Resource allocations and live multi-tenant capacity limits
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/store/upgrade")}
                  className="text-xs font-bold h-8 self-start md:self-auto gap-1.5 cursor-pointer"
                >
                  <BadgeDollarSign className="w-3.5 h-3.5 text-[#B8860B]" />
                  Upgrade Plan / Limits
                </Button>
              </div>

              <CardContent className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Branches Quota */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-foreground" /> Branch Outlets
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {branchesCount} / {effectiveMaxBranches || "∞"}
                    </span>
                  </div>
                  <Progress value={branchPercent} className="h-2" />
                  <p className="text-[11px] text-muted-foreground">
                    {effectiveMaxBranches ? `${branchPercent}% capacity utilized` : "Unlimited locations"}
                  </p>
                </div>

                {/* Staff Accounts Quota */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" /> Staff & Cashiers
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {employeesCount} / {effectiveMaxUsers || "∞"}
                    </span>
                  </div>
                  <Progress value={userPercent} className="h-2" />
                  <p className="text-[11px] text-muted-foreground">
                    {effectiveMaxUsers ? `${userPercent}% capacity utilized` : "Unlimited staff"}
                  </p>
                </div>

                {/* Product SKUs Quota */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-emerald-600" /> Catalog SKUs
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {productsCount} / {effectiveMaxProducts || "∞"}
                    </span>
                  </div>
                  <Progress value={productPercent} className="h-2" />
                  <p className="text-[11px] text-muted-foreground">
                    {effectiveMaxProducts ? `${productPercent}% capacity utilized` : "Unlimited catalog"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentSales />
            <SalesTrend />
          </div>
        </>
      )}
    </div>
  );
}