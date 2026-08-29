import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  FileSpreadsheet,
  FileCode,
  Building2,
  ShieldAlert,
  CreditCard,
  History,
} from "lucide-react";
import api from "@/utils/api";

export default function ExportsPage() {
  const { toast } = useToast();
  const [exportingType, setExportingType] = useState(null);

  const handleExport = async (type, format = "csv") => {
    setExportingType(type);
    try {
      let data = [];
      const filename = `${type}_export_${new Date().toISOString().slice(0, 10)}`;

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
          storeName: r.storeName || (r.store ? r.store.brand || r.store.name : "—"),
          requestedBy: r.requestedBy?.fullName || "—",
          contactEmail: r.requestedBy?.email || "—",
          status: r.status,
          submittedAt: r.createdAt,
          resolvedAt: r.resolvedAt || "Pending",
        }));
      } else if (type === "notifications") {
        const res = await api.get("/api/super-admin/notifications");
        const list =
          res.data?.data?.content ||
          (Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
            ? res.data
            : []);
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
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(data, null, 2)
        )}`;
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
          keys
            .map((k) => `"${String(item[k] ?? "").replace(/"/g, '""')}"`)
            .join(",")
        );
        const csvContent =
          "data:text/csv;charset=utf-8," +
          [headerRow, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      toast({
        title: "Export Successful",
        description: `Downloaded ${data.length} records in ${format.toUpperCase()} format.`,
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description:
          err.response?.data?.message || err.message || "Failed to download export.",
        variant: "destructive",
      });
    } finally {
      setExportingType(null);
    }
  };

  const EXPORT_MODULES = [
    {
      id: "stores",
      title: "Store Directory & Merchants",
      description:
        "Complete list of registered stores, owner details, plan tier, and account status.",
      icon: <Building2 className="w-5 h-5 text-primary" />,
      badge: "Stores",
    },
    {
      id: "subscriptions",
      title: "Subscription Plans & Quotas",
      description:
        "All configured subscription tiers, limits (users, branches, products), and pricing.",
      icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
      badge: "Pricing",
    },
    {
      id: "requests",
      title: "Store Approval Requests",
      description:
        "Historical store creation and plan upgrade approval requests and rejection logs.",
      icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,
      badge: "Compliance",
    },
    {
      id: "notifications",
      title: "System Audit & Activity Logs",
      description:
        "Platform security alerts, moderation events, and broadcast notification history.",
      icon: <History className="w-5 h-5 text-primary" />,
      badge: "Audit",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          System Data Exports
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Generate structured CSV and JSON exports for platform analytics, accounting, and compliance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EXPORT_MODULES.map((mod) => (
          <Card
            key={mod.id}
            className="flex flex-col justify-between rounded-2xl border border-border/80 shadow-2xs hover:shadow-xs transition-shadow"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-muted/60 rounded-xl border border-border/60">
                  {mod.icon}
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {mod.badge}
                </Badge>
              </div>
              <CardTitle className="text-base font-bold text-foreground mt-3">
                {mod.title}
              </CardTitle>
              <CardDescription className="text-xs">
                {mod.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                <Button
                  onClick={() => handleExport(mod.id, "csv")}
                  disabled={exportingType !== null}
                  variant="outline"
                  className="flex-1 gap-2 text-xs font-semibold h-10 rounded-xl"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  {exportingType === mod.id ? "Exporting..." : "Export CSV"}
                </Button>
                <Button
                  onClick={() => handleExport(mod.id, "json")}
                  disabled={exportingType !== null}
                  variant="outline"
                  className="flex-1 gap-2 text-xs font-semibold h-10 rounded-xl"
                >
                  <FileCode className="w-4 h-4 text-accent" />
                  {exportingType === mod.id ? "Exporting..." : "Export JSON"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}