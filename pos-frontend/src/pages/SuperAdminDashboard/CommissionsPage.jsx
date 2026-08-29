import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
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
  const { stores = [] } = useSelector((state) => state.store);
  const { plans = [] } = useSelector((state) => state.subscriptionPlan || {});

  const [searchTerm, setSearchTerm] = useState("");
  const commissionRate = 10; // Default 10% platform commission

  useEffect(() => {
    dispatch(getAllStores());
    dispatch(getAllSubscriptionPlans());
  }, [dispatch]);

  const activeStores = useMemo(() => {
    return (stores || []).filter((s) => (s.status || "").toUpperCase() === "ACTIVE");
  }, [stores]);

  const commissionData = useMemo(() => {
    return (stores || []).map((store) => {
      const planPrice =
        store.subscription?.currentPlan?.price ||
        store.subscriptionPlan?.price ||
        (plans && plans.length > 0 ? plans[0].price : 0);
      const calculatedCommission = Math.round(planPrice * (commissionRate / 100));
      return {
        id: store.id,
        storeName: store.brand || store.brandName || store.name || `Store #${store.id}`,
        ownerName: store.storeAdmin?.fullName || "Store Owner",
        email: store.storeAdmin?.email || store.contact?.email || "—",
        planName:
          store.subscription?.currentPlan?.name ||
          store.subscriptionPlan?.name ||
          "Standard",
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
    const headers = [
      "Store ID",
      "Store Name",
      "Owner",
      "Email",
      "Plan",
      "Gross Price (INR)",
      "Commission Rate (%)",
      "Commission (INR)",
      "Status",
    ];
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

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `commissions_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Platform Commissions
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Subscription revenue sharing metrics and merchant commission schedules
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-10 px-4 rounded-xl shadow-xs"
        >
          <Download className="w-4 h-4" /> Export CSV Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-border/80 shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total Gross Subscriptions
              </p>
              <h3 className="text-2xl font-extrabold mt-1 text-foreground font-mono">
                ₹{totalGrossRevenue.toLocaleString("en-IN")}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total Platform Commission
              </p>
              <h3 className="text-2xl font-extrabold mt-1 text-accent font-mono">
                ₹{totalCommissions.toLocaleString("en-IN")}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Default Platform Rate
              </p>
              <h3 className="text-2xl font-extrabold mt-1 text-foreground font-mono">
                {commissionRate}%
              </h3>
            </div>
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl font-bold">
              <Percent className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Active Contributing Stores
              </p>
              <h3 className="text-2xl font-extrabold mt-1 text-foreground font-mono">
                {activeStores.length} / {stores.length}
              </h3>
            </div>
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl font-bold">
              <Store className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="rounded-2xl border border-border/80 shadow-2xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Store Subscription Commission Breakdown
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time commission calculation across all enrolled merchant stores
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search store, owner, plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/80 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Store</TableHead>
                  <TableHead className="text-xs font-bold">Owner</TableHead>
                  <TableHead className="text-xs font-bold">Subscription Plan</TableHead>
                  <TableHead className="text-xs font-bold">Gross Fee</TableHead>
                  <TableHead className="text-xs font-bold">Platform Rate</TableHead>
                  <TableHead className="text-xs font-bold">Net Commission</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/30">
                      <TableCell className="font-bold text-xs text-foreground">
                        {row.storeName}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            {row.ownerName}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {row.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {row.planName}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        ₹{row.planPrice.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {row.commissionRate}%
                      </TableCell>
                      <TableCell className="font-bold text-emerald-600 font-mono text-xs">
                        ₹{row.commissionAmount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={row.status === "ACTIVE" ? "default" : "secondary"}
                          className="text-[11px]"
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                      No store commission records found matching your search.
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