import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@/components/ui/use-toast';
import {
  ShiftInformationCard,
  SalesSummaryCard,
  PaymentSummaryCard,
  TopSellingItemsCard,
  RecentOrdersCard,
  RefundsCard,
  ShiftHeader,
  LogoutConfirmDialog,
  PrintDialog
} from './components';
import { getCurrentShiftProgress, endShift } from '../../../Redux Toolkit/features/shiftReport/shiftReportThunks';
import { logout } from '../../../Redux Toolkit/features/user/userThunks';
import { useNavigate } from 'react-router';

const ShiftSummaryPage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [showLogoutConfirmDialog, setShowLogoutConfirmDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const navigate=useNavigate()

  const { currentShift, loading, error } = useSelector((state) => state.shiftReport);

  useEffect(() => {
    dispatch(getCurrentShiftProgress());
  }, [dispatch]);

  const handlePrintSummary = () => {
    setShowPrintDialog(false);
    toast({
      title: 'Printing Shift Summary',
      description: 'Shift summary print dialog opened.',
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
        title: 'Shift Ended',
        description: 'Your shift has ended and you have been logged out successfully.',
      });
    } catch (e) {
      toast({
        title: 'Failed to End Shift',
        description: e?.message || e || 'Unable to close shift. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="print:hidden flex flex-col h-full">
        <ShiftHeader 
          onPrintClick={() => setShowPrintDialog(true)}
          onEndShiftClick={() => setShowLogoutConfirmDialog(true)}
        />
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full text-lg">Loading shift summary...</div>
          ) : error ? (
            <div className="flex justify-center items-center h-full text-destructive">{error}</div>
          ) : currentShift ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <ShiftInformationCard shiftData={currentShift} />
                <SalesSummaryCard shiftData={currentShift} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <PaymentSummaryCard shiftData={currentShift} />
                <TopSellingItemsCard shiftData={currentShift} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RecentOrdersCard shiftData={currentShift} />
                <RefundsCard shiftData={currentShift} />
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-full text-muted-foreground">No shift data available.</div>
          )}
        </div>
      </div>

      <LogoutConfirmDialog 
        isOpen={showLogoutConfirmDialog}
        onClose={() => setShowLogoutConfirmDialog(false)}
        onConfirm={handleEndShift}
      />
      <PrintDialog 
        isOpen={showPrintDialog}
        onClose={() => setShowPrintDialog(false)}
        onConfirm={handlePrintSummary}
      />

      {/* Dedicated Print-Only Slip Layout */}
      {currentShift && (
        <div className="hidden print:block fixed inset-0 bg-white text-black p-6 font-mono text-sm z-50">
          <div className="text-center border-b-2 border-dashed border-black pb-4 mb-4">
            <h1 className="text-xl font-bold uppercase tracking-wider">Shift Summary Report</h1>
            <p className="text-xs mt-1">Branch: {currentShift.branch?.name || "Main Branch"}</p>
            <p className="text-xs">Cashier: {currentShift.cashier?.fullName || "Staff"}</p>
            <p className="text-[11px] mt-1">Printed: {new Date().toLocaleString()}</p>
          </div>

          <div className="space-y-2 border-b-2 border-dashed border-black pb-4 mb-4">
            <div className="flex justify-between">
              <span>Shift Started:</span>
              <span>{currentShift.shiftStart ? new Date(currentShift.shiftStart).toLocaleString() : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span>Shift Ended:</span>
              <span>{currentShift.shiftEnd ? new Date(currentShift.shiftEnd).toLocaleString() : "In Progress"}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total Orders:</span>
              <span>{currentShift.totalOrders || 0}</span>
            </div>
          </div>

          <div className="space-y-2 border-b-2 border-dashed border-black pb-4 mb-4">
            <div className="flex justify-between">
              <span>Gross Sales:</span>
              <span>₹{(currentShift.totalSales || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Refunds Total:</span>
              <span>- ₹{(currentShift.totalRefunds || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-black pt-1">
              <span>Net Sales:</span>
              <span>₹{(currentShift.netSales || 0).toFixed(2)}</span>
            </div>
          </div>

          {currentShift.paymentSummaries && currentShift.paymentSummaries.length > 0 && (
            <div className="space-y-1.5 border-b-2 border-dashed border-black pb-4 mb-4">
              <p className="font-bold text-xs uppercase mb-1">Payment Method Breakdown:</p>
              {currentShift.paymentSummaries.map((p, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span>{p.type || p.paymentMethod || "Payment"}:</span>
                  <span>₹{(p.totalAmount ?? p.amount ?? 0).toFixed(2)} ({p.transactionCount ?? p.orderCount ?? 0} orders)</span>
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-4 text-xs">
            <p>*** END OF SHIFT REPORT ***</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftSummaryPage;