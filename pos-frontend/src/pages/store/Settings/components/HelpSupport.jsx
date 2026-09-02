import React from "react";
import { HelpCircle, Mail, Phone, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const HelpSupportForm = () => {
  const supportItems = [
    {
      icon: Mail,
      title: "Email Support Helpdesk",
      description: "Get technical support for cash drawers, thermal printers, and cloud sync",
      value: "aniketmeshram455@gmail.com",
      action: "Send Email",
      link: "mailto:aniketmeshram455@gmail.com",
      isExternal: false,
    },
    {
      icon: Phone,
      title: "Direct Phone Helpline",
      description: "Speak directly with our technical support team",
      value: "+91 70281 43749",
      action: "Call Helpline",
      link: "tel:+917028143749",
      isExternal: false,
    },
    {
      icon: FileText,
      title: "Platform Repository & Manuals",
      description: "Browse hardware guides, POS API docs, and release notes",
      value: "Official Repository & Documentation",
      action: "Open Docs",
      link: "https://github.com/aniket080808/POS-SYSTEM",
      isExternal: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {supportItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start justify-between p-4 rounded-2xl border border-border/60 bg-secondary/30 flex-wrap gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-secondary border border-border rounded-xl shrink-0">
                  <Icon className="w-5 h-5 text-[#B8860B]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                  <p className="text-xs font-mono font-bold text-foreground mt-1 select-all">{item.value}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="text-xs font-bold h-9">
                <a
                  href={item.link}
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-1.5"
                >
                  {item.action} <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Frequently Asked Questions</h4>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li>• <strong>Updating Business Info:</strong> Navigate to the Store Info tab to update brand, email, or tax GST credentials.</li>
          <li>• <strong>Configuring Checkout UPI:</strong> Enter your Merchant UPI VPA under the Payments tab to enable dynamic checkout QR codes.</li>
          <li>• <strong>Staff Password Policies:</strong> Set terminal inactivity timeouts under the Security tab.</li>
        </ul>
      </div>
    </div>
  );
};

export default HelpSupportForm;