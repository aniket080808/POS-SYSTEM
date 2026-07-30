import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { 
  Store, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  MapPin,
  Building,
  CreditCard,
  X,
  Edit,
  Ban,
  CheckCircle
} from "lucide-react";
import StoreStatusBadge from "./StoreStatusBadge";
import { formatDateTime } from "../../../utils/formateDate";
import { getStoreSubscription } from "../../../Redux Toolkit/features/store/storeThunks";

export default function StoreDetailDrawer({ 
  store, 
  open, 
  onOpenChange, 
  onBlockStore, 
  onActivateStore,
  onEditStore 
}) {
  const dispatch = useDispatch();
  const { storeSubscription } = useSelector((state) => state.store);

  useEffect(() => {
    if (open && store?.id) {
      dispatch(getStoreSubscription(store.id));
    }
  }, [open, store?.id, dispatch]);

  if (!store) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const getSubscriptionStatusBadge = (status) => {
    if (!status) return <Badge variant="secondary">No Plan</Badge>;
    const statusLower = (typeof status === 'string' ? status : status.name || '').toUpperCase();
    switch (statusLower) {
      case 'ACTIVE':
        return <Badge className="bg-green-600 hover:bg-green-600 text-white">Active</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-600 hover:bg-red-600 text-white">Expired</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-600 hover:bg-gray-600 text-white">Cancelled</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white">Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-600 hover:bg-red-600 text-white">Rejected</Badge>;
      case 'NONE':
        return <Badge variant="secondary">No Plan</Badge>;
      default:
        return <Badge variant="secondary">{statusLower}</Badge>;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          
            <div>
              <SheetTitle className="text-xl font-bold">{store.brand}</SheetTitle>
              <SheetDescription>
                Store ID: {store.id}
              </SheetDescription>
            </div>
           
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Section */}
          <div className="flex items-center justify-between">
            <StoreStatusBadge status={store.status} />
            <div className="flex gap-2">
              {store.status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBlockStore?.(store.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Ban className="w-4 h-4 mr-1" />
                  Block
                </Button>
              )}
              {store.status === "blocked" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onActivateStore?.(store.id)}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Activate
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditStore?.(store)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>

          <Separator />

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{store.storeAdmin?.fullName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{store.contact?.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{store.contact?.email}</span>
              </div>
            </CardContent>
          </Card>

          {/* Store Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Store className="w-5 h-5" />
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{store.brand}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{store.contact?.address || "Address not provided"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Registered on {formatDateTime(store.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Business Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Business Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">GST Number</label>
                  <p className="text-sm">{store.gstNumber || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">PAN Number</label>
                  <p className="text-sm">{store.panNumber || "Not provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5" />
                Subscription Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {storeSubscription && storeSubscription.planName ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Plan Name</label>
                      <p className="text-sm font-medium">{storeSubscription.planName}</p>
                    </div>
                    {getSubscriptionStatusBadge(storeSubscription.subscriptionStatus)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                      <p className="text-sm">{formatDate(storeSubscription.startDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Expiry / Renewal Date</label>
                      <p className="text-sm">{formatDate(storeSubscription.endDate)}</p>
                    </div>
                  </div>
                  {storeSubscription.planPrice != null && (
                    <div className="pt-2">
                      <label className="text-sm font-medium text-muted-foreground">Price</label>
                      <p className="text-sm">₹{storeSubscription.planPrice} / {storeSubscription.billingCycle?.toLowerCase()}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Plan Name</label>
                    <p className="text-sm">No active subscription</p>
                  </div>
                  {getSubscriptionStatusBadge(storeSubscription?.subscriptionStatus || 'NONE')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}