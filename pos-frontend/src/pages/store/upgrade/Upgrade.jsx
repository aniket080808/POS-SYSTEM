import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router";
import { Button } from "../../../components/ui/button";
import {
  Check,
  Store,
  Users,
  ShoppingCart,
  Info,
  Star,
  AlertCircle,
  Clock,
  XCircle,
  RotateCcw,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { getAllSubscriptionPlans } from "../../../Redux Toolkit/features/subscriptionPlan/subscriptionPlanThunks";
import { subscribeToPlan, upgradeSubscription } from "../../../Redux Toolkit/features/subscription/subscriptionThunks";
import { fetchStoreSubscriptionStatus, resubmitRegistration, resubmitSubscriptionRequest } from "../../../Redux Toolkit/features/storeSubscription/storeSubscriptionThunks";
import { getStoreOverview } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Upgrade = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { plans, loading: plansLoading, error: plansError } = useSelector((state) => state.subscriptionPlan);
  const { statusResponse, loading: subLoading, error: subError } = useSelector((state) => state.storeSubscription);
  const { store } = useSelector((state) => state.store);
  const { userProfile } = useSelector((state) => state.user);
  const { storeOverview } = useSelector((state) => state.storeAnalytics);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [paymentNotice, setPaymentNotice] = useState(null);

  useEffect(() => {
    dispatch(getAllSubscriptionPlans());
    dispatch(fetchStoreSubscriptionStatus());
    if (userProfile?.id && !storeOverview) {
      dispatch(getStoreOverview(userProfile.id));
    }

    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      // Clear query params from browser URL so message does not persist on subsequent visits/refreshes
      window.history.replaceState({}, document.title, window.location.pathname);
      if (statusResponse?.subscriptionStatus === "PENDING" || !statusResponse?.subscriptionStatus) {
        setSuccessMsg("Payment completed. Your request has been queued for Super Admin verification.");
      }
    } else if (paymentStatus === "failed") {
      window.history.replaceState({}, document.title, window.location.pathname);
      setPaymentNotice("Payment was not completed. Your subscription remains unchanged.");
    }
  }, [dispatch, searchParams, userProfile?.id, statusResponse?.subscriptionStatus]);

  const activeStore = store || userProfile?.store;
  const regStatus = statusResponse?.registrationStatus || activeStore?.status || "PENDING";
  const subStatus = statusResponse?.subscriptionStatus || "NONE";
  const currentPlan = statusResponse?.currentPlan;
  const requestedPlan = statusResponse?.requestedPlan;

  const handleSubscribe = async (planId) => {
    const storeId = activeStore?.id;
    if (!storeId) return;
    setActionLoading(true);
    setActionError(null);
    setSuccessMsg(null);
    setPaymentNotice(null);
    try {
      if (currentPlan) {
        await dispatch(upgradeSubscription({ storeId, planId })).unwrap();
        setSuccessMsg("Redirecting to checkout payment portal...");
      } else {
        await dispatch(subscribeToPlan({ storeId, planId })).unwrap();
        setSuccessMsg("Redirecting to checkout payment portal...");
      }
    } catch (err) {
      setActionError((err && (err.message || err)) || "Failed to process subscription upgrade.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResubmitReg = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await dispatch(resubmitRegistration()).unwrap();
      dispatch(fetchStoreSubscriptionStatus());
      setSuccessMsg("Registration re-submitted for Super Admin review.");
    } catch (err) {
      setActionError((err && (err.message || err)) || "Failed to re-submit registration.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReapplySamePlan = async (planId) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await dispatch(resubmitSubscriptionRequest({ planId })).unwrap();
      dispatch(fetchStoreSubscriptionStatus());
      if (res?.requiresPayment === false) {
        setSuccessMsg(res.message || "Subscription request reapplied successfully without additional payment.");
      } else {
        handleSubscribe(planId);
      }
    } catch (err) {
      setActionError((err && (err.message || err)) || "Failed to reapply subscription.");
    } finally {
      setActionLoading(false);
    }
  };

  if (userProfile && userProfile.role !== "ROLE_STORE_ADMIN") {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="p-8 bg-card border border-border rounded-3xl shadow-sm space-y-4">
          <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-muted-foreground mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-muted-foreground text-xs leading-relaxed max-w-sm mx-auto">
            Only the designated Primary Store Administrator can modify billing and subscription plans.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Store Subscription & Plan Governance
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your retail quota limits, billing cycle, and tier upgrades
        </p>
      </div>

      {paymentNotice && (
        <div className="p-4 bg-[#FDF6E2] border border-[#EED896] text-[#785600] rounded-2xl flex items-center gap-3 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-[#B8860B] shrink-0" />
          <div>{paymentNotice}</div>
        </div>
      )}

      {/* REGISTRATION STATUS NOTICES */}
      {regStatus === "PENDING" && (
        <div className="p-5 bg-[#FDF6E2] border border-[#EED896] rounded-2xl text-[#785600] flex items-start gap-3.5">
          <Clock className="w-6 h-6 text-[#B8860B] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-[#785600]">Store Registration Pending Super Admin Approval</h3>
            <p className="text-xs text-[#785600]/90 mt-1 leading-relaxed">
              Your merchant profile was successfully submitted and is currently in the verification queue. Paid subscription tiers will activate upon onboarding approval.
            </p>
          </div>
        </div>
      )}

      {regStatus === "REJECTED" && (
        <div className="p-5 bg-[#FBF0EC] border border-[#EFC8BD] rounded-2xl text-[#7A331E] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-[#7A331E]">Store Registration Rejected</h3>
              <p className="text-xs text-[#7A331E]/90 mt-1">
                Feedback: {statusResponse?.registrationRejectionReason || store?.registrationRejectionReason || "Please verify your tax and business identity details."}
              </p>
            </div>
          </div>
          <Button onClick={handleResubmitReg} disabled={actionLoading} className="text-xs font-bold h-9 shrink-0 gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Resubmit Application
          </Button>
        </div>
      )}

      {regStatus === "BLOCKED" && (
        <div className="p-5 bg-[#FBF0EC] border border-[#EFC8BD] rounded-2xl text-[#7A331E] flex items-start gap-3">
          <XCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-[#7A331E]">Merchant Account Suspended</h3>
            <p className="text-xs text-[#7A331E]/90 mt-1">
              Store access is restricted by platform governance. Contact super admin support for resolution.
            </p>
          </div>
        </div>
      )}

      {/* ACTIVE SUBSCRIPTION BANNER */}
      {regStatus === "ACTIVE" && (
        <>
          {subStatus === "ACTIVE" && currentPlan && (
            <Card className="border-[#262422] bg-card shadow-sm">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#262422] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-6 h-6 text-[#C9A227] stroke-[3]" />
                  </div>
                  <div>
                    <div className="font-bold text-base text-foreground">Current Active Tier: {currentPlan.name}</div>
                    <div className="text-xs text-muted-foreground font-mono font-medium">
                      ₹{currentPlan.price?.toLocaleString()} / {currentPlan.billingCycle?.toLowerCase()}
                    </div>
                  </div>
                </div>
                <Badge variant="active" className="text-xs px-3 py-1 self-start sm:self-auto">
                  ACTIVE SUBSCRIPTION
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Quota Usage Bars */}
          {subStatus === "ACTIVE" && currentPlan && storeOverview && (
            <Card>
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#B8860B]" /> Resource Quota Consumption
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {currentPlan.maxProducts != null && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-secondary/30 border border-border/60">
                      <div className="flex justify-between text-xs font-semibold text-foreground">
                        <span className="flex items-center gap-1.5">
                          <ShoppingCart className="w-3.5 h-3.5 text-[#B8860B]" />
                          Products Catalog
                        </span>
                        <span className="font-mono">
                          {storeOverview.totalProducts ?? 0} / {currentPlan.maxProducts}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(((storeOverview.totalProducts ?? 0) / currentPlan.maxProducts) * 100, 100)}
                        className="h-1.5 bg-secondary"
                      />
                    </div>
                  )}
                  {currentPlan.maxBranches != null && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-secondary/30 border border-border/60">
                      <div className="flex justify-between text-xs font-semibold text-foreground">
                        <span className="flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-[#B8860B]" />
                          Branch Workstations
                        </span>
                        <span className="font-mono">
                          {storeOverview.totalBranches ?? 0} / {currentPlan.maxBranches}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(((storeOverview.totalBranches ?? 0) / currentPlan.maxBranches) * 100, 100)}
                        className="h-1.5 bg-secondary"
                      />
                    </div>
                  )}
                  {currentPlan.maxUsers != null && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-secondary/30 border border-border/60">
                      <div className="flex justify-between text-xs font-semibold text-foreground">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#B8860B]" />
                          Staff Accounts
                        </span>
                        <span className="font-mono">
                          {storeOverview.totalEmployees ?? 0} / {currentPlan.maxUsers}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(((storeOverview.totalEmployees ?? 0) / currentPlan.maxUsers) * 100, 100)}
                        className="h-1.5 bg-secondary"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {subStatus === "PENDING" && requestedPlan && (
            <div className="p-5 bg-[#FDF6E2] border border-[#EED896] rounded-2xl text-[#785600] flex items-center gap-3.5">
              <Clock className="w-6 h-6 text-[#B8860B] shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-[#785600]">Tier Upgrade Request In Verification</h3>
                <p className="text-xs text-[#785600]/90 mt-0.5">
                  You requested <strong>{requestedPlan.name}</strong>. Payment received and waiting for admin tier activation.
                </p>
              </div>
            </div>
          )}

          {subStatus === "REJECTED" && (
            <div className="p-5 bg-[#FBF0EC] border border-[#EFC8BD] rounded-2xl text-[#7A331E] space-y-3">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-[#7A331E]">Subscription Upgrade Request Rejected</h3>
                  <p className="text-xs text-[#7A331E]/90 mt-1">
                    Your request for {statusResponse?.rejectedPlanName || "selected tier"} was rejected.
                    {statusResponse?.subscriptionRejectionReason && (
                      <span className="block font-semibold mt-0.5">Reason: "{statusResponse.subscriptionRejectionReason}"</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#EFC8BD]">
                {statusResponse?.rejectedPlanId && (
                  <Button
                    onClick={() => handleReapplySamePlan(statusResponse.rejectedPlanId)}
                    disabled={actionLoading}
                    className="text-xs font-bold h-9 gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reapply (No Extra Payment)
                  </Button>
                )}
                <a href="#plans-grid" className="text-xs font-bold text-[#7A331E] hover:underline underline-offset-4">
                  Or choose an alternative plan &rarr;
                </a>
              </div>
            </div>
          )}

          {/* AVAILABLE PLANS GRID */}
          <div id="plans-grid" className="space-y-4 pt-2">
            <h2 className="text-lg font-bold text-foreground">Available Subscription Plans</h2>

            {plansLoading || subLoading ? (
              <div className="text-center py-10 text-xs text-muted-foreground font-semibold">
                Loading available subscription tiers...
              </div>
            ) : plansError || subError ? (
              <div className="text-center py-8 text-xs text-destructive font-semibold">
                {plansError || subError}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans?.map((plan) => {
                  const isCurrent = currentPlan?.id === plan.id;
                  const isRequested = requestedPlan?.id === plan.id;
                  const isPendingState = subStatus === "PENDING";

                  return (
                    <div
                      key={plan.id}
                      className={`bg-card rounded-3xl p-6 border flex flex-col justify-between transition-all duration-200 ${
                        isCurrent
                          ? "border-[#262422] ring-2 ring-[#262422]/20 shadow-md relative"
                          : isRequested
                          ? "border-[#B8860B] ring-2 ring-[#B8860B]/20 shadow-md relative"
                          : "border-border shadow-2xs hover:shadow-md"
                      }`}
                    >
                      <div>
                        {isCurrent && (
                          <div className="mb-3">
                            <span className="bg-[#262422] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              Current Plan
                            </span>
                          </div>
                        )}
                        {isRequested && (
                          <div className="mb-3">
                            <span className="bg-[#FDF6E2] text-[#785600] border border-[#EED896] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              Verification Pending
                            </span>
                          </div>
                        )}

                        <h3 className="text-lg font-bold text-foreground mb-1">{plan.name}</h3>
                        <div className="flex items-baseline mb-4 pb-4 border-b border-border">
                          <span className="text-3xl font-black font-mono text-foreground">
                            ₹{plan.price?.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1.5 font-medium">
                            /{plan.billingCycle?.toLowerCase()}
                          </span>
                        </div>

                        <ul className="space-y-2.5 mb-6 text-xs">
                          {plan.maxBranches && (
                            <li className="flex items-center gap-2 text-foreground font-medium">
                              <Store className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
                              <span>Up to {plan.maxBranches} Branch Locations</span>
                            </li>
                          )}
                          {plan.maxUsers && (
                            <li className="flex items-center gap-2 text-foreground font-medium">
                              <Users className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
                              <span>Up to {plan.maxUsers} Cashier & Staff Logins</span>
                            </li>
                          )}
                          {plan.maxProducts && (
                            <li className="flex items-center gap-2 text-foreground font-medium">
                              <ShoppingCart className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
                              <span>Up to {plan.maxProducts?.toLocaleString()} Products Catalog</span>
                            </li>
                          )}
                          {plan.extraFeatures && plan.extraFeatures.length > 0 && (
                            <li className="pt-2 border-t border-border/60">
                              <span className="font-bold text-foreground block mb-1.5">Includes:</span>
                              <ul className="space-y-1 pl-4 list-disc text-muted-foreground text-[11px]">
                                {plan.extraFeatures.map((feature, idx) => (
                                  <li key={idx}><span>{feature}</span></li>
                                ))}
                              </ul>
                            </li>
                          )}
                        </ul>
                      </div>

                      <Button
                        className="w-full text-xs font-bold h-10"
                        variant={isCurrent ? "outline" : "default"}
                        disabled={actionLoading || isCurrent || isPendingState}
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {actionLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isCurrent ? (
                          "Currently Active Tier"
                        ) : isRequested ? (
                          "Approval Pending"
                        ) : currentPlan ? (
                          "Upgrade / Switch Tier"
                        ) : (
                          "Select & Subscribe"
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {actionError && (
        <div className="p-3 bg-[#FBF0EC] border border-[#EFC8BD] text-destructive text-center rounded-xl text-xs font-bold">
          {actionError}
        </div>
      )}
      {successMsg && subStatus !== "ACTIVE" && (
        <div className="p-3 bg-[#262422] text-white text-center rounded-xl text-xs font-bold">
          {successMsg}
        </div>
      )}
    </div>
  );
};

export default Upgrade;