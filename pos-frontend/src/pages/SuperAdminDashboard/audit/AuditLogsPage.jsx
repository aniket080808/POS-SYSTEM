import React, { useState, useEffect } from "react";
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
  ShieldAlert,
  Search,
  RefreshCw,
  Download,
  Filter,
  Clock,
  User,
  Activity,
  FileSpreadsheet,
  Loader2,
  Calendar,
} from "lucide-react";
import api from "@/utils/api";
import { formatDateTime } from "@/utils/formateDate";
import { useToast } from "@/components/ui/use-toast";

function getRelativeTime(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export default function AuditLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedAction, setSelectedAction] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchActions = async () => {
    try {
      const res = await api.get("/api/super-admin/audit-logs/actions");
      const list = res.data?.data || res.data || [];
      setActions(list);
    } catch {
      // Non-critical if fails
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedAction) params.append("action", selectedAction);
      if (debouncedSearch) params.append("search", debouncedSearch);
      params.append("page", currentPage);
      params.append("size", 20);

      const res = await api.get(`/api/super-admin/audit-logs?${params.toString()}`);
      const pageData = res.data?.data || res.data || {};
      setLogs(pageData.content || []);
      setTotalPages(pageData.totalPages || 1);
      setTotalElements(pageData.totalElements || 0);
    } catch (err) {
      toast({
        title: "Failed to fetch audit logs",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [selectedAction, debouncedSearch, currentPage]);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["ID", "Action", "Description", "Entity Type", "Entity ID", "Performed By", "Status", "Timestamp"];
    const rows = logs.map((l) => [
      l.id,
      `"${l.action || ""}"`,
      `"${(l.description || "").replace(/"/g, '""')}"`,
      `"${l.entityType || ""}"`,
      l.entityId || "",
      `"${l.performedBy || ""}"`,
      l.status || "",
      `"${l.createdAt || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexpos_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Generated",
      description: `Downloaded ${logs.length} audit trail records as CSV.`,
    });
  };

  const getActionBadge = (action) => {
    const act = (action || "").toUpperCase();
    if (act.includes("BLOCKED") || act.includes("REJECT") || act.includes("DELETE")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
          {action}
        </span>
      );
    }
    if (act.includes("IMPERSONATION")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          {action}
        </span>
      );
    }
    if (act.includes("REGISTER") || act.includes("APPROV") || act.includes("ACTIVE")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-foreground border border-border">
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-[#B8860B]" />
            System Audit & Activity Trail
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cryptographically timestamped audit trail of administrative actions, merchant moderation, and platform events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchLogs}
            variant="outline"
            size="sm"
            disabled={loading}
            className="text-xs font-bold gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            onClick={handleExportCSV}
            size="sm"
            className="text-xs font-bold gap-1.5 cursor-pointer"
            disabled={logs.length === 0}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="bg-card border-border shadow-2xs">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by action, administrator, or description..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-input bg-background focus:border-primary outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setCurrentPage(0);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-input bg-background font-semibold text-foreground outline-none cursor-pointer"
            >
              <option value="">All Action Types</option>
              {actions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="bg-card border-border shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40">
                <TableHead className="text-xs font-bold uppercase">Action / Event</TableHead>
                <TableHead className="text-xs font-bold uppercase">Audit Details & Description</TableHead>
                <TableHead className="text-xs font-bold uppercase">Entity Scoped</TableHead>
                <TableHead className="text-xs font-bold uppercase">Executed By</TableHead>
                <TableHead className="text-xs font-bold uppercase text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#B8860B]" />
                    Loading audit trail from database...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                    No activity logs found matching the filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="py-3.5 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </TableCell>

                    <TableCell className="py-3.5 text-xs text-foreground max-w-md font-medium leading-relaxed">
                      {log.description}
                    </TableCell>

                    <TableCell className="py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      <span className="font-mono bg-secondary px-2 py-0.5 rounded border border-border/60">
                        {log.entityType} {log.entityId ? `#${log.entityId}` : ""}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 text-xs text-foreground whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <User className="w-3 h-3 text-muted-foreground" />
                        {log.performedBy || "System Automation"}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 text-right whitespace-nowrap">
                      <div className="text-xs font-mono font-bold text-foreground">
                        {getRelativeTime(log.createdAt)}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {log.createdAt ? formatDateTime(log.createdAt) : "—"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Showing page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} total entries)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="h-8 text-xs cursor-pointer"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage + 1 >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-8 text-xs cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
