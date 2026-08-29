import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Store as StoreIcon,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  CreditCard,
  ShoppingCart,
  Users,
  Ban,
  CheckCircle2,
  Clock,
  Loader2,
  Building2,
  ShieldCheck,
} from "lucide-react";
import StoreStatusBadge from "./StoreStatusBadge";
import { formatDateTime } from "../../../utils/formateDate";
import {
  getStoreById,
  getStoreSubscription,
  moderateStore,
} from "@/Redux Toolkit/features/store/storeThunks";
import { getStoreUsageForAdmin } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";

// ─── UsageBar Component ─────────────────────────────────────────
const UsageBar = ({ icon, label, used, limit, indicatorColor }) => {
  const isUnlimited = limit === null || limit === -1 || limit === undefined;
  const percentage = isUnlimited ? 0 : limit > 0 ? Math.min(((used ?? 0) / limit) * 100, 100) : 0;

  return (
    <div className="space-y-2 p-3.5 rounded-xl border border-border/80 bg-muted/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </div>
        <span className="text-xs font-bold font-mono text-foreground">
          {isUnlimited ? "Unlimited" : `${used ?? 0} / ${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <Progress
          value={percentage}
          className="h-1.5"
          indicatorClassName={indicatorColor}
        />
      )}
      {!isUnlimited && (
        <p className="text-[10px] text-muted-foreground text-right font-mono">
          {percentage.toFixed(0)}% quota consumed
        </p>
      )}
    </div>
  );
};

export default function StoreDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { store, storeSubscription, loading: storeLoading, error } = useSelector((state) => state.store);
  const { storeUsage, loading: usageLoading } = useSelector((state) => state.storeAnalytics);

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getStoreById(id));
      dispatch(getStoreSubscription(id));
      dispatch(getStoreUsageForAdmin(id));
    }
  }, [id, dispatch]);

  const handleModerate = async (action, successMsg) => {
    if (!id) return;
    setActionLoading(true);
    try {
      await dispatch(moderateStore({ storeId: id, action })).unwrap();
      toast({
        title: "Success",
        description: successMsg,
      });
      // Refresh details
      dispatch(getStoreById(id));
    } catch (err) {
      toast({
        title: "Action Failed",
        description: err?.message || err || "Failed to update store status.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getSubscriptionBadge = (status) => {
    if (!status) return <Badge variant="secondary">No Active Plan</Badge>;
    const st = (typeof status === "string" ? status : status.name || "").toUpperCase();
    if (st === "ACTIVE") {
      return <Badge variant="success">Active</Badge>;
    }
    if (st === "TRIAL") {
      return <Badge variant="info">Trial</Badge>;
    }
    if (st === "PENDING") {
      return <Badge variant="warning">Pending Approval</Badge>;
    }
    if (st === "EXPIRED" || st === "REJECTED") {
      return <Badge variant="destructive">{st}</Badge>;
    }
    return <Badge variant="outline">{st}</Badge>;
  };

  if (storeLoading && !store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-xs">Loading store details...</p>
      </div>
    );
  }

  if (error && !store) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/super-admin/stores")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Stores
        </Button>
        <Card className="border-destructive/20 p-8 text-center rounded-2xl bg-destructive/5">
          <CardContent className="space-y-4">
            <p className="text-destructive text-xs font-semibold">{error}</p>
            <Button size="sm" onClick={() => dispatch(getStoreById(id))}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStore = store?.id?.toString() === id?.toString() ? store : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* ── Top Bar / Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/super-admin/stores")}
            className="flex items-center gap-1.5 rounded-xl h-9 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Stores
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {currentStore?.brand || `Store #${id}`}
              </h1>
              {currentStore && <StoreStatusBadge status={currentStore.status} />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Store ID: #{id} • Registered {currentStore?.createdAt ? formatDateTime(currentStore.createdAt) : "N/A"}
            </p>
          </div>
        </div>

        {/* Action Moderation Buttons */}
        {currentStore && (() => {
          const statusUpper = currentStore.status?.toUpperCase();
          return (
            <div className="flex items-center gap-2">
              {statusUpper === "ACTIVE" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModerate("BLOCKED", "Store has been blocked.")}
                  disabled={actionLoading}
                  className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl text-xs font-semibold gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{actionLoading ? "Processing..." : "Block Store"}</span>
                </Button>
              )}

              {statusUpper === "BLOCKED" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModerate("ACTIVE", "Store has been activated.")}
                  disabled={actionLoading}
                  className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 rounded-xl text-xs font-semibold gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{actionLoading ? "Processing..." : "Activate Store"}</span>
                </Button>
              )}

              {statusUpper === "PENDING" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleModerate("ACTIVE", "Store registration approved.")}
                    disabled={actionLoading}
                    className="rounded-xl text-xs font-semibold gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleModerate("BLOCKED", "Store registration rejected.")}
                    disabled={actionLoading}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl text-xs font-semibold gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </Button>
                </>
              )}
            </div>
          );
        })()}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Store Information & Verification */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store & Owner Profile */}
          <Card className="rounded-2xl border-border/80 shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <StoreIcon className="w-4 h-4 text-primary" />
                <span>Store & Owner Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1 p-3 rounded-xl bg-muted/40 border border-border/60">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Store Brand</p>
                  <p className="font-semibold text-foreground text-sm">{currentStore?.brand || "—"}</p>
                </div>
                <div className="space-y-1 p-3 rounded-xl bg-muted/40 border border-border/60">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Owner Name</p>
                  <p className="font-semibold text-foreground text-sm">{currentStore?.storeAdmin?.fullName || "—"}</p>
                </div>
                <div className="space-y-1 p-3 rounded-xl bg-muted/40 border border-border/60">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Contact Phone</p>
                  <p className="font-semibold text-foreground flex items-center gap-1.5 font-mono text-xs">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    {currentStore?.contact?.phone || currentStore?.storeAdmin?.phone || "—"}
                  </p>
                </div>
                <div className="space-y-1 p-3 rounded-xl bg-muted/40 border border-border/60">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Contact Email</p>
                  <p className="font-semibold text-foreground flex items-center gap-1.5 text-xs font-mono">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    {currentStore?.contact?.email || currentStore?.storeAdmin?.email || "—"}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Store Address</p>
                <p className="text-xs flex items-start gap-1.5 text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <span>{currentStore?.contact?.address || "Address not provided"}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Business & Tax Compliance */}
          <Card className="rounded-2xl border-border/80 shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Business & Tax Compliance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border/80 space-y-1 bg-card">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">GST Identification</p>
                  <p className="font-mono text-sm font-bold text-foreground">
                    {currentStore?.gstNumber || "Not Provided"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {currentStore?.gstNumber ? "Verified GST Identification" : "No GST number filed"}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border/80 space-y-1 bg-card">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">PAN Identification</p>
                  <p className="font-mono text-sm font-bold text-foreground">
                    {currentStore?.panNumber || "Not Provided"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {currentStore?.panNumber ? "Permanent Account Number" : "No PAN filed"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Subscription & Usage */}
        <div className="space-y-6">
          {/* Subscription Summary */}
          <Card className="rounded-2xl border-border/80 shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span>Subscription</span>
                </CardTitle>
                {getSubscriptionBadge(storeSubscription?.subscriptionStatus)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {storeSubscription && storeSubscription.planName ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/15">
                    <p className="text-base font-bold text-foreground">{storeSubscription.planName}</p>
                    {storeSubscription.planPrice != null && (
                      <p className="text-sm font-bold font-mono text-primary mt-0.5">
                        ₹{storeSubscription.planPrice} / {storeSubscription.billingCycle?.toLowerCase()}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Start Date</span>
                      <span className="font-medium text-foreground mt-0.5 block">{formatDate(storeSubscription.startDate)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Expiry Date</span>
                      <span className="font-medium text-foreground mt-0.5 block">{formatDate(storeSubscription.endDate)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-xs">
                  No active subscription plan found.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plan Usage Limits */}
          <Card className="rounded-2xl border-border/80 shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>Quota Allocations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {usageLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : storeUsage && storeUsage.maxProducts != null ? (
                <>
                  <UsageBar
                    icon={<ShoppingCart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    label="Products Catalog"
                    used={storeUsage.totalProductsUsed}
                    limit={storeUsage.maxProducts}
                    indicatorColor="bg-emerald-500"
                  />
                  <UsageBar
                    icon={<StoreIcon className="w-3.5 h-3.5 text-primary" />}
                    label="Active Branches"
                    used={storeUsage.totalBranchesUsed}
                    limit={storeUsage.maxBranches}
                    indicatorColor="bg-primary"
                  />
                  <UsageBar
                    icon={<Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                    label="Employee Seats"
                    used={storeUsage.totalEmployeesUsed}
                    limit={storeUsage.maxUsers}
                    indicatorColor="bg-amber-500"
                  />
                </>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No quota limits assigned.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
 