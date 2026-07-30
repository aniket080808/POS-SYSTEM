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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, ShieldCheck, FileText, Store } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Approval Requests</h2>
          <p className="text-muted-foreground">
            Review and moderate store registration and plan subscription change requests
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-amber-500" />
            {pendingCounts?.registrationPending || 0} Registration Pending
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            {pendingCounts?.subscriptionPending || 0} Subscription Pending
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <TabsList>
            <TabsTrigger value="STORE_REGISTRATION" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Store Registrations ({pendingCounts?.registrationPending || 0})
            </TabsTrigger>
            <TabsTrigger value="SUBSCRIPTION_CHANGE" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Subscription Requests ({pendingCounts?.subscriptionPending || 0})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium">Status Filter:</span>
            {["PENDING", "APPROVED", "REJECTED", "ALL"].map((st) => (
              <Button
                key={st}
                variant={statusFilter === st ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(st)}
                className="h-8 text-xs"
              >
                {st}
              </Button>
            ))}
          </div>
        </div>

        {/* STORE REGISTRATION TAB CONTENT */}
        <TabsContent value="STORE_REGISTRATION" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Registration Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                {loading ? (
                  <div className="text-center py-8">Loading registration requests...</div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">{error}</div>
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
                          <TableCell className="font-medium">{req.storeName}</TableCell>
                          <TableCell>{req.requestedBy?.fullName || "Store Admin"}</TableCell>
                          <TableCell>{req.requestedBy?.email || "-"}</TableCell>
                          <TableCell>{req.storeType || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                req.status === "APPROVED"
                                  ? "success"
                                  : req.status === "REJECTED"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDateTime(req.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            {req.status === "PENDING" ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApprove(req)}
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  disabled={updatingId === req.id}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReject(req)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  disabled={updatingId === req.id}
                                >
                                  <XCircle className="w-4 h-4 mr-1" /> Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {req.resolvedAt ? `Resolved ${formatDateTime(req.resolvedAt)}` : "-"}
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
                <div className="text-center py-8 text-muted-foreground">
                  No registration requests matching filter "{statusFilter}".
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUBSCRIPTION CHANGE TAB CONTENT */}
        <TabsContent value="SUBSCRIPTION_CHANGE" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Change Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                {loading ? (
                  <div className="text-center py-8">Loading subscription requests...</div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">{error}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Store Name</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Current Plan</TableHead>
                        <TableHead>Requested Plan</TableHead>
                        <TableHead>Payment Ref</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.storeName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{req.subscriptionAction || "NEW"}</Badge>
                          </TableCell>
                          <TableCell>{req.currentPlanName || "None"}</TableCell>
                          <TableCell className="font-semibold text-primary">
                            {req.requestedPlanName} (₹{req.requestedPlanPrice})
                          </TableCell>
                          <TableCell className="font-mono text-xs">{req.paymentReference || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                req.status === "APPROVED"
                                  ? "success"
                                  : req.status === "REJECTED"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDateTime(req.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            {req.status === "PENDING" ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApprove(req)}
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  disabled={updatingId === req.id}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReject(req)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  disabled={updatingId === req.id}
                                >
                                  <XCircle className="w-4 h-4 mr-1" /> Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {req.resolvedAt ? `Resolved ${formatDateTime(req.resolvedAt)}` : "-"}
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
                <div className="text-center py-8 text-muted-foreground">
                  No subscription requests matching filter "{statusFilter}".
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* APPROVAL DIALOG */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this request for <strong>{selectedRequest?.storeName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Textarea
              placeholder="Add optional admin notes..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove} className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="w-4 h-4 mr-2" /> Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECTION DIALOG */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a clear rejection reason for <strong>{selectedRequest?.storeName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmReject}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="w-4 h-4 mr-2" /> Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}