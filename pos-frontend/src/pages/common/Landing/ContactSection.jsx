import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, ArrowRight, CheckCircle2, Store } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ContactSection = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    storeName: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast({
      title: "Inquiry Received",
      description: "Our retail onboarding team will contact you within 24 business hours.",
    });
  };

  return (
    <section id="contact" className="py-20 bg-muted/40 border-t border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">
            Enterprise Inquiries
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Connect With Our Retail Team
          </h2>
          <p className="text-base text-muted-foreground">
            Have questions regarding custom hardware setups, multi-store migration, or high-volume discounts?
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          {/* Contact Form Card */}
          <div className="lg:col-span-7 bg-card rounded-2xl p-8 border border-border/80 shadow-sm">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Message Dispatched</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Thank you for reaching out. A NexPOS solutions architect will get back to you shortly.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmitted(false)}
                  className="rounded-xl mt-2"
                >
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Full Name
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Kumar"
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Work Email
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@brand.com"
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Contact Phone
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 00000"
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Store Name
                    </label>
                    <Input
                      value={formData.storeName}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      placeholder="e.g. Metro Mart"
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    How can we help your business?
                  </label>
                  <Textarea
                    required
                    rows="3"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your retail setup, number of branches, or custom requirements..."
                    className="rounded-xl resize-none text-xs"
                  />
                </div>

                <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold gap-2">
                  <span>Send Message</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>

          {/* Contact Details & SLA Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-foreground">NexPOS Direct Channels</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">Email Desk</span>
                    <span className="text-muted-foreground font-mono">support@nexpos.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">Merchant Support</span>
                    <span className="text-muted-foreground font-mono">+91 1800-NEXPOS-00</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">Operational Hours</span>
                    <span className="text-muted-foreground">Mon – Sat: 09:00 AM – 09:00 PM IST</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-sm space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform Guarantee</h4>
              <div className="space-y-2 text-xs text-foreground/90">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Instant sandbox access with test cashier credentials</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Zero lock-in contract & monthly billing options</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Role-gated multi-branch security compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;