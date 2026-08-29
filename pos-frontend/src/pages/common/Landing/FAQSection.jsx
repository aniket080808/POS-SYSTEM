import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail, Phone, HelpCircle, ChevronRight, Store } from 'lucide-react';
import { useNavigate } from 'react-router';

const FAQSection = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How does multi-branch inventory sync work in NexPOS?",
      answer: "NexPOS maintains a centralized product master while allowing individual store branches to maintain independent stock counts, reorder alert thresholds, and local staff assignments."
    },
    {
      question: "What hardware is required to run the Cashier Terminal?",
      answer: "NexPOS runs directly in any modern web browser on desktop, touchscreen POS terminals, iPad/Android tablets, and barcode hand-scanners without requiring dedicated proprietary hardware."
    },
    {
      question: "How are cashier shift opening and closing reconciliations audited?",
      answer: "At shift start, the cashier records the opening drawer float. At shift close, the system cross-references all completed cash, card, and UPI sales against actual physical cash counted, immediately logging any discrepancy."
    },
    {
      question: "Can I export reports for accounting and tax filing?",
      answer: "Yes. Store Admins and Branch Managers can generate and download formatted PDF reports and raw Excel (XLSX) spreadsheets for sales, employee rosters, and shift records with a single click."
    },
    {
      question: "How is access controlled between store roles?",
      answer: "NexPOS enforces strict 5-tier role-based access: Super Admins manage stores; Store Admins oversee branding & branches; Branch Managers supervise inventory and staff; and Cashiers are restricted exclusively to sales & return terminals."
    },
    {
      question: "How do return orders and refunds work?",
      answer: "Cashiers can look up previous order IDs or scan receipts to execute line-item or complete returns. Stock quantities automatically increment back into the branch inventory."
    },
  ];

  const supportOptions = [
    {
      icon: <Mail className="w-4 h-4" />,
      title: "Email Support",
      description: "Direct engineering support",
      action: "support@nexpos.com",
      buttonText: "Send Query"
    },
    {
      icon: <Phone className="w-4 h-4" />,
      title: "Priority Helpline",
      description: "Available for Pro & Enterprise",
      action: "+91 1800-NEXPOS-00",
      buttonText: "Call Helpline"
    }
  ];

  return (
    <section id="faq" className="py-20 bg-background border-t border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-muted-foreground">
            Clear answers about the NexPOS retail architecture, terminal hardware, and store administration.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          {/* FAQs Accordion */}
          <div className="lg:col-span-8">
            <div className="bg-card rounded-2xl border border-border/80 shadow-2xs overflow-hidden">
              <Accordion type="single" collapsible className="w-full divide-y divide-border/60">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-none">
                    <AccordionTrigger className="px-6 py-4 text-left hover:no-underline text-sm font-semibold text-foreground hover:text-primary transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
          
          {/* Right Side - Support Cards */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-foreground">Need Technical Assistance?</h3>
              
              <div className="space-y-3">
                {supportOptions.map((option, index) => (
                  <div key={index} className="bg-muted/40 rounded-xl p-4 border border-border/60">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        {option.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-foreground">{option.title}</h4>
                        <p className="text-[11px] text-muted-foreground mb-1">{option.description}</p>
                        <p className="text-xs font-mono font-medium text-foreground">{option.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => {
                  const el = document.getElementById("contact");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                variant="outline"
                className="w-full h-10 rounded-xl text-xs font-semibold mt-2"
              >
                Send Us a Message
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;