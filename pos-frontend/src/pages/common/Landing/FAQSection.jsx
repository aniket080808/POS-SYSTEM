import React, { useState, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, Phone, Clock, Search } from "lucide-react";
import siteConfig from "@/config/siteConfig";
import { useScrollReveal } from "@/hooks/useAnimations";

const allFaqs = [
  {
    question: "Can I manage multiple branch stores under one account?",
    answer: "Yes. Store owners can create multiple branch locations, assign branch managers, and track stock across all stores from one central dashboard.",
  },
  {
    question: "How does cashier shift balancing work?",
    answer: "Cashiers enter an opening cash float when starting their shift. As they process sales, the system tracks cash, card, and UPI transactions. At the end of the shift, a summary report compares counted drawer cash against expected totals.",
  },
  {
    question: "How do new stores get started on NexPOS?",
    answer: "Submit your store registration online. Once verified by the system administrator, you can log in, select a plan, add your products, and start billing at checkout counters.",
  },
  {
    question: "Does the checkout counter support barcode scanners?",
    answer: "Yes. NexPOS works with standard USB and wireless barcode scanners for quick product lookups during customer billing.",
  },
  {
    question: "Can cashiers handle item returns and refunds?",
    answer: "Yes. Cashiers and managers can look up previous bills by receipt number, select items being returned, and generate refund slips with recorded audit details.",
  },
  {
    question: "What payment methods are supported?",
    answer: "NexPOS supports Cash, UPI, and split payments. Cashiers can combine multiple payment methods in a single transaction.",
  },
  {
    question: "Is there a limit on number of products?",
    answer: "Product limits depend on your subscription plan. Starter plans support up to 500 products, Business plans support up to 5,000, and Enterprise plans offer unlimited products.",
  },
  {
    question: "Can I export sales reports?",
    answer: "Yes. Store admins and branch managers can export detailed sales, inventory, and shift reports as downloadable files from the dashboard.",
  },
];

const FAQSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { ref: sectionRef, isVisible } = useScrollReveal();

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return allFaqs;
    const q = searchQuery.toLowerCase();
    return allFaqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <section id="faq" className="py-20 bg-background border-t border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={sectionRef}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-secondary text-foreground border border-border mb-3">
            Questions & Answers
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Common questions about setting up stores, managing staff, and daily billing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* FAQs List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-input bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs divide-y divide-border/60">
              {filteredFaqs.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No questions match "<strong>{searchQuery}</strong>". Try a different search term.
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/60 last:border-b-0">
                      <AccordionTrigger className="px-6 py-4 text-left text-sm font-bold text-foreground hover:no-underline hover:bg-secondary/40 transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </div>

          {/* Support Sidebar connected to siteConfig */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-xs space-y-4">
              <h3 className="text-base font-bold text-foreground">Need Help Getting Started?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Contact our support team for help with store setup, product imports, or cashier training.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/60 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-card border border-border shrink-0 text-[#B8860B]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Support Phone</h4>
                    <p className="text-xs font-mono font-bold text-foreground mt-0.5">{siteConfig.contact.phone}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/60 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-card border border-border shrink-0 text-foreground">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Email Inquiries</h4>
                    <p className="text-xs font-mono font-bold text-foreground mt-0.5">{siteConfig.contact.email}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/60 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-card border border-border shrink-0 text-[#785600]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Working Hours</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{siteConfig.contact.hours}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;