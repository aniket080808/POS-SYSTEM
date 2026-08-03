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
  CheckCircle,
} from "lucide-react";
import StoreStatusBadge from "./StoreStatusBadge";
import { formatDateTime } from "../../../utils/formateDate";
import { getStoreSubscription } from "../../../Redux Toolkit/features/store/storeThunks";
import { getStoreUsageForAdmin } from "../../../Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";

// ─── UsageBar ───────────────────────────────────────────────
const UsageBar = ({ icon, label, used, limit, indicatorColor }) => {
  const isUnlimited = limit === null || limit === -1 || limit === undefined;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <span className="text-sm font-medium">
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

// ─── SectionLabel ───────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <small className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
    {children}
  </small>
);

// ─── InfoRow: label + value pair, no icon clutter ───────────
const InfoRow = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4">
    <span className="text-xs text-muted-foreground shrink-0">{label}</span>
    <span className="text-sm text-right">{value}</span>
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
    const statusLower = (typeof status === "string" ? status : status.name || "").toUpperCase();
    const map = {
      ACTIVE: "bg-green-600 hover:bg-green-600",
      EXPIRED: "bg-red-600 hover:bg-red-600",
      CANCELLED: "bg-gray-600 hover:bg-gray-600",
      PENDING: "bg-yellow-500 hover:bg-yellow-500",
      REJECTED: "bg-red-600 hover:bg-red-600",
    };
    if (statusLower === "NONE") return <Badge variant="secondary">No Plan</Badge>;
    return (
      <Badge className={`${map[statusLower] || "bg-gray-500"} text-white`}>
        {statusLower.charAt(0) + statusLower.slice(1).toLowerCase()}
      </Badge>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col">
        {/* ── Sticky header: store name + ID, status badge, action buttons ── */}
        <div className="px-6 pt-6 pb-4 border-b bg-background sticky top-0 z-10">
          <SheetHeader className="space-y-0">
            <SheetTitle className="text-xl font-bold leading-tight">{store.brand}</SheetTitle>
            <SheetDescription className="text-xs">Store ID: {store.id}</SheetDescription>
          </SheetHeader>

          <div className="flex items-center justify-between mt-4">
            <StoreStatusBadge status={store.status} />
            <div className="flex gap-2">
              {store.status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBlockStore?.(store.id)}
                  disabled={actionLoadingId === store.id}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Ban className="w-4 h-4 mr-1" />
                  {actionLoadingId === store.id ? "Working..." : "Block"}
                </Button>
              )}
              {store.status === "blocked" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onActivateStore?.(store.id)}
                  disabled={actionLoadingId === store.id}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {actionLoadingId === store.id ? "Working..." : "Activate"}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditStore?.(store)}
                disabled={actionLoadingId === store.id}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Owner */}
          <div>
            <SectionLabel>Owner</SectionLabel>
            <div className="space-y-2">
              <p className="text-sm font-medium">{store.storeAdmin?.fullName || "N/A"}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {store.contact?.phone || "N/A"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {store.contact?.email || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Store details (brand already in header — no duplication) */}
          <div>
            <SectionLabel>Store Details</SectionLabel>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <span>{store.contact?.address || "Address not provided"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Registered on {formatDateTime(store.createdAt)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Business Documents */}
          <div>
            <SectionLabel>Business Documents</SectionLabel>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <InfoRow label="GST" value={store.gstNumber || "Not provided"} />
              <InfoRow label="PAN" value={store.panNumber || "Not provided"} />
            </div>
          </div>

          <Separator />

          {/* Subscription */}
          <div>
            <SectionLabel>Subscription</SectionLabel>
            {storeSubscription && storeSubscription.planName ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold">{storeSubscription.planName}</p>
                  {getSubscriptionStatusBadge(storeSubscription.subscriptionStatus)}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <InfoRow label="Start" value={formatDate(storeSubscription.startDate)} />
                  <InfoRow label="Expiry" value={formatDate(storeSubscription.endDate)} />
                  {storeSubscription.planPrice != null && (
                    <InfoRow
                      label="Price"
                      value={`₹${storeSubscription.planPrice} / ${storeSubscription.billingCycle?.toLowerCase()}`}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">No active subscription</span>
                {getSubscriptionStatusBadge(storeSubscription?.subscriptionStatus || "NONE")}
              </div>
            )}
          </div>

          {/* ── Plan Usage ──────────────────────────────────────────────────
               Bug fix: each metric is a full-width flex-col block (mb-3), NOT
               a grid-cols-1 md:grid-cols-3 that never reaches 3 cols at drawer
               width (400–540px < 768px md breakpoint). This was causing the
               three bars to collapse inline / text to run together.
          ─────────────────────────────────────────────────────────────── */}
          <div>
            <SectionLabel>Plan Usage</SectionLabel>

            {storeUsage && storeUsage.maxProducts != null ? (
              <div className="space-y-3">
                <UsageBar
                  icon={<ShoppingCart className="w-4 h-4 text-green-500" />}
                  label="Products"
                  used={storeUsage.totalProductsUsed}
                  limit={storeUsage.maxProducts}
                  indicatorColor="bg-green-500"
                />
                <UsageBar
                  icon={<Store className="w-4 h-4 text-purple-500" />}
                  label="Branches"
                  used={storeUsage.totalBranchesUsed}
                  limit={storeUsage.maxBranches}
                  indicatorColor="bg-purple-500"
                />
                <UsageBar
                  icon={<Users className="w-4 h-4 text-orange-500" />}
                  label="Employees"
                  used={storeUsage.totalEmployeesUsed}
                  limit={storeUsage.maxUsers}
                  indicatorColor="bg-orange-500"
                />
              </div>
            ) : storeUsage ? (
              <p className="text-sm text-muted-foreground">No active plan</p>
            ) : null /* still loading */ }
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
