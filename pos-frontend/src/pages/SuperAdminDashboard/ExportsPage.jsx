import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Download,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  Building2,
  Users,
  ShieldAlert,
  CreditCard,
  History,
  Loader2,
} from "lucide-react";
import api from "@/utils/api";

export default function ExportsPage() {
  const { toast } = useToast();
  const [exportingType, setExportingType] = useState(null);

  const handleExport = async (type, format = "csv") => {
    setExportingType(`${type}_${format}`);
    try {
      let data = [];
      let filename = `${type}_export_${new Date().toISOString().slice(0, 10)}`;

      if (type === "stores") {
        const res = await api.get("/api/stores");
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        data = list.map((s) => ({
          id: s.id,
          brand: s.brand || s.brandName || "—",
          owner: s.storeAdmin?.fullName || "—",
          email: s.storeAdmin?.email || s.contact?.email || "—",
          phone: s.contact?.phone || "—",
          status: s.status,
          gstNumber: s.gstNumber || "—",
          panNumber: s.panNumber || "—",
          createdAt: s.createdAt,
        }));
      } else if (type === "subscriptions") {
        const res = await api.get("/api/super-admin/subscription-plans");
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        data = list.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          billingCycle: p.billingCycle,
          maxBranches: p.maxBranches ?? "Unlimited",
          maxUsers: p.maxUsers ?? "Unlimited",
          maxProducts: p.maxProducts ?? "Unlimited",
          active: p.active ? "Active" : "Inactive",
        }));
      } else if (type === "requests") {
        const res = await api.get("/api/super-admin/requests");
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        data = list.map((r) => ({
          id: r.id,
          type: r.type || "STORE_REGISTRATION",
          storeName: r.storeName || (r.store ? (r.store.brand || r.store.name) : "—"),
          requestedBy: r.requestedBy?.fullName || "—",
          contactEmail: r.requestedBy?.email || "—",
          status: r.status,
          submittedAt: r.createdAt,
          resolvedAt: r.resolvedAt || "Pending",
        }));
      } else if (type === "notifications") {
        const res = await api.get("/api/super-admin/notifications");
        const list = res.data?.data?.content || (Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
        data = list.map((n) => ({
          id: n.id,
          type: n.type || "ALERT",
          title: n.title || "—",
          message: n.message || "—",
          priority: n.priority || "NORMAL",
          read: (n.read ?? n.isRead) ? "Yes" : "No",
          createdAt: n.createdAt,
        }));
      }

      if (!data || data.length === 0) {
        toast({
          title: "No Data",
          description: `No records found to export for ${type}.`,
        });
        setExportingType(null);
        return;
      }

      if (format === "json") {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", jsonString);
        downloadAnchor.setAttribute("download", `${filename}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      } else {
        // CSV format
        const keys = Object.keys(data[0]);
        const headerRow = keys.join(",");
        const rows = data.map((item) =>
          keys.map((k) => `"${String(item[k] ?? "").replace(/"/g, '""')}"`).join(",")
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headerRow, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      toast({
        title: "Export Complete",
        description: `Exported ${data.length} records in ${format.toUpperCase()} format.`,
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: err.response?.data?.message || err.message || "Failed to download export.",
        variant: "destructive",
      });
    } finally {
      setExportingType(null);
    }
  };

  const EXPORT_MODULES = [
    {
      id: "stores",
      title: "Store Directory & Tenants",
      description: "Complete list of registered stores, owner details, plan tier, and account status.",
      icon: <Building2 className="w-5 h-5 text-primary" />,
      badge: "Stores",
    },
    {
      id: "subscriptions",
      title: "Subscription Plans & Quotas",
      description: "All configured subscription tiers, limits (users, branches, products), and pricing.",
      icon: <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      badge: "Pricing",
    },
    {
      id: "requests",
      title: "Store Approval Requests",
      description: "Historical store creation and plan upgrade approval requests and rejection logs.",
      icon: <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      badge: "Compliance",
    },
    {
      id: "notifications",
      title: "System Audit & Activity Logs",
      description: "Platform security alerts, moderation events, and broadcast notification history.",
      icon: <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      badge: "Audit",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Platform Data Exports</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Generate structured CSV and JSON exports for platform analytics, auditing, and accounting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {EXPORT_MODULES.map((mod) => (
          <Card key={mod.id} className="flex flex-col justify-between rounded-2xl border-border/80 shadow-2xs hover:shadow-xs transition-shadow">
            <CardHeader className="p-5">
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-muted/60 border border-border/60 rounded-xl">{mod.icon}</div>
                <Badge variant="secondary" className="text-[10px] font-semibold">{mod.badge}</Badge>
              </div>
              <CardTitle className="text-base font-bold text-foreground mt-3">{mod.title}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">{mod.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="flex items-center gap-2.5 border-t border-border/60 pt-4">
                <Button
                  onClick={() => handleExport(mod.id, "csv")}
                  disabled={exportingType !== null}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 h-9 rounded-xl text-xs font-semibold"
                >
                  {exportingType === `${mod.id}_csv` ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span>Export CSV</span>
                </Button>
                <Button
                  onClick={() => handleExport(mod.id, "json")}
                  disabled={exportingType !== null}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 h-9 rounded-xl text-xs font-semibold"
                >
                  {exportingType === `${mod.id}_json` ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileCode className="w-3.5 h-3.5 text-primary" />
                  )}
                  <span>Export JSON</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}