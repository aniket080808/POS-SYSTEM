import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router';
import { Button } from '../../../components/ui/button';
import { CheckCircle, Store, Users, ShoppingCart, Info, Star, AlertCircle, Clock, XCircle, RotateCcw } from 'lucide-react';
import { getAllSubscriptionPlans } from '../../../Redux Toolkit/features/subscriptionPlan/subscriptionPlanThunks';
import { subscribeToPlan, upgradeSubscription } from '../../../Redux Toolkit/features/subscription/subscriptionThunks';
import { fetchStoreSubscriptionStatus, resubmitRegistration, resubmitSubscriptionRequest } from '../../../Redux Toolkit/features/storeSubscription/storeSubscriptionThunks';
import { getStoreOverview } from '@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks';
import { Progress } from '@/components/ui/progress';

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
    if (userProfile?.id) {
      dispatch(getStoreOverview(userProfile.id));
    }

    // Payment callback check
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      setSuccessMsg('Payment successful! Your request has been submitted for admin approval.');
    } else if (paymentStatus === 'failed') {
      setPaymentNotice('Payment failed or was cancelled. Your plan has not been changed. You can try again.');
    }
  }, [dispatch, searchParams]);

  const regStatus = statusResponse?.registrationStatus || store?.status || 'PENDING';
  const subStatus = statusResponse?.subscriptionStatus || 'NONE';
  const currentPlan = statusResponse?.currentPlan;
  const requestedPlan = statusResponse?.requestedPlan;

  const handleSubscribe = async (planId) => {
    if (!store?.id) return;
    setActionLoading(true);
    setActionError(null);
    setSuccessMsg(null);
    setPaymentNotice(null);
    try {
      if (currentPlan) {
        await dispatch(upgradeSubscription({ storeId: store.id, planId })).unwrap();
        setSuccessMsg('Redirecting to checkout page...');
      } else {
        await dispatch(subscribeToPlan({ storeId: store.id, planId })).unwrap();
        setSuccessMsg('Redirecting to checkout page...');
      }
    } catch (err) {
      setActionError((err && (err.message || err)) || 'Failed to subscribe/upgrade.');
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
      setSuccessMsg('Registration request re-submitted successfully!');
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
        setSuccessMsg(res.message || 'Subscription request reapplied successfully without extra payment!');
      } else {
        // Fallback to payment flow if different plan selected
        handleSubscribe(planId);
      }
    } catch (err) {
      setActionError((err && (err.message || err)) || 'Failed to reapply subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Store Subscription & Registration</h1>
        <p className="text-muted-foreground">Manage your plan and store status</p>
      </div>

      {paymentNotice && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>{paymentNotice}</div>
        </div>
      )}

      {/* REGISTRATION STATUS ALERT SECTION */}
      {regStatus === 'PENDING' && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-4">
          <Clock className="w-7 h-7 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg">Store Registration Pending Approval</h3>
            <p className="text-sm text-amber-700 mt-1">
              Your store registration has been submitted and is awaiting approval by the super administrator. Plans will become available once your store is approved.
            </p>
          </div>
        </div>
      )}

      {regStatus === 'REJECTED' && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-900 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <XCircle className="w-7 h-7 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg">Store Registration Rejected</h3>
              <p className="text-sm text-red-700 mt-1">
                Reason: {statusResponse?.registrationRejectionReason || store?.registrationRejectionReason || 'Contact support for details.'}
              </p>
            </div>
          </div>
          <Button onClick={handleResubmitReg} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0">
            <RotateCcw className="w-4 h-4 mr-2" /> Send Request Again
          </Button>
        </div>
      )}

      {regStatus === 'BLOCKED' && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-900 flex items-start gap-4">
          <XCircle className="w-7 h-7 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg">Store Blocked</h3>
            <p className="text-sm text-red-700 mt-1">Your store account has been blocked by the platform admin. Access to modules is restricted.</p>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION STATUS SECTION (ONLY ACTIVE REGISTRATION) */}
      {regStatus === 'ACTIVE' && (
        <>
          {subStatus === 'ACTIVE' && currentPlan && (
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-green-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-7 h-7 text-green-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-lg">Active Plan: {currentPlan.name}</div>
                  <div className="text-sm text-green-700">₹{currentPlan.price} / {currentPlan.billingCycle?.toLowerCase()}</div>
                </div>
              </div>
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">ACTIVE</span>
            </div>
          )}

          {/* Usage vs Limit Indicators */}
          {subStatus === 'ACTIVE' && currentPlan && storeOverview && (
            <div className="p-6 bg-card border rounded-xl space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Plan Usage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentPlan.maxProducts != null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <ShoppingCart className="w-4 h-4 text-green-500" />
                        Products
                      </span>
                      <span className="font-medium">
                        {storeOverview.totalProducts ?? 0}/{currentPlan.maxProducts}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(((storeOverview.totalProducts ?? 0) / currentPlan.maxProducts) * 100, 100)}
                      className="h-2"
                    />
                  </div>
                )}
                {currentPlan.maxBranches != null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Store className="w-4 h-4 text-purple-500" />
                        Branches
                      </span>
                      <span className="font-medium">
                        {storeOverview.totalBranches ?? 0}/{currentPlan.maxBranches}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(((storeOverview.totalBranches ?? 0) / currentPlan.maxBranches) * 100, 100)}
                      className="h-2"
                    />
                  </div>
                )}
                {currentPlan.maxUsers != null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="w-4 h-4 text-orange-500" />
                        Employees
                      </span>
                      <span className="font-medium">
                        {storeOverview.totalEmployees ?? 0}/{currentPlan.maxUsers}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(((storeOverview.totalEmployees ?? 0) / currentPlan.maxUsers) * 100, 100)}
                      className="h-2"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {subStatus === 'PENDING' && requestedPlan && (
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-center gap-4">
              <Clock className="w-7 h-7 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg">Subscription Request Pending Approval</h3>
                <p className="text-sm text-blue-700 mt-1">
                  You requested <strong>{requestedPlan.name}</strong>. Your payment was recorded and is awaiting super admin approval.
                </p>
              </div>
            </div>
          )}

          {subStatus === 'REJECTED' && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-900 space-y-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-7 h-7 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Subscription Request Rejected</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Your request for {statusResponse?.rejectedPlanName || 'your selected plan'} was rejected.
                    {statusResponse?.subscriptionRejectionReason && (
                      <span className="block font-medium mt-1">Reason: "{statusResponse.subscriptionRejectionReason}"</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-red-200">
                {statusResponse?.rejectedPlanId && (
                  <Button
                    onClick={() => handleReapplySamePlan(statusResponse.rejectedPlanId)}
                    disabled={actionLoading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> Reapply for {statusResponse?.rejectedPlanName} (No extra payment)
                  </Button>
                )}
                <a href="#plans-grid" className="text-sm font-medium text-red-700 hover:underline">
                  Or choose a different plan below (payment required) &rarr;
                </a>
              </div>
            </div>
          )}

          {/* PLANS GRID */}
          <div id="plans-grid" className="pt-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Available Subscription Plans</h2>

            {plansLoading || subLoading ? (
              <div className="text-center py-8">Loading plans...</div>
            ) : plansError || subError ? (
              <div className="text-center text-red-500 py-8">{plansError || subError}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans?.map((plan) => {
                  const isCurrent = currentPlan?.id === plan.id;
                  const isRequested = requestedPlan?.id === plan.id;
                  const isPendingState = subStatus === 'PENDING';

                  return (
                    <div
                      key={plan.id}
                      className={`bg-card rounded-2xl p-8 shadow-lg border relative flex flex-col ${
                        isCurrent ? 'ring-2 ring-emerald-500' : isRequested ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                            Current Plan
                          </span>
                        </div>
                      )}
                      {isRequested && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                            Pending Approval
                          </span>
                        </div>
                      )}
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-foreground">₹{plan.price}</span>
                          <span className="text-muted-foreground ml-1">/{plan.billingCycle?.toLowerCase()}</span>
                        </div>
                      </div>
                      <ul className="space-y-4 mb-8 flex-1">
                        {plan.description && (
                          <li className="text-muted-foreground flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <span>{plan.description}</span>
                          </li>
                        )}
                        {plan.maxBranches && (
                          <li className="text-muted-foreground flex items-center gap-2">
                            <Store className="w-5 h-5 text-purple-500 flex-shrink-0" />
                            <span>Max Branches: {plan.maxBranches}</span>
                          </li>
                        )}
                        {plan.maxUsers && (
                          <li className="text-muted-foreground flex items-center gap-2">
                            <Users className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            <span>Max Users: {plan.maxUsers}</span>
                          </li>
                        )}
                        {plan.maxProducts && (
                          <li className="text-muted-foreground flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span>Max Products: {plan.maxProducts}</span>
                          </li>
                        )}
                        {plan.extraFeatures && plan.extraFeatures.length > 0 && (
                          <li className="text-muted-foreground flex flex-col gap-1 mt-2">
                            <span className="font-medium flex items-center gap-2">
                              <Star className="w-5 h-5 text-yellow-500" /> Extra Features:
                            </span>
                            <ul className="ml-7 list-disc space-y-1">
                              {plan.extraFeatures.map((feature, idx) => (
                                <li key={idx}><span>{feature}</span></li>
                              ))}
                            </ul>
                          </li>
                        )}
                      </ul>
                      <Button
                        className="w-full mt-auto"
                        variant={isCurrent ? 'outline' : 'default'}
                        disabled={actionLoading || isCurrent || isPendingState}
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {isCurrent
                          ? 'Current Plan'
                          : isRequested
                          ? 'Requested (Pending)'
                          : currentPlan
                          ? 'Upgrade/Downgrade to Plan'
                          : 'Subscribe'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {actionError && <div className="text-center text-red-500 mt-6 font-medium">{actionError}</div>}
      {successMsg && <div className="text-center text-green-600 mt-6 font-medium">{successMsg}</div>}
    </div>
  );
};

export default Upgrade;