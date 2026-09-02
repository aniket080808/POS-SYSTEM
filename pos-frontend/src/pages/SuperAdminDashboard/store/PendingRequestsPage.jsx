import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Check, XCircle, Clock, ShieldCheck, FileText, Store, Loader2 } from "lucide-react";
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
        Promise.all([
          dispatch(fetchApprovalRequests({ type: activeTab, status: statusFilter === "ALL" ? undefined : statusFilter })),
          dispatch(fetchPendingRequestCounts()),
        ]);
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
        Promise.all([
          dispatch(fetchApprovalRequests({ type: activeTab, status: statusFilter === "ALL" ? undefined : statusFilter })),
          dispatch(fetchPendingRequestCounts()),
        ]);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Tenant & Subscription Approval Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and moderate store registration and plan subscription upgrade requests
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="warning" className="flex items-center gap-1.5 px-3 py-1 text-xs">
            <Store className="w-3.5 h-3.5 text-[#B8860B]" />
            {pendingCounts?.registrationPending || 0} Registrations Pending
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 text-xs">
            <FileText className="w-3.5 h-3.5" />
            {pendingCounts?.subscriptionPending || 0} Plan Upgrades Pending
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
          <TabsList className="bg-secondary p-1 rounded-xl">
            <TabsTrigger value="STORE_REGISTRATION" className="flex items-center gap-2 text-xs font-bold">
              <Store className="w-4 h-4" />
              Store Registrations ({pendingCounts?.registrationPending || 0})
            </TabsTrigger>
            <TabsTrigger value="SUBSCRIPTION_CHANGE" className="flex items-center gap-2 text-xs font-bold">
              <FileText className="w-4 h-4" />
              Subscription Requests ({pendingCounts?.subscriptionPending || 0})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-semibold mr-1">Status:</span>
            {["PENDING", "APPROVED", "REJECTED", "ALL"].map((st) => (
              <Button
                key={st}
                variant={statusFilter === st ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(st)}
                className="h-8 text-xs font-bold px-2.5"
              >
                {st}
              </Button>
            ))}
          </div>
        </div>

        {/* STORE REGISTRATION TAB */}
        <TabsContent value="STORE_REGISTRATION" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">Store Registration Queue</CardTitle>
              <CardDescription className="text-xs">
                New merchant applications awaiting super admin review and onboarding activation
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="border border-border rounded-2xl bg-card overflow-hidden">
                {loading ? (
                  <div className="text-center py-10 text-xs text-muted-foreground font-semibold">
                    Loading registration requests...
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-xs text-destructive font-semibold">
                    {error}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Store Name</TableHead>
                        <TableHead>Requested By</TableHead>
                        <TableHead>Contact Email</TableHead>
                        <TableHead>Business Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-bold text-foreground">{req.storeName}</TableCell>
                          <TableCell className="text-sm font-medium">{req.requestedBy?.fullName || "Store Admin"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{req.requestedBy?.email || "—"}</TableCell>
                          <TableCell className="text-xs font-semibold">{req.storeType || "—"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                req.status === "APPROVED"
                                  ? "active"
                                  : req.status === "REJECTED"
                                  ? "destructive"
                                  : "warning"
                              }
                            >
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {formatDateTime(req.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            {req.status === "PENDING" ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReject(req)}
                                  className="text-destructive hover:bg-destructive/10 text-xs font-bold h-8"
                                  disabled={updatingId === req.id}
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(req)}
                                  className="text-xs font-bold h-8 gap-1.5"
                                  disabled={updatingId === req.id}
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground font-mono">Completed</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {filteredRequests.length === 0 && !loading && (
                <div className="text-center py-10 text-xs text-muted-foreground font-semibold">
                  No registration requests in this view.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUBSCRIPTION REQUESTS TAB */}
        <TabsContent value="SUBSCRIPTION_CHANGE" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">Subscription Plan Upgrades & Change Requests</CardTitle>
              <CardDescription className="text-xs">
                Merchant tier changes requiring confirmation and billing activation
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="border border-border rounded-2xl bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store Name</TableHead>
                      <TableHead>Requested Tier</TableHead>
                      <TableHead>Current Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-bold text-foreground">{req.storeName || req.store?.brand}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">{req.targetPlanName || req.plan?.name || "Upgrade Plan"}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{req.currentPlanName || "Standard"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              req.status === "APPROVED"
                                ? "active"
                                : req.status === "REJECTED"
                                ? "destructive"
                                : "warning"
                            }
                          >
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {formatDateTime(req.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status === "PENDING" ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(req)}
                                className="text-destructive hover:bg-destructive/10 text-xs font-bold h-8"
                                disabled={updatingId === req.id}
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(req)}
                                className="text-xs font-bold h-8 gap-1.5"
                                disabled={updatingId === req.id}
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground font-mono">Completed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredRequests.length === 0 && !loading && (
                <div className="text-center py-10 text-xs text-muted-foreground font-semibold">
                  No subscription change requests in this view.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Confirm Request Approval</DialogTitle>
            <DialogDescription className="text-xs">
              Approve onboarding / subscription change for{" "}
              <strong>{selectedRequest?.storeName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-xs font-bold text-foreground">
              Internal Admin Notes (Optional)
            </label>
            <Textarea
              placeholder="e.g., Verified GST document and business credentials."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="text-xs bg-card"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalDialogOpen(false)}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={updatingId !== null}
              className="text-xs font-bold h-9 gap-1.5"
            >
              {updatingId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive">Reject Request</DialogTitle>
            <DialogDescription className="text-xs">
              Provide a clear reason for rejecting the request for{" "}
              <strong>{selectedRequest?.storeName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-xs font-bold text-foreground">
              Rejection Reason (Required)
            </label>
            <Textarea
              placeholder="e.g., Incomplete GST verification or duplicate registration."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="text-xs bg-card"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectionDialogOpen(false)}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectionReason.trim() || updatingId !== null}
              className="text-xs font-bold h-9 gap-1.5"
            >
              {updatingId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}