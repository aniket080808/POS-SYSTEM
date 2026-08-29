import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import DashboardStats from "./DashboardStats";
import RecentSales from "./RecentSales";
import SalesTrend from "./SalesTrend";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Lock, BadgeDollarSign, Clock, XCircle, ShieldOff, RotateCcw, Sparkles } from "lucide-react";
import { resubmitRegistration, fetchStoreSubscriptionStatus } from "../../../Redux Toolkit/features/storeSubscription/storeSubscriptionThunks";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { statusResponse } = useSelector((state) => state.storeSubscription || {});
  const { store } = useSelector((state) => state.store || {});
  const { userProfile } = useSelector((state) => state.user || {});

  const [resubmitLoading, setResubmitLoading] = useState(false);

  const isStoreAdmin = userProfile?.role === 'ROLE_STORE_ADMIN';
  const regStatus = statusResponse?.registrationStatus || store?.status || 'PENDING';
  const subStatus = statusResponse?.subscriptionStatus || 'NONE';
  const isRegistrationApproved = regStatus === 'ACTIVE';
  const isSubscriptionActive = subStatus === 'ACTIVE';

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
    if (regStatus === 'PENDING') {
      return (
        <Card className="rounded-2xl border-amber-500/20 bg-amber-500/5 p-6 sm:p-10 shadow-2xs">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-4">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400">
              <Clock className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h2 className="text-lg font-bold text-foreground tracking-tight">Registration Under Super Admin Review</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your store application is currently queued for platform compliance verification. Once approved, plan selection and branch management features will unlock immediately.
              </p>
            </div>
            <Button onClick={() => navigate('/store/upgrade')} variant="outline" size="sm" className="mt-2 rounded-xl text-xs font-semibold">
              <BadgeDollarSign className="w-3.5 h-3.5 mr-1.5 text-primary" /> Check Status
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (regStatus === 'REJECTED') {
      return (
        <Card className="rounded-2xl border-destructive/20 bg-destructive/5 p-6 sm:p-10 shadow-2xs">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-4">
            <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h2 className="text-lg font-bold text-foreground tracking-tight">Store Registration Requires Update</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your store application was not approved during moderation.
                {(statusResponse?.registrationRejectionReason || store?.registrationRejectionReason) && (
                  <span className="block font-medium text-destructive mt-1 text-xs">
                    Feedback: "{statusResponse?.registrationRejectionReason || store?.registrationRejectionReason}"
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2.5 mt-2">
              <Button onClick={handleResubmitRegistration} disabled={resubmitLoading} variant="destructive" size="sm" className="rounded-xl text-xs font-semibold">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> {resubmitLoading ? 'Submitting...' : 'Resubmit Request'}
              </Button>
              <Button onClick={() => navigate('/store/upgrade')} variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                View Status
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (regStatus === 'BLOCKED') {
      return (
        <Card className="rounded-2xl border-destructive/20 bg-destructive/5 p-6 sm:p-10 shadow-2xs">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-4">
            <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive">
              <ShieldOff className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h2 className="text-lg font-bold text-foreground tracking-tight">Store Workspace Suspended</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your store workspace has been restricted by platform administration. Please contact platform compliance support.
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {store?.brand ? `${store.brand} Overview` : "Store Management Dashboard"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor real-time sales volume, retail operations, and branch activity.
          </p>
        </div>
      </div>

      {!isRegistrationApproved ? (
        renderRegistrationCard()
      ) : !isSubscriptionActive ? (
        isStoreAdmin ? (
          <Card className="rounded-2xl border-amber-500/20 bg-amber-500/5 p-6 sm:p-10 shadow-2xs">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-4">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400">
                <Lock className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h2 className="text-lg font-bold text-foreground tracking-tight">Active Subscription Required</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your store registration is verified! Choose a subscription plan to unlock full POS capabilities, product catalogs, branch terminals, and detailed analytics.
                </p>
              </div>
              <Button onClick={() => navigate('/store/upgrade')} size="sm" className="mt-2 rounded-xl text-xs font-semibold">
                <BadgeDollarSign className="w-3.5 h-3.5 mr-1.5" /> Choose Subscription Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border-amber-500/20 bg-amber-500/5 p-6 shadow-2xs">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-3 py-4">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <div className="max-w-md space-y-1">
                <h2 className="text-sm font-bold text-foreground">Subscription Renewal Required</h2>
                <p className="text-xs text-muted-foreground">
                  This store's subscription requires renewal. Please notify your Store Administrator.
                </p>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <>
          {/* Stats Overview */}
          <DashboardStats />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Sales */}
            <RecentSales />

            {/* Sales Trend */}
            <SalesTrend />
          </div>
        </>
      )}
    </div>
  );
}