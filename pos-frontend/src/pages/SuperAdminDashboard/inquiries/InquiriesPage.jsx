import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  Store,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  MoreHorizontal,
  Loader2,
  RefreshCw,
  MessageSquare,
  Sparkles,
  UserCheck,
  Copy,
  Send,
} from "lucide-react";
import api from "@/utils/api";
import { useToast } from "@/components/ui/use-toast";
import { formatDateTime } from "@/utils/formateDate";

export default function InquiriesPage() {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/super-admin/contact-inquiries");
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setInquiries(list);
    } catch (err) {
      toast({
        title: "Failed to fetch inquiries",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleReplyEmail = (inquiry, clientType = "gmail") => {
    const target = inquiry || selectedInquiry;
    if (!target || !target.email) return;
    const storeText = target.storeName ? ` for ${target.storeName}` : "";
    const subject = `Regarding your NexPOS inquiry${storeText}`;
    const body = `Hi ${target.name || "there"},\n\nThank you for reaching out regarding NexPOS.\n\nWe received your inquiry:\n"${target.message || ""}"\n\nOur team is here to assist you with store setup and counter billing.\n\nBest regards,\nNexPOS Team`;

    if (clientType === "gmail") {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        target.email
      )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, "_blank", "noopener,noreferrer");
    } else {
      const mailtoUrl = `mailto:${target.email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    }
  };

  const handleCopyEmail = (email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    toast({
      title: "Email Copied",
      description: `${email} copied to clipboard!`,
    });
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoadingId(id);
    try {
      await api.patch(`/api/super-admin/contact-inquiries/${id}/status?status=${newStatus}`);
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
      }
      toast({
        title: "Status Updated",
        description: `Inquiry marked as ${newStatus}`,
      });
    } catch (err) {
      toast({
        title: "Error updating status",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this inquiry?")) return;
    setActionLoadingId(id);
    try {
      await api.delete(`/api/super-admin/contact-inquiries/${id}`);
      setInquiries((prev) => prev.filter((item) => item.id !== id));
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(null);
      }
      toast({
        title: "Inquiry Deleted",
        description: "The record has been permanently removed.",
      });
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = inquiries.length;
    const pending = inquiries.filter((i) => (i.status || "PENDING") === "PENDING").length;
    const contacted = inquiries.filter((i) => i.status === "CONTACTED").length;
    const resolved = inquiries.filter((i) => i.status === "RESOLVED").length;
    return { total, pending, contacted, resolved };
  }, [inquiries]);

  // Filtered list
  const filtered = useMemo(() => {
    return inquiries.filter((item) => {
      const currentStatus = item.status || "PENDING";
      const matchesStatus = statusFilter === "ALL" || currentStatus === statusFilter;

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.storeName && item.storeName.toLowerCase().includes(q)) ||
        (item.message && item.message.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [inquiries, statusFilter, searchTerm]);

  const getStatusBadge = (status) => {
    const s = (status || "PENDING").toUpperCase();
    if (s === "RESOLVED") {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Resolved
        </span>
      );
    }
    if (s === "CONTACTED") {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          Contacted
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        New Lead
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-[#B8860B]" />
            Customer Inquiries & Leads
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Inspect incoming landing page inquiries, follow up with store owners, and track onboarding conversions
          </p>
        </div>
        <Button
          onClick={fetchInquiries}
          variant="outline"
          size="sm"
          disabled={loading}
          className="gap-2 text-xs font-bold cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Leads
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-2xs">
          <CardContent className="p-4">
            <div className="text-xs font-bold uppercase text-muted-foreground">Total Inquiries</div>
            <div className="text-2xl font-black font-mono text-foreground mt-1">
              {metrics.total}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Landing page submissions</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-2xs">
          <CardContent className="p-4">
            <div className="text-xs font-bold uppercase text-amber-700 dark:text-amber-400">
              New / Pending
            </div>
            <div className="text-2xl font-black font-mono text-amber-700 dark:text-amber-400 mt-1">
              {metrics.pending}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Requires follow-up</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-2xs">
          <CardContent className="p-4">
            <div className="text-xs font-bold uppercase text-blue-700 dark:text-blue-400">
              Contacted
            </div>
            <div className="text-2xl font-black font-mono text-blue-700 dark:text-blue-400 mt-1">
              {metrics.contacted}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">In communication</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-2xs">
          <CardContent className="p-4">
            <div className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">
              Resolved / Converted
            </div>
            <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1">
              {metrics.resolved}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Onboarded / Closed</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-card border-border shadow-2xs">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, store, or message..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-input bg-background focus:border-primary outline-none"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto">
            {["ALL", "PENDING", "CONTACTED", "RESOLVED"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-[#262422] text-[#FAF8F3] dark:bg-[#F5A623] dark:text-[#1A1816] shadow-2xs"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {status === "ALL" ? "All Inquiries" : status}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inquiries Table */}
      <Card className="bg-card border-border shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40">
                <TableHead className="text-xs font-bold uppercase">Lead Contact</TableHead>
                <TableHead className="text-xs font-bold uppercase">Store / Business</TableHead>
                <TableHead className="text-xs font-bold uppercase">Message Preview</TableHead>
                <TableHead className="text-xs font-bold uppercase">Date Received</TableHead>
                <TableHead className="text-xs font-bold uppercase text-center">Status</TableHead>
                <TableHead className="text-xs font-bold uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#B8860B]" />
                    Loading customer inquiries...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    No inquiries found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="py-3.5">
                      <div className="font-bold text-xs text-foreground">{item.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <button
                          type="button"
                          onClick={() => handleReplyEmail(item, "gmail")}
                          className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer font-mono"
                          title="Click to compose reply in Gmail"
                        >
                          <Mail className="w-3 h-3" />
                          {item.email}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(item.email)}
                          title="Copy email address"
                          className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5">
                      {item.storeName ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                          <Store className="w-3.5 h-3.5 text-[#B8860B]" />
                          {item.storeName}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not specified</span>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 max-w-xs">
                      <p className="text-xs text-foreground truncate cursor-pointer hover:underline" onClick={() => setSelectedInquiry(item)}>
                        {item.message}
                      </p>
                    </TableCell>

                    <TableCell className="py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      {item.createdAt ? formatDateTime(item.createdAt) : "—"}
                    </TableCell>

                    <TableCell className="py-3.5 text-center whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </TableCell>

                    <TableCell className="py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInquiry(item)}
                          className="h-8 text-xs font-semibold px-2.5 cursor-pointer"
                        >
                          Inspect
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 cursor-pointer">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 text-xs font-medium">
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(item.id, "PENDING")}
                              className="cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5 mr-2 text-amber-600" />
                              Mark as New
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(item.id, "CONTACTED")}
                              className="cursor-pointer"
                            >
                              <Mail className="w-3.5 h-3.5 mr-2 text-blue-600" />
                              Mark as Contacted
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(item.id, "RESOLVED")}
                              className="cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                              Mark as Resolved
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(item.id)}
                              className="text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Delete Inquiry
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
          <DialogContent className="sm:max-w-2xl bg-card border-border shadow-xl">
            <DialogHeader className="space-y-1.5 text-left pr-10 pb-2 border-b border-border/60">
              <div className="flex flex-wrap items-center gap-2.5">
                <DialogTitle className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#B8860B]" />
                  Inquiry Message Details
                </DialogTitle>
                {getStatusBadge(selectedInquiry.status)}
              </div>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Submitted on {selectedInquiry.createdAt ? formatDateTime(selectedInquiry.createdAt) : "Recently"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              {/* Lead Information Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-secondary/40 border border-border text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Lead Sender
                  </span>
                  <span className="font-bold text-foreground text-sm mt-0.5 block">
                    {selectedInquiry.name}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Business / Store Chain
                  </span>
                  <span className="font-bold text-foreground text-sm mt-0.5 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-[#B8860B] shrink-0" />
                    {selectedInquiry.storeName || "Not Provided"}
                  </span>
                </div>
                <div className="sm:col-span-2 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Email Address
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block select-all">
                      {selectedInquiry.email}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyEmail(selectedInquiry.email)}
                    className="h-8 text-xs font-semibold gap-1.5 rounded-xl cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Email
                  </Button>
                </div>
              </div>

              {/* Full Message Box */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Full Customer Message
                </label>
                <div className="p-4 rounded-2xl bg-card border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap min-h-[90px] shadow-2xs font-normal">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            {/* Clean, Non-Overflowing Action Footer */}
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/60">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInquiry(null)}
                  className="text-xs h-9 px-4 cursor-pointer"
                >
                  Close
                </Button>
                {selectedInquiry.status !== "RESOLVED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleUpdateStatus(selectedInquiry.id, "RESOLVED");
                      setSelectedInquiry(null);
                    }}
                    className="text-xs font-bold h-9 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Resolved
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleReplyEmail(selectedInquiry, "mailto")}
                  className="text-xs font-semibold h-9 gap-1.5 cursor-pointer"
                  title="Open in default desktop mail application"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Desktop Mail
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleReplyEmail(selectedInquiry, "gmail")}
                  className="text-xs font-bold h-9 gap-1.5 bg-[#B8860B] hover:bg-[#966D09] text-white shadow-xs cursor-pointer"
                  title="Open directly in Gmail web composer"
                >
                  <Mail className="w-4 h-4" />
                  Reply in Gmail
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
