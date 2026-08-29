import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Store,
  Search,
  Download,
  IndianRupee,
} from "lucide-react";
import { getAllStores } from "@/Redux Toolkit/features/store/storeThunks";
import { getAllSubscriptionPlans } from "@/Redux Toolkit/features/subscriptionPlan/subscriptionPlanThunks";

export default function CommissionsPage() {
  const dispatch = useDispatch();
  const { stores = [], loading: storesLoading } = useSelector((state) => state.store);
  const { plans = [] } = useSelector((state) => state.subscriptionPlan || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [commissionRate, setCommissionRate] = useState(10); // 10% platform commission

  useEffect(() => {
    dispatch(getAllStores());
    dispatch(getAllSubscriptionPlans());
  }, [dispatch]);

  const activeStores = useMemo(() => {
    return (stores || []).filter((s) => (s.status || "").toUpperCase() === "ACTIVE");
  }, [stores]);

  const commissionData = useMemo(() => {
    return (stores || []).map((store) => {
      const planPrice = store.subscription?.currentPlan?.price || store.subscriptionPlan?.price || (plans && plans.length > 0 ? plans[0].price : 0);
      const calculatedCommission = Math.round(planPrice * (commissionRate / 100));
      return {
        id: store.id,
        storeName: store.brand || store.brandName || store.name || `Store #${store.id}`,
        ownerName: store.storeAdmin?.fullName || "Store Owner",
        email: store.storeAdmin?.email || store.contact?.email || "—",
        planName: store.subscription?.currentPlan?.name || store.subscriptionPlan?.name || "Standard",
        planPrice: planPrice,
        commissionRate: commissionRate,
        commissionAmount: calculatedCommission,
        status: (store.status || "ACTIVE").toUpperCase(),
      };
    });
  }, [stores, commissionRate, plans]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return commissionData;
    const term = searchTerm.toLowerCase();
    return commissionData.filter(
      (item) =>
        item.storeName.toLowerCase().includes(term) ||
        item.ownerName.toLowerCase().includes(term) ||
        item.planName.toLowerCase().includes(term)
    );
  }, [commissionData, searchTerm]);

  const totalGrossRevenue = useMemo(() => {
    return commissionData.reduce((acc, curr) => acc + curr.planPrice, 0);
  }, [commissionData]);

  const totalCommissions = useMemo(() => {
    return commissionData.reduce((acc, curr) => acc + curr.commissionAmount, 0);
  }, [commissionData]);

  const handleExportCSV = () => {
    const headers = ["Store ID", "Store Name", "Owner", "Email", "Plan", "Gross Price (INR)", "Commission Rate (%)", "Commission (INR)", "Status"];
    const rows = filteredData.map((d) => [
      d.id,
      `"${d.storeName}"`,
      `"${d.ownerName}"`,
      `"${d.email}"`,
      `"${d.planName}"`,
      d.planPrice,
      d.commissionRate,
      d.commissionAmount,
      d.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `commissions_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Platform Commissions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track gross subscription billing volume and calculated platform fee shares.
          </p>
        </div>
        <Button onClick={handleExportCSV} className="gap-1.5 rounded-xl text-xs font-semibold h-10 shadow-xs">
          <Download className="w-4 h-4" />
          <span>Export CSV Statement</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gross Billings"
          value={`₹${totalGrossRevenue.toLocaleString()}`}
          icon={IndianRupee}
          description="Total enrolled monthly plan value"
        />
        <StatCard
          title="Net Platform Share"
          value={`₹${totalCommissions.toLocaleString()}`}
          icon={TrendingUp}
          description="Calculated platform commission"
        />
        <StatCard
          title="Platform Take Rate"
          value={`${commissionRate}%`}
          icon={Percent}
          description="Standard merchant platform fee"
        />
        <StatCard
          title="Active Store Accounts"
          value={`${activeStores.length} / ${stores.length}`}
          icon={Store}
          description="Active vs total registered merchants"
        />
      </div>

      {/* Table Section */}
      <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">Store Fee Allocations</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Calculated breakdown across all merchant tenants</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search store, owner, plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 rounded-xl text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                <TableRow>
                  <TableHead className="py-3">Store Name</TableHead>
                  <TableHead className="py-3">Merchant Admin</TableHead>
                  <TableHead className="py-3">Subscription Tier</TableHead>
                  <TableHead className="py-3 font-mono">Gross Rate</TableHead>
                  <TableHead className="py-3 font-mono">Take Rate</TableHead>
                  <TableHead className="py-3 font-mono">Net Commission</TableHead>
                  <TableHead className="py-3">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-semibold text-foreground py-3.5">{row.storeName}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-foreground">{row.ownerName}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">{row.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-[10px]">{row.planName}</Badge>
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-foreground">₹{row.planPrice.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{row.commissionRate}%</TableCell>
                      <TableCell className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{row.commissionAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={row.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px] rounded-full px-2">
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16 text-xs text-muted-foreground">
                      No store commission records found matching search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}