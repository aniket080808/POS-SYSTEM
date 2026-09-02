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
  DollarSign,
  TrendingUp,
  Percent,
  Store,
  Search,
  Download,
} from "lucide-react";
import { getAllStores } from "@/Redux Toolkit/features/store/storeThunks";
import { getAllSubscriptionPlans } from "@/Redux Toolkit/features/subscriptionPlan/subscriptionPlanThunks";
import api from "@/utils/api";

export default function CommissionsPage() {
  const dispatch = useDispatch();
  const { stores = [], loading: storesLoading } = useSelector((state) => state.store);
  const { plans = [] } = useSelector((state) => state.subscriptionPlan || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [commissionRate, setCommissionRate] = useState(10);
  const [storeSubs, setStoreSubs] = useState({});
  const [subsLoading, setSubsLoading] = useState(false);

  useEffect(() => {
    dispatch(getAllStores());
    dispatch(getAllSubscriptionPlans());
  }, [dispatch]);

  useEffect(() => {
    if (stores && stores.length > 0) {
      setSubsLoading(true);
      Promise.all(
        stores.map((s) =>
          api
            .get(`/api/stores/${s.id}/subscription`)
            .then((res) => ({ id: s.id, sub: res.data }))
            .catch(() => ({ id: s.id, sub: null }))
        )
      )
        .then((results) => {
          const map = {};
          results.forEach((r) => {
            map[r.id] = r.sub;
          });
          setStoreSubs(map);
        })
        .finally(() => setSubsLoading(false));
    }
  }, [stores]);

  const activeStores = useMemo(() => {
    return (stores || []).filter((s) => (s.status || "").toUpperCase() === "ACTIVE");
  }, [stores]);

  const commissionData = useMemo(() => {
    return (stores || []).map((store) => {
      const sub = storeSubs[store.id];
      const hasActiveSub = sub && (sub.subscriptionStatus === "ACTIVE" || sub.status === "ACTIVE") && sub.planPrice;
      const planPrice = hasActiveSub ? Number(sub.planPrice) : 0;
      const calculatedCommission = Math.round(planPrice * (commissionRate / 100));
      return {
        id: store.id,
        storeName: store.brand || store.brandName || store.name || `Store #${store.id}`,
        ownerName: store.storeAdmin?.fullName || "Store Owner",
        email: store.storeAdmin?.email || store.contact?.email || "—",
        planName: hasActiveSub ? sub.planName : (sub?.planName ? `${sub.planName} (${sub.subscriptionStatus || "Inactive"})` : "No Active Plan"),
        planPrice: planPrice,
        commissionRate: commissionRate,
        commissionAmount: calculatedCommission,
        status: (store.status || "ACTIVE").toUpperCase(),
      };
    });
  }, [stores, commissionRate, storeSubs]);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Platform Commissions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track subscription revenue sharing and platform fee distributions
          </p>
        </div>
        <Button onClick={handleExportCSV} className="gap-2 text-xs font-bold h-10">
          <Download className="w-4 h-4" /> Export CSV Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Gross Revenue</p>
              <h3 className="text-2xl font-black mt-1 text-foreground font-mono">₹{totalGrossRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-secondary border border-border rounded-xl text-foreground shadow-2xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Commission Share</p>
              <h3 className="text-2xl font-black mt-1 text-foreground font-mono">₹{totalCommissions.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-[#FDF6E2] border border-[#EED896] rounded-xl text-[#B8860B] shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Platform Fee Rate</p>
              <h3 className="text-2xl font-black mt-1 text-foreground font-mono">{commissionRate}%</h3>
            </div>
            <div className="p-2.5 bg-secondary border border-border rounded-xl text-foreground shadow-2xs">
              <Percent className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Stores</p>
              <h3 className="text-2xl font-black mt-1 text-foreground font-mono">{activeStores.length} / {stores.length}</h3>
            </div>
            <div className="p-2.5 bg-[#FDF6E2] border border-[#EED896] rounded-xl text-[#B8860B] shadow-2xs">
              <Store className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader className="pb-4 border-b border-border/60">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Subscription Commission Breakdown</CardTitle>
              <CardDescription className="text-xs">
                Real-time commission calculation across all enrolled merchant stores
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search store, owner, plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Owner & Contact</TableHead>
                <TableHead>Subscription Plan</TableHead>
                <TableHead>Gross Fee</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Net Commission</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-bold text-foreground">{row.storeName}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{row.ownerName}</p>
                        <p className="text-xs text-muted-foreground">{row.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">{row.planName}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">₹{row.planPrice.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{row.commissionRate}%</TableCell>
                    <TableCell className="font-bold text-foreground font-mono text-sm">₹{row.commissionAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === "ACTIVE" ? "active" : "secondary"}>
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                    No store commission records found matching search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}