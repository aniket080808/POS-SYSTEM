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
  Edit,
  Ban,
  CheckCircle2,
} from "lucide-react";
import StoreStatusBadge from "./StoreStatusBadge";
import { formatDateTime } from "../../../utils/formateDate";
import { getStoreSubscription } from "../../../Redux Toolkit/features/store/storeThunks";
import { getStoreUsageForAdmin } from "../../../Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";

const UsageBar = ({ icon, label, used, limit, indicatorColor }) => {
  const isUnlimited = limit === null || limit === -1 || limit === undefined;

  return (
    <div className="flex flex-col p-3 rounded-xl bg-muted/40 border border-border/60">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </div>
        <span className="text-xs font-bold font-mono text-foreground">
          {isUnlimited ? "Unlimited" : `${used ?? 0}/${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <Progress
          value={limit > 0 ? Math.min(((used ?? 0) / limit) * 100, 100) : 0}
          className="h-1.5"
          indicatorClassName={indicatorColor}
        />
      )}
    </div>
  );
};

const SectionLabel = ({ children }) => (
  <small className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
    {children}
  </small>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 py-1">
    <span className="text-xs text-muted-foreground shrink-0">{label}</span>
    <span className="text-xs font-semibold text-foreground text-right">{value}</span>
  </div>
);

export default function StoreDetailDrawer({
  store,
  open,
  onOpenChange,
  onBlockStore,
  onActivateStore,
  onEditStore,
  actionLoadingId,
}) {
  const dispatch = useDispatch();
  const { storeSubscription } = useSelector((state) => state.store);
  const { storeUsage } = useSelector((state) => state.storeAnalytics);

  useEffect(() => {
    if (open && store?.id) {
      dispatch(getStoreSubscription(store.id));
      dispatch(getStoreUsageForAdmin(store.id));
    }
  }, [open, store?.id, dispatch]);

  if (!store) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const getSubscriptionStatusBadge = (status) => {
    if (!status) return <Badge variant="secondary">No Plan</Badge>;
    const st = (typeof status === "string" ? status : status.name || "").toUpperCase();
    if (st === "ACTIVE") return <Badge variant="success">Active</Badge>;
    if (st === "TRIAL") return <Badge variant="info">Trial</Badge>;
    if (st === "PENDING") return <Badge variant="warning">Pending</Badge>;
    if (st === "EXPIRED" || st === "REJECTED") return <Badge variant="destructive">{st}</Badge>;
    return <Badge variant="outline">{st}</Badge>;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col bg-card border-l border-border">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/80 bg-card sticky top-0 z-10">
          <SheetHeader className="space-y-0.5">
            <SheetTitle className="text-lg font-bold text-foreground leading-tight">{store.brand}</SheetTitle>
            <SheetDescription className="text-xs font-mono text-muted-foreground">Store ID: #{store.id}</SheetDescription>
          </SheetHeader>

          <div className="flex items-center justify-between mt-4">
            <StoreStatusBadge status={store.status} />
            {(() => {
              const statusUpper = store.status?.toUpperCase();
              return (
                <div className="flex gap-2">
                  {statusUpper === "ACTIVE" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onBlockStore?.(store.id)}
                      disabled={actionLoadingId === store.id}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8 rounded-xl text-xs font-semibold"
                    >
                      <Ban className="w-3.5 h-3.5 mr-1" />
                      {actionLoadingId === store.id ? "Working..." : "Block"}
                    </Button>
                  )}
                  {statusUpper === "BLOCKED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onActivateStore?.(store.id)}
                      disabled={actionLoadingId === store.id}
                      className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 h-8 rounded-xl text-xs font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      {actionLoadingId === store.id ? "Working..." : "Activate"}
                    </Button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Owner */}
          <div>
            <SectionLabel>Store Ownership</SectionLabel>
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
              <p className="text-xs font-bold text-foreground">{store.storeAdmin?.fullName || "—"}</p>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-mono">
                  <Phone className="w-3 h-3 text-primary" />
                  {store.contact?.phone || "—"}
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Mail className="w-3 h-3 text-primary" />
                  {store.contact?.email || "—"}
                </span>
              </div>
            </div>
          </div>

          <Separator className="bg-border/60" />

          {/* Store Details */}
          <div>
            <SectionLabel>Location & Registration</SectionLabel>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-foreground">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <span>{store.contact?.address || "Address not provided"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px]">
                <Calendar className="w-3.5 h-3.5" />
                Registered on {formatDateTime(store.createdAt)}
              </div>
            </div>
          </div>

          <Separator className="bg-border/60" />

          {/* Business Documents */}
          <div>
            <SectionLabel>Tax & Identification</SectionLabel>
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/60">
              <InfoRow label="GST Number" value={store.gstNumber || "Not Provided"} />
              <InfoRow label="PAN Number" value={store.panNumber || "Not Provided"} />
            </div>
          </div>

          <Separator className="bg-border/60" />

          {/* Subscription */}
          <div>
            <SectionLabel>Active Subscription</SectionLabel>
            {storeSubscription && storeSubscription.planName ? (
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">{storeSubscription.planName}</p>
                  {getSubscriptionStatusBadge(storeSubscription.subscriptionStatus)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <InfoRow label="Start" value={formatDate(storeSubscription.startDate)} />
                  <InfoRow label="Expiry" value={formatDate(storeSubscription.endDate)} />
                  {storeSubscription.planPrice != null && (
                    <InfoRow
                      label="Rate"
                      value={`₹${storeSubscription.planPrice}/${storeSubscription.billingCycle?.toLowerCase()}`}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-xs text-muted-foreground">No active subscription</span>
                {getSubscriptionStatusBadge(storeSubscription?.subscriptionStatus || "NONE")}
              </div>
            )}
          </div>

          {/* Plan Usage */}
          <div>
            <SectionLabel>Allocated Quotas</SectionLabel>
            {storeUsage && storeUsage.maxProducts != null ? (
              <div className="space-y-2.5">
                <UsageBar
                  icon={<ShoppingCart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  label="Products"
                  used={storeUsage.totalProductsUsed}
                  limit={storeUsage.maxProducts}
                  indicatorColor="bg-emerald-500"
                />
                <UsageBar
                  icon={<Store className="w-3.5 h-3.5 text-primary" />}
                  label="Branches"
                  used={storeUsage.totalBranchesUsed}
                  limit={storeUsage.maxBranches}
                  indicatorColor="bg-primary"
                />
                <UsageBar
                  icon={<Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                  label="Employees"
                  used={storeUsage.totalEmployeesUsed}
                  limit={storeUsage.maxUsers}
                  indicatorColor="bg-amber-500"
                />
              </div>
            ) : storeUsage ? (
              <p className="text-xs text-muted-foreground">No active quota limits</p>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

