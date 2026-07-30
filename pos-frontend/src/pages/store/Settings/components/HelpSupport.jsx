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
      value: "support@possystem.com",
      action: "Send Email",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call our support team",
      value: "+1 (555) 123-4567",
      action: "Call Now",
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Browse our documentation",
      value: "Comprehensive guides and API references",
      action: "View Docs",
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
        {supportItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-sm font-medium mt-1">{item.value}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                {item.action} <ExternalLink className="w-3 h-3" />
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