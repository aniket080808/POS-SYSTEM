import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import {
  ShiftInformationCard,
  SalesSummaryCard,
  PaymentSummaryCard,
  TopSellingItemsCard,
  RecentOrdersCard,
  RefundsCard,
  ShiftHeader,
  LogoutConfirmDialog,
  PrintDialog,
} from "./components";
import { getCurrentShiftProgress, endShift } from "../../../Redux Toolkit/features/shiftReport/shiftReportThunks";
import { logout } from "../../../Redux Toolkit/features/user/userThunks";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

const ShiftSummaryPage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [showLogoutConfirmDialog, setShowLogoutConfirmDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const navigate = useNavigate();

  const { currentShift, loading, error } = useSelector((state) => state.shiftReport);

  useEffect(() => {
    dispatch(getCurrentShiftProgress());
  }, [dispatch]);

  const handlePrintSummary = () => {
    setShowPrintDialog(false);
    toast({
      title: "Spooling Print Job",
      description: "Shift summary dispatched to printer.",
    });
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleEndShift = async () => {
    setShowLogoutConfirmDialog(false);
    try {
      await dispatch(endShift()).unwrap();
      await dispatch(logout()).unwrap();
      navigate("/");
      toast({
        title: "Shift Ended Successfully",
        description: "Your shift report has been archived and till locked.",
      });
    } catch (e) {
      toast({
        title: "Failed to End Shift",
        description: e?.message || e || "Unable to close shift. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <ShiftHeader
        onPrintClick={() => setShowPrintDialog(true)}
        onEndShiftClick={() => setShowLogoutConfirmDialog(true)}
      />

      <div className="flex-1 p-5 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16">
            <Loader2 className="animate-spin h-8 w-8 text-[#B8860B] mb-2" />
            <p className="text-xs font-semibold">Aggregating live shift transactions...</p>
          </div>
        ) : currentShift ? (
          <div className="space-y-5 max-w-7xl mx-auto">
            {/* Top Grid: Shift Info, Sales Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ShiftInformationCard shiftData={currentShift} />
              <SalesSummaryCard shiftData={currentShift} />
            </div>

            {/* Middle Grid: Payments, Velocity Products */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PaymentSummaryCard shiftData={currentShift} />
              <TopSellingItemsCard shiftData={currentShift} />
            </div>

            {/* Bottom Grid: Refunds, Recent Orders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RefundsCard shiftData={currentShift} />
              <RecentOrdersCard shiftData={currentShift} />
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-xs text-muted-foreground font-semibold">
            No active shift ledger available.
          </div>
        )}
      </div>

      <PrintDialog
        isOpen={showPrintDialog}
        onClose={() => setShowPrintDialog(false)}
        onConfirm={handlePrintSummary}
      />

      <LogoutConfirmDialog
        isOpen={showLogoutConfirmDialog}
        onClose={() => setShowLogoutConfirmDialog(false)}
        onConfirm={handleEndShift}
      />
    </div>
  );
};

export default ShiftSummaryPage;