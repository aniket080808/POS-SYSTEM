import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { useToast } from "../../../components/ui/use-toast";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";

const ContactSection = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    storeName: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Validation Error",
        description: "Please fill in your name, email, and message.",
        variant: "destructive",
      });
      return;
    }

    setSubmitted(true);
    toast({
      title: "Inquiry Received",
      description: "Thank you! Our technical specialist will reach out within 24 hours.",
    });
  };

  return (
    <section id="contact" className="py-20 bg-muted/30 border-b border-border/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Direct Contact
            </span>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight mt-2 mb-4 leading-tight">
              Enterprise Deployment & Custom Inquiries
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Need assistance deploying NexPOS across multi-location supermarket chains or configuring custom terminal setups? Speak directly with our engineering team.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 bg-card rounded-xl border border-border/80 shadow-2xs">
                <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent-foreground flex items-center justify-center font-bold shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Support & Inquiries</h4>
                  <p className="text-xs text-muted-foreground">support@nexpos.local</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-card rounded-xl border border-border/80 shadow-2xs">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Deployment SLA</h4>
                  <p className="text-xs text-muted-foreground">Mon – Sat, 9:00 AM – 7:00 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-card rounded-2xl p-7 border border-border shadow-xs">
              {submitted ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Inquiry Submitted</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    We have logged your request and will connect with you via email shortly.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", storeName: "", message: "" });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Aniket Meshram"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="text-sm h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Work Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="aniket@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="text-sm h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Store or Business Name
                    </label>
                    <Input
                      placeholder="Mega Mart Retail"
                      value={formData.storeName}
                      onChange={(e) =>
                        setFormData({ ...formData, storeName: e.target.value })
                      }
                      className="text-sm h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Message / Architecture Requirements <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      placeholder="Describe your store branches, number of terminals, or custom integration needs..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="text-sm min-h-24"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm cursor-pointer shadow-xs"
                  >
                    Submit Inquiries
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;