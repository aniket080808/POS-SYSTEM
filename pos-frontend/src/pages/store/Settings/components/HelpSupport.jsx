import React from "react";
import { HelpCircle, Mail, Phone, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const HelpSupportForm = () => {
  const supportItems = [
    {
      icon: Mail,
      title: "Email Support Hotline",
      description: "Direct assistance from the NexPOS operations engineering team",
      value: "aniketmeshram455@gmail.com",
      action: "Send Email",
      link: "mailto:aniketmeshram455@gmail.com",
      isExternal: false,
    },
    {
      icon: Phone,
      title: "Direct Phone Support",
      description: "Live merchant technical help and payment terminal setup",
      value: "+91 70281 43749",
      action: "Call Desk",
      link: "tel:+917028143749",
      isExternal: false,
    },
    {
      icon: FileText,
      title: "Documentation & Codebase",
      description: "Browse guides, release notes, and developer APIs",
      value: "Official NexPOS Repository",
      action: "Open Repository",
      link: "https://github.com/aniket080808/POS-SYSTEM",
      isExternal: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Merchant Support Channels</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Contact support engineers for hardware integrations, terminal onboarding, or account recovery.
        </p>

        <div className="space-y-3">
          {supportItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center justify-between p-3.5 border border-border/60 rounded-2xl bg-muted/20 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-card border border-border/40 rounded-xl shrink-0 text-primary">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                    <p className="text-xs font-mono font-bold text-foreground mt-1 select-all">{item.value}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="rounded-xl text-xs font-semibold h-8 shrink-0">
                  <a
                    href={item.link}
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-1.5"
                  >
                    <span>{item.action}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-5 p-4 bg-muted/30 border border-border/40 rounded-2xl">
          <h4 className="text-xs font-bold text-foreground mb-2">Frequently Answered Guidelines</h4>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>• <strong>Store Profile:</strong> Update brand name, GSTIN, PAN, and address in the Store tab.</li>
            <li>• <strong>Terminal Tender:</strong> Enable or disable Cash, UPI, and Card checkout on the Payments tab.</li>
            <li>• <strong>Security Inactivity:</strong> Adjust session logout duration on the Security tab.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportForm;