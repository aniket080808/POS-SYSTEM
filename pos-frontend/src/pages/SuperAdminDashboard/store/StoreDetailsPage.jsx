import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Check,
  Clock,
  Loader2,
  Building2,
  ExternalLink,
  Sliders,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import StoreStatusBadge from "./StoreStatusBadge";
import { formatDateTime } from "../../../utils/formateDate";
import { formatDateByPattern } from "@/utils/dateUtils";
import {
  getStoreById,
  getStoreSubscription,
  moderateStore,
} from "@/Redux Toolkit/features/store/storeThunks";
import { getStoreUsageForAdmin } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";
import api from "@/utils/api";

const UsageBar = ({ icon, label, used, limit, requestedLimit, isPending }) => {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : limit > 0 ? Math.min(((used ?? 0) / limit) * 100, 100) : 0;

  return (
    <div className="space-y-2 p-4 rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        <span className="text-sm font-bold font-mono text-foreground">
          {isPending ? (
            <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">
              {requestedLimit ? `0 / ${requestedLimit} (Pending Approval)` : "Pending Approval"}
            </span>
          ) : isUnlimited ? (
            "Unlimited"
          ) : (
            `${used ?? 0} / ${limit ?? 0}`
          )}
        </span>
      </div>
      {!isUnlimited && !isPending && (
        <Progress value={percentage} className="h-2 bg-secondary" />
      )}
      {!isUnlimited && !isPending && (
        <p className="text-[11px] text-muted-foreground text-right font-medium">
          {percentage.toFixed(0)}% utilized
        </p>
      )}
      {isPending && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 text-right font-medium">
          Quota unlocks upon request approval
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
  const [impersonating, setImpersonating] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Quota Override Modal State
  const [quotaDialogOpen, setQuotaDialogOpen] = useState(false);
  const [savingQuota, setSavingQuota] = useState(false);
  const [customBranches, setCustomBranches] = useState("");
  const [customUsers, setCustomUsers] = useState("");
  const [customProducts, setCustomProducts] = useState("");

  const [financialOverview, setFinancialOverview] = useState(null);
  const [financialLoading, setFinancialLoading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getStoreById(id));
      dispatch(getStoreSubscription(id));
      dispatch(getStoreUsageForAdmin(id));

      setFinancialLoading(true);
      api.get(`/api/super-admin/stores/${id}/financial-overview`)
        .then((res) => setFinancialOverview(res.data?.data || res.data))
        .catch(() => setFinancialOverview(null))
        .finally(() => setFinancialLoading(false));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (store) {
      setCustomBranches(store.customMaxBranches != null ? store.customMaxBranches : "");
      setCustomUsers(store.customMaxUsers != null ? store.customMaxUsers : "");
      setCustomProducts(store.customMaxProducts != null ? store.customMaxProducts : "");
    }
  }, [store]);

  const handleModerate = async (action, successMsg) => {
    if (!id) return;
    setActionLoading(true);
    try {
      await dispatch(moderateStore({ storeId: id, action })).unwrap();
      toast({
        title: "Status Updated",
        description: successMsg,
      });
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

  // 🛡️ Impersonate Store
  const handleAccessStorePortal = async () => {
    setImpersonating(true);
    try {
      await api.post(`/api/super-admin/stores/${id}/impersonate`);
      sessionStorage.setItem("impersonate_store_id", id);
      sessionStorage.setItem("impersonate_store_name", store?.brand || store?.name || "Store");
      toast({
        title: "Impersonation Mode Activated",
        description: `Now accessing workstation for ${store?.brand || "Store"}.`,
      });
      navigate("/store/dashboard");
    } catch (err) {
      toast({
        title: "Impersonation Failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
      setImpersonating(false);
    }
  };

  // 🔑 Direct Password Reset Email Dispatch
  const handleSendPasswordReset = async () => {
    setResettingPassword(true);
    try {
      const res = await api.post(`/api/super-admin/stores/${id}/send-password-reset`);
      toast({
        title: "Password Reset Link Sent",
        description: `A secure recovery link has been dispatched to ${store?.storeAdmin?.email || "store administrator"}.`,
      });
    } catch (err) {
      toast({
        title: "Password Reset Failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setResettingPassword(false);
    }
  };

  // ⚙️ Save Custom Quota Overrides
  const handleSaveQuotaOverrides = async (e) => {
    e.preventDefault();
    setSavingQuota(true);
    try {
      const params = new URLSearchParams();
      if (customBranches !== "") params.append("maxBranches", customBranches);
      if (customUsers !== "") params.append("maxUsers", customUsers);
      if (customProducts !== "") params.append("maxProducts", customProducts);

      await api.patch(`/api/super-admin/stores/${id}/quota-override?${params.toString()}`);
      toast({
        title: "Quota Overrides Saved",
        description: "Store resource limits have been updated successfully.",
      });
      setQuotaDialogOpen(false);
      dispatch(getStoreById(id));
      dispatch(getStoreUsageForAdmin(id));
    } catch (err) {
      toast({
        title: "Failed to Save Quota",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setSavingQuota(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return formatDateByPattern(dateStr, store?.dateFormat || "DD/MM/YYYY");
    } catch {
      return dateStr;
    }
  };

  if (storeLoading && !store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#B8860B]" />
        <p className="text-muted-foreground text-xs font-semibold">Loading merchant profile...</p>
      </div>
    );
  }

  if (error && !store) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-bold text-sm mb-4">{error}</p>
        <Button onClick={() => navigate("/super-admin/stores")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Stores
        </Button>
      </div>
    );
  }

  const statusUpper = store?.status?.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/super-admin/stores")}
            className="h-10 w-10 rounded-xl cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {store?.brand || store?.name || `Store #${id}`}
              </h1>
              <StoreStatusBadge status={store?.status} />
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              Tenant Reference ID: #{store?.id}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Impersonate / Access Store Workstation */}
          <Button
            onClick={handleAccessStorePortal}
            disabled={impersonating}
            className="text-xs font-bold h-10 gap-1.5 bg-[#B8860B] hover:bg-[#966D09] text-white shadow-xs cursor-pointer"
            title="Log in directly as this store administrator to view live counters and settings"
          >
            {impersonating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            Access Store Workstation
          </Button>

          {/* Quota Override */}
          <Button
            variant="outline"
            onClick={() => setQuotaDialogOpen(true)}
            className="text-xs font-bold h-10 gap-1.5 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-muted-foreground" />
            Quota Override
          </Button>

          {/* Password Reset */}
          <Button
            variant="outline"
            onClick={handleSendPasswordReset}
            disabled={resettingPassword}
            className="text-xs font-bold h-10 gap-1.5 cursor-pointer"
            title="Dispatch a password reset email link to store owner"
          >
            {resettingPassword ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <KeyRound className="w-4 h-4 text-muted-foreground" />
            )}
            Send Password Reset
          </Button>

          {statusUpper === "ACTIVE" && (
            <Button
              variant="destructive"
              onClick={() => handleModerate("BLOCKED", "Store access has been blocked.")}
              disabled={actionLoading}
              className="text-xs font-bold h-10 gap-1.5 cursor-pointer"
            >
              <Ban className="w-4 h-4" /> Block Store
            </Button>
          )}
          {statusUpper === "BLOCKED" && (
            <Button
              onClick={() => handleModerate("ACTIVE", "Store account activated.")}
              disabled={actionLoading}
              className="text-xs font-bold h-10 gap-1.5 bg-[#262422] text-white hover:bg-[#383532] cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#C9A227]" /> Activate Store
            </Button>
          )}
          {statusUpper === "PENDING" && (
            <>
              <Button
                variant="outline"
                onClick={() => handleModerate("BLOCKED", "Store registration rejected.")}
                disabled={actionLoading}
                className="text-xs font-bold h-10 text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <Ban className="w-4 h-4 mr-1" /> Reject
              </Button>
              <Button
                onClick={() => handleModerate("ACTIVE", "Store registration approved.")}
                disabled={actionLoading}
                className="text-xs font-bold h-10 gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Approve Store
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Profile & Resource Usage */}
        <div className="lg:col-span-2 space-y-6">
          {/* Merchant Profile Information */}
          <Card className="bg-card border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold text-foreground">
                Merchant Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                <div>
                  <span className="text-muted-foreground font-medium block">Brand Name</span>
                  <span className="text-sm font-bold text-foreground mt-0.5 block">
                    {store?.brand || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium block">Store Category</span>
                  <span className="text-sm font-semibold text-foreground mt-0.5 block">
                    {store?.storeType || "Retail Store"}
                  </span>
                </div>

                <Separator className="sm:col-span-2" />

                <div>
                  <span className="text-muted-foreground font-medium block">Store Administrator</span>
                  <span className="text-sm font-bold text-foreground mt-0.5 block">
                    {store?.storeAdmin?.fullName || "—"}
                  </span>
                  <span className="text-muted-foreground font-mono block mt-0.5">
                    {store?.storeAdmin?.email || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium block">Contact Phone</span>
                  <span className="text-sm font-semibold text-foreground mt-0.5 block font-mono">
                    {store?.contact?.phone || store?.contact?.mobile || "—"}
                  </span>
                </div>

                <Separator className="sm:col-span-2" />

                <div className="sm:col-span-2">
                  <span className="text-muted-foreground font-medium block">Registered Address</span>
                  <span className="text-xs text-foreground mt-1 block leading-relaxed">
                    {store?.contact?.address || "No primary street address specified"}
                  </span>
                </div>

                {store?.gstNumber && (
                  <div>
                    <span className="text-muted-foreground font-medium block">GST Number</span>
                    <span className="text-xs font-mono font-bold text-foreground mt-0.5 block">
                      {store.gstNumber}
                    </span>
                  </div>
                )}
                {store?.panNumber && (
                  <div>
                    <span className="text-muted-foreground font-medium block">PAN Number</span>
                    <span className="text-xs font-mono font-bold text-foreground mt-0.5 block">
                      {store.panNumber}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex flex-wrap gap-6 text-[11px] text-muted-foreground font-mono">
                <span>Enrolled: {formatDate(store?.createdAt)}</span>
                <span>Updated: {formatDate(store?.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Commercial & Sales Performance Overview */}
          <Card className="bg-card border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Commercial & Financial Performance
                </CardTitle>
                <CardDescription className="text-xs">
                  Merchant's real-time sales volume, customer volume, and average ticket size
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-[#B8860B] border-[#EED896] bg-[#FDF6E2] dark:bg-[#2A2312]/50">
                Live Store Telemetry
              </Badge>
            </CardHeader>
            <CardContent className="p-6">
              {financialLoading ? (
                <div className="flex items-center justify-center py-6 text-xs text-muted-foreground animate-pulse">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#B8860B]" />
                  Loading store commercial telemetry...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 bg-secondary/50 rounded-xl border border-border/50">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Gross Sales (GMV)
                    </span>
                    <span className="text-lg font-black text-foreground font-mono mt-1 block">
                      ₹{(financialOverview?.totalSales || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3.5 bg-secondary/50 rounded-xl border border-border/50">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Completed Orders
                    </span>
                    <span className="text-lg font-black text-foreground font-mono mt-1 block">
                      {financialOverview?.totalOrders || 0}
                    </span>
                  </div>
                  <div className="p-3.5 bg-secondary/50 rounded-xl border border-border/50">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Average Ticket (AOV)
                    </span>
                    <span className="text-lg font-black text-foreground font-mono mt-1 block">
                      ₹{Math.round(financialOverview?.averageOrderValue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3.5 bg-secondary/50 rounded-xl border border-border/50">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Customers Served
                    </span>
                    <span className="text-lg font-black text-foreground font-mono mt-1 block">
                      {financialOverview?.totalCustomers || 0}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Multi-Location Resource Allocation */}
          <Card className="bg-card border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Multi-Location Resource Allocation
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time usage vs subscribed limits (including custom overrides)
                </CardDescription>
              </div>
              {(store?.customMaxBranches != null || store?.customMaxUsers != null || store?.customMaxProducts != null) && (
                <Badge variant="outline" className="text-[10px] font-bold border-amber-500/40 text-amber-600 dark:text-amber-400">
                  Custom Quotas Active
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <UsageBar
                icon={<Building2 className="w-4 h-4 text-[#B8860B]" />}
                label="Active Branch Locations"
                used={storeUsage?.totalBranchesUsed}
                limit={store?.customMaxBranches != null ? store.customMaxBranches : storeUsage?.maxBranches}
                requestedLimit={storeUsage?.requestedBranches}
                isPending={storeUsage?.isPending}
              />
              <UsageBar
                icon={<Users className="w-4 h-4 text-foreground" />}
                label="Active Cashier & Staff Accounts"
                used={storeUsage?.totalEmployeesUsed}
                limit={store?.customMaxUsers != null ? store.customMaxUsers : storeUsage?.maxUsers}
                requestedLimit={storeUsage?.requestedUsers}
                isPending={storeUsage?.isPending}
              />
              <UsageBar
                icon={<ShoppingCart className="w-4 h-4 text-[#B8860B]" />}
                label="Product Catalog SKUs"
                used={storeUsage?.totalProductsUsed}
                limit={store?.customMaxProducts != null ? store.customMaxProducts : storeUsage?.maxProducts}
                requestedLimit={storeUsage?.requestedProducts}
                isPending={storeUsage?.isPending}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Subscription Governance */}
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold text-foreground">
                Subscription Governance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Current Package
                </span>
                <div className="text-xl font-extrabold text-foreground mt-1">
                  {storeSubscription?.plan?.name || storeUsage?.planName || "Standard Free Tier"}
                </div>
                {(storeSubscription?.plan?.price != null || storeUsage?.planPrice != null) && (
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    ₹{(storeSubscription?.plan?.price || storeUsage?.planPrice)?.toLocaleString()}/
                    {(storeSubscription?.plan?.billingCycle || storeUsage?.billingCycle || "MONTHLY").toLowerCase()}
                  </div>
                )}
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground font-medium">Billing Status</span>
                  <span className="font-bold text-foreground uppercase">
                    {storeSubscription?.status || storeUsage?.subscriptionStatus || "ACTIVE"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground font-medium">Auto-Renew</span>
                  <span className="font-bold text-foreground">
                    {storeSubscription?.autoRenew !== false ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground font-medium">Enrolled Since</span>
                  <span className="font-mono text-foreground font-semibold">
                    {formatDate(store?.createdAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quota Override Modal Dialog */}
      <Dialog open={quotaDialogOpen} onOpenChange={setQuotaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveQuotaOverrides}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#B8860B]" />
                Store Quota Override
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set custom limits for <strong>{store?.brand}</strong>. Leave empty to use default subscription tier limits.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">
                  Max Branch Locations (Counters/Stations)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 10 (Leave blank for plan default)"
                  value={customBranches}
                  onChange={(e) => setCustomBranches(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Max Staff / Cashier Accounts
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 50 (Leave blank for plan default)"
                  value={customUsers}
                  onChange={(e) => setCustomUsers(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Max Catalog Products (SKUs)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 15000 (Leave blank for plan default)"
                  value={customProducts}
                  onChange={(e) => setCustomProducts(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuotaDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={savingQuota}
                className="text-xs font-bold gap-1.5 cursor-pointer"
              >
                {savingQuota ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Save Quota Override
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}