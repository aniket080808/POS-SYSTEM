import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { CheckCircle2, Store, Users, ShoppingCart, Info, Star, AlertCircle, Clock, XCircle, RotateCcw, ShieldCheck, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { getAllSubscriptionPlans } from '../../../Redux Toolkit/features/subscriptionPlan/subscriptionPlanThunks';
import { subscribeToPlan, upgradeSubscription } from '../../../Redux Toolkit/features/subscription/subscriptionThunks';
import { fetchStoreSubscriptionStatus, resubmitRegistration, resubmitSubscriptionRequest } from '../../../Redux Toolkit/features/storeSubscription/storeSubscriptionThunks';
import { getStoreOverview } from '@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks';
import { Progress } from '@/components/ui/progress';

const Upgrade = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { plans, loading: plansLoading, error: plansError } = useSelector((state) => state.subscriptionPlan || {});
  const { statusResponse, loading: subLoading, error: subError } = useSelector((state) => state.storeSubscription || {});
  const { store } = useSelector((state) => state.store || {});
  const { userProfile } = useSelector((state) => state.user || {});
  const { storeOverview } = useSelector((state) => state.storeAnalytics || {});

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [paymentNotice, setPaymentNotice] = useState(null);

  useEffect(() => {
    dispatch(getAllSubscriptionPlans());
    dispatch(fetchStoreSubscriptionStatus());
    if (userProfile?.id) {
      dispatch(getStoreOverview(userProfile.id));
    }

    // Payment callback check
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      setSuccessMsg('Payment transaction confirmed! Your subscription upgrade request is logged.');
    } else if (paymentStatus === 'failed') {
      setPaymentNotice('Payment transaction was cancelled or unsuccessful. Your current subscription remains unchanged.');
    }
  }, [dispatch, searchParams, userProfile]);

  const activeStore = store || userProfile?.store;
  const regStatus = statusResponse?.registrationStatus || activeStore?.status || 'PENDING';
  const subStatus = statusResponse?.subscriptionStatus || 'NONE';
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
        setSuccessMsg('Redirecting to checkout payment portal...');
      } else {
        await dispatch(subscribeToPlan({ storeId, planId })).unwrap();
        setSuccessMsg('Redirecting to checkout payment portal...');
      }
    } catch (err) {
      setActionError((err && (err.message || err)) || 'Failed to initiate plan upgrade.');
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
      setSuccessMsg('Registration request re-submitted successfully for review!');
    } catch (err) {
      setActionError((err && (err.message || err)) || 'Failed to re-submit registration.');
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
        setSuccessMsg(res.message || 'Subscription request reapplied without requiring extra payment.');
      } else {
        handleSubscribe(planId);
      }
    } catch (err) {
      setActionError((err && (err.message || err)) || 'Failed to reapply subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  if (userProfile && userProfile.role !== 'ROLE_STORE_ADMIN') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <Card className="rounded-2xl border-amber-500/20 bg-amber-500/5 p-8 shadow-2xs">
          <CardContent className="space-y-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400 w-fit mx-auto">
              <Info className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-foreground">Restricted to Store Administrator</h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Plan subscriptions and tier renewals can only be configured by the primary Store Administrator account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Subscription & Workspace Quotas</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your NexPOS retail tier, branch capacity, and billing lifecycle.
        </p>
      </div>

      {paymentNotice && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-2xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>{paymentNotice}</div>
        </div>
      )}

      {/* REGISTRATION STATUS ALERT SECTION */}
      {regStatus === 'PENDING' && (
        <Card className="rounded-2xl border-amber-500/20 bg-amber-500/5 p-5 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-xs text-foreground">Store Registration Review in Progress</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your merchant application is queued for Super Admin compliance verification. Plans will unlock once verification finishes.
              </p>
            </div>
          </div>
        </Card>
      )}

      {regStatus === 'REJECTED' && (
        <Card className="rounded-2xl border-destructive/20 bg-destructive/5 p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-xs text-foreground">Store Registration Feedback</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reason: {statusResponse?.registrationRejectionReason || store?.registrationRejectionReason || 'Please review store profile details.'}
                </p>
              </div>
            </div>
            <Button onClick={handleResubmitReg} disabled={actionLoading} variant="destructive" size="sm" className="rounded-xl text-xs font-semibold shrink-0">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Send Request Again
            </Button>
          </div>
        </Card>
      )}

      {regStatus === 'BLOCKED' && (
        <Card className="rounded-2xl border-destructive/20 bg-destructive/5 p-5 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-xs text-foreground">Store Account Restricted</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Your store account has been blocked by platform administration.</p>
            </div>
          </div>
        </Card>
      )}

      {/* SUBSCRIPTION STATUS SECTION (ONLY ACTIVE REGISTRATION) */}
      {regStatus === 'ACTIVE' && (
        <>
          {subStatus === 'ACTIVE' && currentPlan && (
            <Card className="rounded-2xl border-emerald-500/20 bg-emerald-500/5 p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">Active Subscription: {currentPlan.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">₹{currentPlan.price} / {currentPlan.billingCycle?.toLowerCase()}</div>
                  </div>
                </div>
                <Badge variant="success" className="text-xs font-bold px-2.5 py-0.5">ACTIVE</Badge>
              </div>
            </Card>
          )}

          {/* Usage vs Limit Indicators */}
          {subStatus === 'ACTIVE' && currentPlan && storeOverview && (
            <Card className="rounded-2xl border-border/80 shadow-2xs p-5">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-xs text-foreground">Resource Utilization Quotas</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {currentPlan.maxProducts != null && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/40">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                        <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />
                        Products Catalog
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {storeOverview.totalProducts ?? 0} / {currentPlan.maxProducts}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(((storeOverview.totalProducts ?? 0) / currentPlan.maxProducts) * 100, 100)}
                      className="h-1.5 rounded-full"
                    />
                  </div>
                )}
                {currentPlan.maxBranches != null && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/40">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Store className="w-3.5 h-3.5 text-primary" />
                        Retail Branches
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {storeOverview.totalBranches ?? 0} / {currentPlan.maxBranches}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(((storeOverview.totalBranches ?? 0) / currentPlan.maxBranches) * 100, 100)}
                      className="h-1.5 rounded-full"
                    />
                  </div>
                )}
                {currentPlan.maxUsers != null && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/40">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-amber-500" />
                        Staff Accounts
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {storeOverview.totalEmployees ?? 0} / {currentPlan.maxUsers}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(((storeOverview.totalEmployees ?? 0) / currentPlan.maxUsers) * 100, 100)}
                      className="h-1.5 rounded-full"
                    />
                  </div>
                )}
              </div>
            </Card>
          )}

          {subStatus === 'PENDING' && requestedPlan && (
            <Card className="rounded-2xl border-sky-500/20 bg-sky-500/5 p-5 shadow-2xs">
              <div className="flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-xs text-foreground">Subscription Upgrade Request Pending</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You requested <strong>{requestedPlan.name}</strong>. Payment transaction is recorded and awaiting Super Admin activation.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {subStatus === 'REJECTED' && (
            <Card className="rounded-2xl border-destructive/20 bg-destructive/5 p-5 shadow-2xs space-y-3">
              <div className="flex items-start gap-3.5">
                <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-xs text-foreground">Subscription Upgrade Request Declined</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your request for {statusResponse?.rejectedPlanName || 'selected tier'} was declined.
                    {statusResponse?.subscriptionRejectionReason && (
                      <span className="block font-medium text-destructive mt-1">Reason: "{statusResponse.subscriptionRejectionReason}"</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-destructive/20">
                {statusResponse?.rejectedPlanId && (
                  <Button
                    onClick={() => handleReapplySamePlan(statusResponse.rejectedPlanId)}
                    disabled={actionLoading}
                    variant="destructive"
                    size="sm"
                    className="rounded-xl text-xs font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reapply for {statusResponse?.rejectedPlanName} (No extra payment)
                  </Button>
                )}
                <a href="#plans-grid" className="text-xs font-semibold text-primary hover:underline">
                  Or select an alternate tier below &rarr;
                </a>
              </div>
            </Card>
          )}

          {/* PLANS GRID */}
          <div id="plans-grid" className="pt-2">
            <h2 className="text-base font-bold text-foreground mb-4">Available NexPOS Plans</h2>

            {plansLoading || subLoading ? (
              <div className="text-center py-12 text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading subscription tiers...
              </div>
            ) : plansError || subError ? (
              <div className="text-center text-destructive py-8 text-xs">{plansError || subError}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {plans?.map((plan) => {
                  const isCurrent = currentPlan?.id === plan.id;
                  const isRequested = requestedPlan?.id === plan.id;
                  const isPendingState = subStatus === 'PENDING';

                  return (
                    <Card
                      key={plan.id}
                      className={`rounded-2xl p-5 shadow-2xs border transition-all flex flex-col justify-between relative ${
                        isCurrent
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                          : isRequested
                          ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-500/5'
                          : 'border-border/80 hover:shadow-xs'
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                          <Badge variant="default" className="text-[10px] font-bold px-2 py-0.5">
                            Current Active Plan
                          </Badge>
                        </div>
                      )}
                      {isRequested && (
                        <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                          <Badge variant="warning" className="text-[10px] font-bold px-2 py-0.5">
                            Upgrade Pending
                          </Badge>
                        </div>
                      )}
                      <div>
                        <div className="text-center pb-4 border-b border-border/60">
                          <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                          <div className="flex items-baseline justify-center mt-2">
                            <span className="text-3xl font-extrabold text-foreground tracking-tight font-mono">₹{plan.price}</span>
                            <span className="text-xs text-muted-foreground ml-1 font-mono">/{plan.billingCycle?.toLowerCase()}</span>
                          </div>
                        </div>
                        <ul className="space-y-2.5 py-4 text-xs">
                          {plan.description && (
                            <li className="text-muted-foreground flex items-center gap-2">
                              <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>{plan.description}</span>
                            </li>
                          )}
                          {plan.maxBranches && (
                            <li className="text-muted-foreground flex items-center gap-2">
                              <Store className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>Max Branches: <strong className="text-foreground">{plan.maxBranches}</strong></span>
                            </li>
                          )}
                          {plan.maxUsers && (
                            <li className="text-muted-foreground flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>Max Users: <strong className="text-foreground">{plan.maxUsers}</strong></span>
                            </li>
                          )}
                          {plan.maxProducts && (
                            <li className="text-muted-foreground flex items-center gap-2">
                              <ShoppingCart className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>Max Products: <strong className="text-foreground">{plan.maxProducts}</strong></span>
                            </li>
                          )}
                          {plan.extraFeatures && plan.extraFeatures.length > 0 && (
                            <li className="pt-2 border-t border-border/40">
                              <span className="font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Tier Capabilities:
                              </span>
                              <ul className="space-y-1 pl-5 list-disc text-muted-foreground text-[11px]">
                                {plan.extraFeatures.map((feature, idx) => (
                                  <li key={idx}><span>{feature}</span></li>
                                ))}
                              </ul>
                            </li>
                          )}
                        </ul>
                      </div>
                      <Button
                        className="w-full mt-3 rounded-xl text-xs font-semibold h-9"
                        variant={isCurrent ? 'outline' : 'default'}
                        disabled={actionLoading || isCurrent || isPendingState}
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {isCurrent
                          ? 'Current Plan'
                          : isRequested
                          ? 'Requested (Pending Review)'
                          : currentPlan
                          ? 'Upgrade to Tier'
                          : 'Subscribe Now'}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {actionError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl text-center font-medium">
          {actionError}
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl text-center font-medium">
          {successMsg}
        </div>
      )}
    </div>
  );
};

export default Upgrade;