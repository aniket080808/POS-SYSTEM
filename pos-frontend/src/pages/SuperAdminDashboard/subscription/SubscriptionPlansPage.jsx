import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getAllSubscriptionPlans,
  deleteSubscriptionPlan,
  updateSubscriptionPlan,
} from "@/Redux Toolkit/features/subscriptionPlan/subscriptionPlanThunks";
import { toast } from "../../../components/ui/use-toast";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AddPlanDialog from "./AddPlanDialog";
import EditPlanDialog from "./EditPlanDialog";
import { Switch } from "../../../components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, Search, Check, Layers, Store, Users, ShoppingCart } from "lucide-react";

const FEATURE_FLAGS = [
  { key: "enableAdvancedReports", legacyKey: "advancedReports", label: "Advanced Reports" },
  { key: "enableInventory", legacyKey: "inventory", label: "Inventory System" },
  { key: "enableIntegrations", legacyKey: "integrations", label: "Integrations" },
  { key: "enableEcommerce", legacyKey: "ecommerce", label: "eCommerce" },
  { key: "enableInvoiceBranding", legacyKey: "invoiceBranding", label: "Invoice Branding" },
  { key: "prioritySupport", legacyKey: "prioritySupport", label: "Priority Support" },
  { key: "enableMultiLocation", legacyKey: "multiLocation", label: "Multi-location" },
];

function getFeatureBadges(plan) {
  const activeFeatures = FEATURE_FLAGS.filter((f) => plan[f.key] || plan[f.legacyKey]);
  return (
    <div className="flex flex-wrap gap-1">
      {activeFeatures.map((f) => (
        <span
          key={f.key}
          className="inline-flex items-center gap-1 text-[11px] font-semibold bg-secondary text-foreground px-2 py-0.5 rounded-lg border border-border"
        >
          <Check className="w-2.5 h-2.5 text-[#B8860B] stroke-[3]" />
          {f.label}
        </span>
      ))}
      {activeFeatures.length === 0 && (
        <span className="text-xs text-muted-foreground">Standard Base Features</span>
      )}
    </div>
  );
}

export default function SubscriptionPlansPage() {
  const dispatch = useDispatch();
  const { plans = [], error } = useSelector((state) => state.subscriptionPlan);

  const [search, setSearch] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);

  useEffect(() => {
    dispatch(getAllSubscriptionPlans());
  }, [dispatch]);

  const filteredPlans = useMemo(() => {
    let filtered = plans;
    if (search) {
      filtered = filtered.filter((plan) =>
        plan.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered;
  }, [plans, search]);

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;
    const res = await dispatch(deleteSubscriptionPlan(planToDelete.id));
    if (res.meta.requestStatus === "fulfilled") {
      toast({
        title: "Plan Deleted",
        description: `Subscription plan "${planToDelete.name}" deleted successfully.`,
      });
      dispatch(getAllSubscriptionPlans());
    } else {
      toast({
        title: "Deletion Blocked",
        description: res.payload || "Failed to delete plan. Stores may still be assigned to it.",
        variant: "destructive",
      });
    }
    setPlanToDelete(null);
  };

  const handleStatusToggle = async (plan) => {
    setStatusLoadingId(plan.id);
    const updated = { ...plan, active: !plan.active };
    delete updated.createdAt;
    delete updated.updatedAt;
    const res = await dispatch(updateSubscriptionPlan({ id: plan.id, plan: updated }));
    setStatusLoadingId(null);
    if (res.meta.requestStatus === "fulfilled") {
      toast({
        title: "Status Updated",
        description: `Plan is now ${updated.active ? "Active" : "Inactive"}`,
      });
      dispatch(getAllSubscriptionPlans());
    } else {
      toast({
        title: "Update Error",
        description: res.payload || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <AlertDialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-destructive">
              Delete Subscription Tier
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This action cannot be undone. This will permanently delete the subscription plan{" "}
              <strong>{planToDelete?.name}</strong>. Active stores on this plan must be migrated first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePlan}
              className="text-xs h-9 bg-destructive hover:bg-destructive/90 text-white font-bold"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddPlanDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={() => dispatch(getAllSubscriptionPlans())}
      />
      <EditPlanDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        plan={selectedPlan}
        onSuccess={() => {
          setEditDialogOpen(false);
          setSelectedPlan(null);
          dispatch(getAllSubscriptionPlans());
        }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Subscription Plans & Quota Tiers
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure merchant packaging, feature access flags, and billing cycle pricing
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2 text-xs font-bold h-10">
          <Plus className="w-4 h-4" /> Create New Tier
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-base">Configured Subscription Tiers</CardTitle>
              <CardDescription className="text-xs">
                Pricing, feature entitlement flags, and resource limits per merchant
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search plans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="border border-border rounded-2xl bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tier Name</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Branches</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Public Status</TableHead>
                  <TableHead>Feature Entitlements</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground text-xs font-semibold">
                      No subscription plans found.
                    </TableCell>
                  </TableRow>
                )}
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-bold text-foreground">
                      {plan.name}
                    </TableCell>
                    <TableCell className="font-black font-mono text-sm text-foreground">
                      ₹{plan.price?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs uppercase font-mono">
                        {plan.billingCycle}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {plan.maxBranches ?? "Unlimited"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {plan.maxUsers ?? "Unlimited"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {plan.maxProducts ? plan.maxProducts.toLocaleString() : "Unlimited"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!!plan.active}
                          onCheckedChange={() => handleStatusToggle(plan)}
                          disabled={statusLoadingId === plan.id}
                        />
                        <Badge variant={plan.active ? "active" : "secondary"}>
                          {plan.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {getFeatureBadges(plan)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setEditDialogOpen(true);
                          }}
                          title="Edit plan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                          onClick={() => setPlanToDelete(plan)}
                          title="Delete plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {error && <div className="text-destructive text-xs font-semibold">{error}</div>}
    </div>
  );
}
