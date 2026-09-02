import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Progress } from "../../../components/ui/progress";
import {
  Phone,
  Mail,
  Calendar,
  MapPin,
  ShoppingCart,
  Store,
  Users,
  Ban,
  Check,
  ExternalLink,
  Shield,
  CreditCard,
} from "lucide-react";
import StoreStatusBadge from "./StoreStatusBadge";
import { formatDateTime } from "../../../utils/formateDate";
import { getStoreSubscription } from "../../../Redux Toolkit/features/store/storeThunks";
import { getStoreUsageForAdmin } from "../../../Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useNavigate } from "react-router";

const UsageBar = ({ icon, label, used, limit, requestedLimit, isPending }) => {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : limit > 0 ? Math.min(((used ?? 0) / limit) * 100, 100) : 0;

  return (
    <div className="space-y-1.5 p-3 rounded-xl border border-border/70 bg-card">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-mono text-muted-foreground font-semibold">
          {isPending ? (
            <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">
              {requestedLimit ? `0 / ${requestedLimit} (Pending)` : "Pending"}
            </span>
          ) : isUnlimited ? (
            "Unlimited"
          ) : (
            `${used ?? 0} / ${limit ?? 0}`
          )}
        </span>
      </div>
      {!isUnlimited && !isPending && (
        <Progress value={percentage} className="h-1.5 bg-secondary" />
      )}
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 py-1.5">
    <span className="text-xs text-muted-foreground font-medium shrink-0">{label}</span>
    <span className="text-xs text-foreground font-semibold text-right">{value || "—"}</span>
  </div>
);

export default function StoreDetailDrawer({
  store,
  open,
  onOpenChange,
  onBlockStore,
  onActivateStore,
  actionLoadingId,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { storeSubscription, loadingSubscription } = useSelector((state) => state.store);
  const { storeUsage } = useSelector((state) => state.storeAnalytics);

  useEffect(() => {
    if (store?.id && open) {
      dispatch(getStoreSubscription(store.id));
      dispatch(getStoreUsageForAdmin(store.id));
    }
  }, [store?.id, open, dispatch]);

  if (!store) return null;

  const statusUpper = store.status?.toUpperCase();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-card border-l border-border p-6 space-y-6">
        <SheetHeader className="space-y-1 text-left pb-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <StoreStatusBadge status={store.status} />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  sessionStorage.setItem("impersonate_store_id", store.id);
                  sessionStorage.setItem("impersonate_store_name", store.brand || store.name || "Store");
                  onOpenChange(false);
                  navigate("/store/dashboard");
                }}
                className="text-xs font-bold gap-1 h-8 bg-[#B8860B]/10 border-[#B8860B]/30 text-[#B8860B] hover:bg-[#B8860B]/20 cursor-pointer"
                title="Access store workstation directly"
              >
                Access Portal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  navigate(`/super-admin/stores/${store.id}`);
                }}
                className="text-xs font-bold gap-1.5 h-8 cursor-pointer"
              >
                Full Profile <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <SheetTitle className="text-xl font-black text-foreground tracking-tight pt-2">
            {store.brand || store.name || `Store #${store.id}`}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Registered tenant ID: #{store.id}
          </SheetDescription>
        </SheetHeader>

        {/* Owner & Contact */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Contact & Ownership
          </h4>
          <div className="bg-secondary/40 rounded-2xl p-4 border border-border/60 divide-y divide-border/60">
            <InfoRow label="Store Owner" value={store.storeAdmin?.fullName} />
            <InfoRow label="Email Address" value={store.contact?.email || store.storeAdmin?.email} />
            <InfoRow label="Phone Number" value={store.contact?.phone || store.storeAdmin?.phone} />
            <InfoRow label="Location Address" value={store.contact?.address || store.address || store.location || "No physical address specified"} />
            <InfoRow label="Registration Date" value={formatDateTime(store.createdAt)} />
          </div>
        </div>

        {/* Subscription Plan Tier */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Subscription Tier
            </h4>
            {(storeSubscription?.isPendingApproval || storeSubscription?.subscriptionStatus === "PENDING" || storeSubscription?.status === "PENDING") && (
              <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold px-2 py-0.5">
                PENDING APPROVAL
              </Badge>
            )}
          </div>
          <div className="bg-secondary/40 rounded-2xl p-4 border border-border/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-foreground block">
                  {storeSubscription?.requestedPlanName || storeSubscription?.planName || storeSubscription?.currentPlan?.name || "Free Trial Tier"}
                </span>
                {(storeSubscription?.isPendingApproval || storeSubscription?.subscriptionStatus === "PENDING" || storeSubscription?.status === "PENDING") && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    Requested Tier (Awaiting Approval)
                  </span>
                )}
              </div>
              <span className="font-mono font-black text-sm text-foreground text-right">
                ₹{(storeSubscription?.requestedPlanPrice ?? storeSubscription?.planPrice ?? storeSubscription?.currentPlan?.price ?? 0).toLocaleString()}
                <span className="text-xs text-muted-foreground font-normal ml-1">
                  /{storeSubscription?.requestedPlanBillingCycle?.toLowerCase() || storeSubscription?.billingCycle?.toLowerCase() || "month"}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-muted-foreground font-medium shrink-0">Status</span>
              {(() => {
                const storeStatus = store?.status;
                const isPending = storeSubscription?.isPendingApproval || storeSubscription?.subscriptionStatus === "PENDING" || storeSubscription?.status === "PENDING";
                const isBlocked = storeStatus === "BLOCKED" || storeSubscription?.subscriptionStatus === "BLOCKED" || storeSubscription?.status === "BLOCKED";
                const isActive = (storeSubscription?.subscriptionStatus === "ACTIVE" || storeSubscription?.status === "ACTIVE" || storeStatus === "ACTIVE") && !isPending && !isBlocked;

                if (isBlocked) {
                  return (
                    <Badge variant="destructive" className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 font-bold text-[10px]">
                      BLOCKED
                    </Badge>
                  );
                }
                if (isPending) {
                  return (
                    <Badge variant="outline" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold text-[10px]">
                      PENDING APPROVAL
                    </Badge>
                  );
                }
                if (isActive) {
                  return (
                    <Badge variant="active" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold text-[10px]">
                      ACTIVE
                    </Badge>
                  );
                }
                return (
                  <Badge variant="secondary" className="text-[10px]">
                    {storeSubscription?.status || storeSubscription?.subscriptionStatus || "ACTIVE"}
                  </Badge>
                );
              })()}
            </div>
            {(storeSubscription?.isPendingApproval || storeSubscription?.subscriptionStatus === "PENDING" || storeSubscription?.status === "PENDING") && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 font-medium mt-1">
                ⚡ Plan upgrade request waiting for approval in <strong>Store Requests</strong>.
              </div>
            )}
          </div>
        </div>

        {/* Quota Consumption */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Resource Quota Consumption
          </h4>
          <div className="space-y-2">
            <UsageBar
              icon={<Store className="w-3.5 h-3.5 text-[#B8860B]" />}
              label="Branch Workstations"
              used={storeUsage?.totalBranchesUsed ?? storeUsage?.activeBranches ?? 0}
              limit={storeSubscription?.maxBranches ?? storeSubscription?.currentPlan?.maxBranches ?? storeUsage?.maxBranches}
              requestedLimit={storeSubscription?.requestedMaxBranches}
              isPending={storeSubscription?.isPendingApproval || storeSubscription?.subscriptionStatus === "PENDING" || storeSubscription?.status === "PENDING"}
            />
            <UsageBar
              icon={<Users className="w-3.5 h-3.5 text-[#B8860B]" />}
              label="Staff Accounts"
              used={storeUsage?.totalEmployeesUsed ?? storeUsage?.activeUsers ?? 0}
              limit={storeSubscription?.maxUsers ?? storeSubscription?.currentPlan?.maxUsers ?? storeUsage?.maxUsers}
              requestedLimit={storeSubscription?.requestedMaxUsers}
              isPending={storeSubscription?.isPendingApproval || storeSubscription?.subscriptionStatus === "PENDING" || storeSubscription?.status === "PENDING"}
            />
            <UsageBar
              icon={<ShoppingCart className="w-3.5 h-3.5 text-[#B8860B]" />}
              label="Products Catalog"
              used={storeUsage?.totalProductsUsed ?? storeUsage?.activeProducts ?? 0}
              limit={storeSubscription?.maxProducts ?? storeSubscription?.currentPlan?.maxProducts ?? storeUsage?.maxProducts}
              requestedLimit={storeSubscription?.requestedMaxProducts}
              isPending={storeSubscription?.isPendingApproval || storeSubscription?.subscriptionStatus === "PENDING" || storeSubscription?.status === "PENDING"}
            />
          </div>
        </div>

        {/* Moderation Actions */}
        <div className="pt-4 border-t border-border/60 space-y-2">
          {statusUpper === "ACTIVE" && (
            <Button
              variant="destructive"
              className="w-full text-xs font-bold h-10 gap-2"
              onClick={() => onBlockStore?.(store.id)}
              disabled={actionLoadingId === store.id}
            >
              <Ban className="w-4 h-4" /> Block Store
            </Button>
          )}
          {statusUpper === "BLOCKED" && (
            <Button
              className="w-full text-xs font-bold h-10 gap-2 bg-[#262422] text-white hover:bg-[#383532]"
              onClick={() => onActivateStore?.(store.id)}
              disabled={actionLoadingId === store.id}
            >
              <Check className="w-4 h-4 text-[#C9A227]" /> Activate Store
            </Button>
          )}
          {statusUpper === "PENDING" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-xs font-bold h-10 text-destructive hover:bg-destructive/10"
                onClick={() => onBlockStore?.(store.id)}
                disabled={actionLoadingId === store.id}
              >
                <Ban className="w-4 h-4 mr-1" /> Reject
              </Button>
              <Button
                className="flex-1 text-xs font-bold h-10 gap-1.5"
                onClick={() => onActivateStore?.(store.id)}
                disabled={actionLoadingId === store.id}
              >
                <Check className="w-4 h-4" /> Approve
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
