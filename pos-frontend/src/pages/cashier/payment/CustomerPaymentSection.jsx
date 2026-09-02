import React from "react";
import DiscountSection from "./DiscountSection";
import NoteSection from "./NoteSection";
import CustomerSection from "./CustomerSection";
import PaymentSection from "./PaymentSection";

const CustomerPaymentSection = ({ setShowCustomerDialog, setShowPaymentDialog }) => {
  return (
    <div className="w-64 lg:w-72 xl:w-[24%] shrink-0 flex flex-col bg-card/70 backdrop-blur-xs border-r border-border/80 h-full overflow-hidden">
      {/* Scrollable controls area */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/60">
        {/* Customer Section */}
        <CustomerSection setShowCustomerDialog={setShowCustomerDialog} />

        {/* Discount Section */}
        <DiscountSection />

        {/* Note Section */}
        <NoteSection />
      </div>

      {/* Payment Action Hero Box (Fixed at bottom) */}
      <PaymentSection setShowPaymentDialog={setShowPaymentDialog} />
    </div>
  );
};

export default CustomerPaymentSection;
