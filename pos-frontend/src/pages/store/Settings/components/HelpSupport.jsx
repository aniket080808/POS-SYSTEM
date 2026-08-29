import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle, Mail, Phone, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const HelpSupportForm = () => {
  const supportItems = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email",
      value: "aniketmeshram455@gmail.com",
      action: "Send Email",
      link: "mailto:aniketmeshram455@gmail.com",
      isExternal: false,
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call our support team",
      value: "+91 70281 43749",
      action: "Call Now",
      link: "tel:+917028143749",
      isExternal: false,
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Browse our documentation",
      value: "Official Repository & Documentation",
      action: "View Docs",
      link: "https://github.com/aniket080808/POS-SYSTEM",
      isExternal: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Help & Support
        </CardTitle>
        <CardDescription>
          Get assistance with your store settings and account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {supportItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start justify-between p-4 border rounded-lg flex-wrap gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-sm font-medium mt-1 select-all">{item.value}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={item.link}
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-1"
                >
                  {item.action} <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            </div>
          );
        })}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Frequently Asked Questions</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• How do I update my store information? — Go to the Store tab in Settings.</li>
            <li>• How do I change my currency? — Update the Currency field in Store Settings.</li>
            <li>• How do I manage payment methods? — Use the Payments tab to enable/disable methods.</li>
            <li>• How do I configure notifications? — Use the Notifications tab to toggle alerts.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default HelpSupportForm;