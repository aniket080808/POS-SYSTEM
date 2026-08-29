import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import DashboardStats from "./DashboardStats";
import RecentSales from "./RecentSales";
import SalesTrend from "./SalesTrend";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Lock, BadgeDollarSign, Clock, XCircle, ShieldOff, RotateCcw } from "lucide-react";
import { resubmitRegistration, fetchStoreSubscriptionStatus } from "../../../Redux Toolkit/features/storeSubscription/storeSubscriptionThunks";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { statusResponse } = useSelector((state) => state.storeSubscription);
  const { store } = useSelector((state) => state.store);
  const { userProfile } = useSelector((state) => state.user);

  const [resubmitLoading, setResubmitLoading] = useState(false);

  const isStoreAdmin = userProfile?.role === "ROLE_STORE_ADMIN";
  const regStatus = statusResponse?.registrationStatus || store?.status || "PENDING";
  const subStatus = statusResponse?.subscriptionStatus || "NONE";
  const isRegistrationApproved = regStatus === "ACTIVE";
  const isSubscriptionActive = subStatus === "ACTIVE";

  const handleResubmitRegistration = async () => {
    setResubmitLoading(true);
    try {
      await dispatch(resubmitRegistration()).unwrap();
      dispatch(fetchStoreSubscriptionStatus());
    } catch {
      // Handled via Redux
    } finally {
      setResubmitLoading(false);
    }
  };

  const renderRegistrationCard = () => {
    if (regStatus === "PENDING") {
      return (
        <Card className="border-amber-200/80 bg-amber-50/40 p-8 shadow-xs rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <div className="p-3.5 bg-amber-100 rounded-2xl text-amber-600">
              <Clock className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Store Registration Pending Review
              </h2>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Your store profile is under review by the platform administrator. Once approved, you can activate your subscription and access the full product catalog and multi-branch terminal features.
              </p>
            </div>
            <Button
              onClick={() => navigate("/store/upgrade")}
              variant="outline"
              className="mt-2 text-xs font-semibold h-10 rounded-xl"
            >
              <BadgeDollarSign className="w-4 h-4 mr-1.5 text-accent" /> View Registration Status
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (regStatus === "REJECTED") {
      return (
        <Card className="border-red-200 bg-red-50/40 p-8 shadow-xs rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <div className="p-3.5 bg-red-100 rounded-2xl text-red-600">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Store Registration Rejected
              </h2>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Your registration application was declined by the platform administrator.
                {(statusResponse?.registrationRejectionReason || store?.registrationRejectionReason) && (
                  <span className="block font-semibold text-red-700 mt-1">
                    Reason: "{statusResponse?.registrationRejectionReason || store?.registrationRejectionReason}"
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2.5 mt-2">
              <Button
                onClick={handleResubmitRegistration}
                disabled={resubmitLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-10 rounded-xl shadow-xs"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                {resubmitLoading ? "Submitting..." : "Resubmit Application"}
              </Button>
              <Button
                onClick={() => navigate("/store/upgrade")}
                variant="outline"
                className="text-xs font-semibold h-10 rounded-xl"
              >
                View Status
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (regStatus === "BLOCKED") {
      return (
        <Card className="border-red-200 bg-red-50/40 p-8 shadow-xs rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <div className="p-3.5 bg-red-100 rounded-2xl text-red-600">
              <ShieldOff className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Store Account Suspended
              </h2>
              <p className="text-muted-foreground text-xs leading-relaxed">
                This store has been temporarily suspended by the platform administrator. Terminal checkouts and branch operations are restricted.
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
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Store Operations Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Real-time metrics, cross-branch revenue trends, and operational summaries
        </p>
      </div>

      {!isRegistrationApproved ? (
        renderRegistrationCard()
      ) : !isSubscriptionActive ? (
        isStoreAdmin ? (
          <Card className="border-amber-200/80 bg-amber-50/30 p-8 shadow-xs rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="p-3.5 bg-amber-100 rounded-2xl text-amber-600">
                <Lock className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Active Subscription Required
                </h2>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Your store registration is approved! Select an active subscription plan to unlock full product catalog management, branch terminal checkout, and analytics.
                </p>
              </div>
              <Button
                onClick={() => navigate("/store/upgrade")}
                className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-10 rounded-xl shadow-xs"
              >
                <BadgeDollarSign className="w-4 h-4 mr-1.5" />
                Select Subscription Tier
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border bg-card p-8 shadow-xs rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-3 py-6">
              <div className="p-3 bg-muted rounded-2xl text-muted-foreground">
                <Clock className="w-7 h-7" />
              </div>
              <div className="max-w-md space-y-1">
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Subscription Notice
                </h2>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  This store's subscription requires renewal. Please contact your Store Admin.
                </p>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <>
          <DashboardStats />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentSales />
            <SalesTrend />
          </div>
        </>
      )}
    </div>
  );
}