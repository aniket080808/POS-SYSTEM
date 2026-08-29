import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const platformFaqs = [
  {
    q: "How does multi-branch inventory synchronization work?",
    a: "Products are managed under a centralized store catalog. Each branch outlet maintains its own real-time stock counts and can have specific price overrides. When orders are fulfilled at any terminal, branch inventory is deducted instantly.",
  },
  {
    q: "How does the cashier shift tracking operate?",
    a: "When a cashier logs in, their shift is initialized with an opening cash balance. During the shift, all sales, returns, and cash adjustments are logged. At shift end, an automated reconciliation report summarizes cash expected versus actual cash counted.",
  },
  {
    q: "What hardware and scanners are supported?",
    a: "NexPOS is web-standard and works on any modern desktop, laptop, or tablet (iPad/Android). It supports standard USB and Bluetooth barcode/SKU handheld scanners, ESC/POS thermal receipt printers, and cash drawers.",
  },
  {
    q: "How are real-time alerts pushed to the dashboard?",
    a: "NexPOS uses STOMP WebSockets connected to '/topic/activities'. Store Admins and Branch Managers receive instant pop-up notifications when inventory dips below minimum stock thresholds or when refund spikes occur.",
  },
  {
    q: "What formats can I export financial reports in?",
    a: "The system includes native client-side export drivers generating PDF documents (via jsPDF + autoTable) and Excel spreadsheets (via XLSX) for sales summaries, cashier performance metrics, and inventory logs.",
  },
  {
    q: "How are subscription payments and billing managed?",
    a: "Store subscriptions are processed securely through the integrated Razorpay Checkout SDK. Stores with active subscription status maintain full access to all store and branch management features.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-20 bg-background border-b border-border/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-2 mb-4">
            System & Operational Clarifications
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Clear answers about the NexPOS architecture, hardware compatibility, and deployment.
          </p>
        </div>

        <div className="space-y-3">
          {platformFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-card rounded-xl border border-border/80 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-foreground hover:bg-muted/30 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-accent shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-foreground" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/10">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;