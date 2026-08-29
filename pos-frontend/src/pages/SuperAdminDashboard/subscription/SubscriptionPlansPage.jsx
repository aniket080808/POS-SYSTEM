import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getAllSubscriptionPlans,
  deleteSubscriptionPlan,
  updateSubscriptionPlan,
} from "@/Redux Toolkit/features/subscriptionPlan/subscriptionPlanThunks";

import { useToast } from "../../../components/ui/use-toast";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/table";
import AddPlanDialog from "./AddPlanDialog";
import { Switch } from "../../../components/ui/switch";
import EditPlanDialog from "./EditPlanDialog";
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
import { Plus, Search, Edit2, Trash2, Shield, CheckCircle2, Package, Layers, Sparkles, AlertTriangle } from "lucide-react";

const FEATURE_FLAGS = [
  { key: "enableAdvancedReports", legacyKey: "advancedReports", label: "Advanced Reports" },
  { key: "enableInventory", legacyKey: "inventory", label: "Inventory Engine" },
  { key: "enableIntegrations", legacyKey: "integrations", label: "API Integrations" },
  { key: "enableEcommerce", legacyKey: "ecommerce", label: "Online Store" },
  { key: "enableInvoiceBranding", legacyKey: "invoiceBranding", label: "Custom Invoices" },
  { key: "prioritySupport", legacyKey: "prioritySupport", label: "Priority SLA" },
  { key: "enableMultiLocation", legacyKey: "multiLocation", label: "Multi-Branch" },
];

function getFeatureBadges(plan) {
  const activeFlags = FEATURE_FLAGS.filter((f) => plan[f.key] || plan[f.legacyKey]);
  if (activeFlags.length === 0) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {activeFlags.map((f) => (
        <Badge key={f.key} variant="secondary" className="text-[10px] font-medium px-2 py-0.5 rounded-md">
          {f.label}
        </Badge>
      ))}
    </div>
  );
}

const columns = [
  { key: "name", label: "Plan Name" },
  { key: "price", label: "Pricing" },
  { key: "billingCycle", label: "Billing Cycle" },
  { key: "maxBranches", label: "Max Branches" },
  { key: "maxUsers", label: "Max Staff" },
  { key: "maxProducts", label: "Max SKUs" },
  { key: "status", label: "Status" },
  { key: "features", label: "Feature Capabilities" },
  { key: "actions", label: "Actions" },
];

const SubscriptionPlansPage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const { plans, error, loading } = useSelector(
    (state) => state.subscriptionPlan
  );

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
    let filtered = plans || [];
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
        description: `Subscription plan "${planToDelete.name}" was successfully removed.`,
      });
      dispatch(getAllSubscriptionPlans());
    } else {
      toast({
        title: "Deletion Prevented",
        description: res.payload || "Failed to delete plan. Active stores may still be subscribed.",
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
    if (res.meta.requestStatus === 'fulfilled') {
      toast({ title: 'Status Updated', description: `Plan status set to ${updated.active ? 'Active' : 'Inactive'}` });
      dispatch(getAllSubscriptionPlans());
    } else {
      toast({ title: 'Error', description: res.payload || 'Failed to update status', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <AlertDialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
        <AlertDialogContent className="rounded-2xl bg-card border-border sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">Delete Subscription Plan?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This action cannot be undone. This will permanently remove the <strong>{planToDelete?.name}</strong> plan catalog entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePlan} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs font-semibold">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Subscription Tier Plans</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure merchant billing plans, branch and product quotas, and feature flags.
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="rounded-xl text-xs font-semibold gap-1.5 h-10 shadow-xs">
          <Plus className="w-4 h-4" />
          <span>Add New Plan</span>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
          <Input
            placeholder="Search plans by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key} className={`py-3 ${col.key === 'actions' ? 'text-right' : ''}`}>
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {filteredPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-16 text-xs text-muted-foreground">
                      No subscription plans found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlans.map((plan) => (
                    <TableRow key={plan.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-semibold text-foreground py-3.5">
                        {plan.name}
                      </TableCell>
                      <TableCell className="font-mono font-bold text-foreground">
                        ₹{plan.price}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-[11px] uppercase">
                        {plan.billingCycle}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {plan.maxBranches ?? "Unlimited"}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {plan.maxUsers ?? "Unlimited"}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {plan.maxProducts ?? "Unlimited"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={!!plan.active}
                            onCheckedChange={() => handleStatusToggle(plan)}
                            disabled={statusLoadingId === plan.id}
                          />
                          <span className={`text-[11px] font-semibold ${plan.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                            {plan.active ? 'Active' : 'Inactive'}
                          </span>
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
                            onClick={() => {
                              setSelectedPlan(plan);
                              setEditDialogOpen(true);
                            }}
                            className="h-8 w-8 rounded-lg hover:bg-muted"
                            title="Edit Plan"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setPlanToDelete(plan)}
                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            title="Delete Plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {error && <div className="text-destructive text-xs font-semibold">{error}</div>}
    </div>
  );
};

export default SubscriptionPlansPage;

