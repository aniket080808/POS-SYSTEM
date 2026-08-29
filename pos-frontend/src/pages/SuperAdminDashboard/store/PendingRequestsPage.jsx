import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Clock, ShieldCheck, FileText, Store, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchApprovalRequests,
  fetchPendingRequestCounts,
  approveApprovalRequest,
  rejectApprovalRequest,
} from "@/Redux Toolkit/features/approvalRequest/approvalRequestThunks";
import { formatDateTime } from "@/utils/formateDate";

export default function PendingRequestsPage() {
  const dispatch = useDispatch();
  const { requests, pendingCounts, loading, error } = useSelector((state) => state.approvalRequest);
  
  const [activeTab, setActiveTab] = useState("STORE_REGISTRATION");
  const [statusFilter, setStatusFilter] = useState("PENDING");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchApprovalRequests({ type: activeTab, status: statusFilter === "ALL" ? undefined : statusFilter }));
    dispatch(fetchPendingRequestCounts());
  }, [dispatch, activeTab, statusFilter]);

  const handleApprove = (req) => {
    setSelectedRequest(req);
    setAdminNotes("");
    setApprovalDialogOpen(true);
  };

  const handleReject = (req) => {
    setSelectedRequest(req);
    setRejectionReason("");
    setRejectionDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (selectedRequest) {
      setUpdatingId(selectedRequest.id);
      try {
        await dispatch(
          approveApprovalRequest({
            requestId: selectedRequest.id,
            adminNotes: adminNotes.trim() ? adminNotes : null,
          })
        ).unwrap();
        toast({
          title: "Request Approved",
          description: `Approval request for ${selectedRequest.storeName} has been approved.`,
        });
      } catch (e) {
        toast({
          title: "Approval Failed",
          description: e?.message || e || "Failed to approve request.",
          variant: "destructive",
        });
      } finally {
        dispatch(fetchApprovalRequests({ type: activeTab, status: statusFilter === "ALL" ? undefined : statusFilter }));
        dispatch(fetchPendingRequestCounts());
        setApprovalDialogOpen(false);
        setSelectedRequest(null);
        setUpdatingId(null);
      }
    }
  };

  const confirmReject = async () => {
    if (selectedRequest && rejectionReason.trim()) {
      setUpdatingId(selectedRequest.id);
      try {
        await dispatch(
          rejectApprovalRequest({
            requestId: selectedRequest.id,
            reason: rejectionReason.trim(),
          })
        ).unwrap();
        toast({
          title: "Request Rejected",
          description: `Approval request for ${selectedRequest.storeName} has been rejected.`,
        });
      } catch (e) {
        toast({
          title: "Rejection Failed",
          description: e?.message || e || "Failed to reject request.",
          variant: "destructive",
        });
      } finally {
        dispatch(fetchApprovalRequests({ type: activeTab, status: statusFilter === "ALL" ? undefined : statusFilter }));
        dispatch(fetchPendingRequestCounts());
        setRejectionDialogOpen(false);
        setSelectedRequest(null);
        setRejectionReason("");
        setUpdatingId(null);
      }
    }
  };

  const filteredRequests = requests.filter(
    (r) => r.type === activeTab && (statusFilter === "ALL" || r.status === statusFilter)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Tenant Approvals & Verification</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review new store tenant signups and plan modification change requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="warning" className="gap-1.5 px-3 py-1 text-xs rounded-full font-semibold">
            <Store className="w-3.5 h-3.5" />
            <span>{pendingCounts?.registrationPending || 0} Registrations</span>
          </Badge>
          <Badge variant="info" className="gap-1.5 px-3 py-1 text-xs rounded-full font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>{pendingCounts?.subscriptionPending || 0} Subscriptions</span>
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
          <TabsList className="bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="STORE_REGISTRATION" className="rounded-lg text-xs font-semibold gap-2">
              <Store className="w-3.5 h-3.5" />
              <span>Store Registrations ({pendingCounts?.registrationPending || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="SUBSCRIPTION_CHANGE" className="rounded-lg text-xs font-semibold gap-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Subscription Requests ({pendingCounts?.subscriptionPending || 0})</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/60">
            {["PENDING", "APPROVED", "REJECTED", "ALL"].map((st) => (
              <Button
                key={st}
                variant={statusFilter === st ? "default" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(st)}
                className="h-7 text-[11px] font-semibold rounded-lg px-2.5"
              >
                {st}
              </Button>
            ))}
          </div>
        </div>

        {/* STORE REGISTRATION TAB */}
        <TabsContent value="STORE_REGISTRATION" className="space-y-4">
          <Card className="rounded-2xl border-border/80 shadow-2xs">
            <CardContent className="p-0">
              <div className="overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-16 text-xs text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary" />
                    <span>Loading registration requests...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-xs text-destructive">{error}</div>
                ) : (
                  <Table>
                    <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      <TableRow>
                        <TableHead className="py-3">Store Brand</TableHead>
                        <TableHead className="py-3">Owner</TableHead>
                        <TableHead className="py-3">Contact Email</TableHead>
                        <TableHead className="py-3">Store Category</TableHead>
                        <TableHead className="py-3">Status</TableHead>
                        <TableHead className="py-3">Submitted On</TableHead>
                        <TableHead className="py-3 text-right">Moderation Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border/60 text-xs">
                      {filteredRequests.map((req) => (
                        <TableRow key={req.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-semibold text-foreground py-3.5">{req.storeName}</TableCell>
                          <TableCell className="text-foreground">{req.requestedBy?.fullName || "Store Admin"}</TableCell>
                          <TableCell className="text-muted-foreground font-mono text-[11px]">{req.requestedBy?.email || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{req.storeType || "—"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                req.status === "APPROVED"
                                  ? "success"
                                  : req.status === "REJECTED"
                                  ? "destructive"
                                  : "warning"
                              }
                              className="font-semibold text-[10px] rounded-full px-2.5"
                            >
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-[11px]">{formatDateTime(req.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            {req.status === "PENDING" ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApprove(req)}
                                  className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 h-7 rounded-lg text-xs font-semibold"
                                  disabled={updatingId === req.id}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReject(req)}
                                  className="text-destructive border-destructive/30 hover:bg-destructive/10 h-7 rounded-lg text-xs font-semibold"
                                  disabled={updatingId === req.id}
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground font-mono text-[11px]">
                                {req.resolvedAt ? `Resolved ${formatDateTime(req.resolvedAt)}` : "—"}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {filteredRequests.length === 0 && !loading && !error && (
                <div className="text-center py-16 text-xs text-muted-foreground">
                  No registration requests matching status "{statusFilter}".
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUBSCRIPTION CHANGE TAB */}
        <TabsContent value="SUBSCRIPTION_CHANGE" className="space-y-4">
          <Card className="rounded-2xl border-border/80 shadow-2xs">
            <CardContent className="p-0">
              <div className="overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-16 text-xs text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary" />
                    <span>Loading subscription requests...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-xs text-destructive">{error}</div>
                ) : (
                  <Table>
                    <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      <TableRow>
                        <TableHead className="py-3">Store Brand</TableHead>
                        <TableHead className="py-3">Action</TableHead>
                        <TableHead className="py-3">Current Plan</TableHead>
                        <TableHead className="py-3">Requested Plan</TableHead>
                        <TableHead className="py-3">Payment Reference</TableHead>
                        <TableHead className="py-3">Status</TableHead>
                        <TableHead className="py-3">Submitted On</TableHead>
                        <TableHead className="py-3 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border/60 text-xs">
                      {filteredRequests.map((req) => (
                        <TableRow key={req.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-semibold text-foreground py-3.5">{req.storeName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[10px] font-semibold">{req.subscriptionAction || "NEW"}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{req.currentPlanName || "None"}</TableCell>
                          <TableCell className="font-semibold text-primary">
                            {req.requestedPlanName} (₹{req.requestedPlanPrice})
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-muted-foreground">{req.paymentReference || "—"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                req.status === "APPROVED"
                                  ? "success"
                                  : req.status === "REJECTED"
                                  ? "destructive"
                                  : "warning"
                              }
                              className="font-semibold text-[10px] rounded-full px-2.5"
                            >
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-[11px]">{formatDateTime(req.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            {req.status === "PENDING" ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApprove(req)}
                                  className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 h-7 rounded-lg text-xs font-semibold"
                                  disabled={updatingId === req.id}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReject(req)}
                                  className="text-destructive border-destructive/30 hover:bg-destructive/10 h-7 rounded-lg text-xs font-semibold"
                                  disabled={updatingId === req.id}
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground font-mono text-[11px]">
                                {req.resolvedAt ? `Resolved ${formatDateTime(req.resolvedAt)}` : "—"}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {filteredRequests.length === 0 && !loading && !error && (
                <div className="text-center py-16 text-xs text-muted-foreground">
                  No subscription requests matching status "{statusFilter}".
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* APPROVAL DIALOG */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="rounded-2xl bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">Approve Verification Request</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to approve this request for <strong className="text-foreground">{selectedRequest?.storeName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Textarea
              placeholder="Add optional administrative note..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
              className="text-xs rounded-xl resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setApprovalDialogOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={confirmApprove} className="rounded-xl text-xs font-semibold gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECTION DIALOG */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent className="rounded-2xl bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">Reject Request</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Please provide a reason for rejecting <strong className="text-foreground">{selectedRequest?.storeName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Textarea
              placeholder="Enter specific rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="text-xs rounded-xl resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejectionDialogOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmReject}
              disabled={!rejectionReason.trim()}
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" /> Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}