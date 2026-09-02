import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  Printer,
  Receipt,
  CreditCard,
  Percent,
  Save,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getBranchById } from "@/Redux Toolkit/features/branch/branchThunks";
import BranchInfo from "./BranchInfo";
import { useToast } from "@/components/ui/use-toast";
import api from "@/utils/api";

const Settings = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const activeBranchId = branch?.id || userProfile?.branchId || userProfile?.branch?.id;

  const [saving, setSaving] = useState(false);

  const [printerSettings, setPrinterSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("pos_branch_printer_settings");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      printerName: "Epson TM-T88VI",
      paperSize: "80mm",
      printLogo: true,
      printCustomerDetails: true,
      printItemizedTax: true,
      footerText: "Thank you for shopping with us!",
    };
  });

  const [taxSettings, setTaxSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("pos_branch_tax_settings");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      gstEnabled: true,
      gstPercentage: 18,
      applyGstToAll: true,
      showTaxBreakdown: true,
    };
  });

  const [paymentSettings, setPaymentSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("pos_branch_payment_settings");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      acceptCash: true,
      acceptUPI: true,
      acceptCard: true,
      upiId: "example@upi",
      cardTerminalId: "TERM12345",
    };
  });

  const [discountSettings, setDiscountSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("pos_branch_discount_settings");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      allowDiscount: true,
      maxDiscountPercentage: 10,
      requireManagerApproval: true,
      discountReasons: [
        "Damaged Product",
        "Bulk Purchase",
        "Regular Customer",
        "Promotional Offer",
      ],
    };
  });

  useEffect(() => {
    if (activeBranchId && localStorage.getItem("jwt")) {
      dispatch(
        getBranchById({
          id: activeBranchId,
          jwt: localStorage.getItem("jwt"),
        })
      );

      api.get(`/api/branches/${activeBranchId}/settings`)
        .then((res) => {
          if (res.data) {
            if (res.data.printerSettings) {
              try { setPrinterSettings(JSON.parse(res.data.printerSettings)); } catch {}
            }
            if (res.data.taxSettings) {
              try { setTaxSettings(JSON.parse(res.data.taxSettings)); } catch {}
            }
            if (res.data.paymentSettings) {
              try { setPaymentSettings(JSON.parse(res.data.paymentSettings)); } catch {}
            }
            if (res.data.discountSettings) {
              try { setDiscountSettings(JSON.parse(res.data.discountSettings)); } catch {}
            }
          }
        })
        .catch(() => {});
    }
  }, [dispatch, activeBranchId]);

  const handleSaveSettings = async (settingType) => {
    setSaving(true);
    try {
      if (settingType === "printer") {
        localStorage.setItem("pos_branch_printer_settings", JSON.stringify(printerSettings));
      } else if (settingType === "tax") {
        localStorage.setItem("pos_branch_tax_settings", JSON.stringify(taxSettings));
      } else if (settingType === "payment") {
        localStorage.setItem("pos_branch_payment_settings", JSON.stringify(paymentSettings));
      } else if (settingType === "discount") {
        localStorage.setItem("pos_branch_discount_settings", JSON.stringify(discountSettings));
      }

      if (activeBranchId) {
        await api.put(`/api/branches/${activeBranchId}/settings`, {
          printerSettings: JSON.stringify(printerSettings),
          taxSettings: JSON.stringify(taxSettings),
          paymentSettings: JSON.stringify(paymentSettings),
          discountSettings: JSON.stringify(discountSettings),
        });
      }

      toast({
        title: "Settings Saved",
        description: `${settingType.charAt(0).toUpperCase() + settingType.slice(1)} configurations updated successfully.`,
      });
    } catch (e) {
      toast({
        title: "Settings Saved Locally",
        description: `${settingType.charAt(0).toUpperCase() + settingType.slice(1)} configurations cached in local storage.`,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Branch Workstation Preferences
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure thermal receipt templates, GST parameters, terminal tenders, and cashier discounts
        </p>
      </div>

      <Tabs defaultValue="branch-info" className="space-y-6">
        <TabsList className="bg-secondary/60 p-1 rounded-2xl border border-border grid w-full grid-cols-5">
          <TabsTrigger value="branch-info" className="text-xs font-semibold rounded-xl gap-1.5 data-[state=active]:bg-card">
            <Building className="h-3.5 w-3.5" /> Station Info
          </TabsTrigger>
          <TabsTrigger value="printer" className="text-xs font-semibold rounded-xl gap-1.5 data-[state=active]:bg-card">
            <Printer className="h-3.5 w-3.5" /> Thermal Printer
          </TabsTrigger>
          <TabsTrigger value="tax" className="text-xs font-semibold rounded-xl gap-1.5 data-[state=active]:bg-card">
            <Receipt className="h-3.5 w-3.5" /> GST & Taxes
          </TabsTrigger>
          <TabsTrigger value="payment" className="text-xs font-semibold rounded-xl gap-1.5 data-[state=active]:bg-card">
            <CreditCard className="h-3.5 w-3.5" /> Tender Tills
          </TabsTrigger>
          <TabsTrigger value="discount" className="text-xs font-semibold rounded-xl gap-1.5 data-[state=active]:bg-card">
            <Percent className="h-3.5 w-3.5" /> POS Discounts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branch-info">
          <BranchInfo />
        </TabsContent>

        {/* Printer Settings */}
        <TabsContent value="printer">
          <Card className="border-border shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">Thermal Receipt Printer Configuration</CardTitle>
              <CardDescription className="text-xs">
                ESC/POS ESC-P hardware drivers, paper widths, and receipt footer policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">
                    Assigned Thermal Hardware Model
                  </label>
                  <Input
                    value={printerSettings.printerName}
                    onChange={(e) => setPrinterSettings({ ...printerSettings, printerName: e.target.value })}
                    className="text-xs h-10"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">
                    Roll Paper Width Spec
                  </label>
                  <Select
                    value={printerSettings.paperSize}
                    onValueChange={(val) => setPrinterSettings({ ...printerSettings, paperSize: val })}
                  >
                    <SelectTrigger className="text-xs h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="80mm">80mm (Standard POS Receipt)</SelectItem>
                      <SelectItem value="58mm">58mm (Compact Mobile Roll)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">
                  Receipt Footer Policy
                </label>
                <Input
                  value={printerSettings.footerText}
                  onChange={(e) => setPrinterSettings({ ...printerSettings, footerText: e.target.value })}
                  className="text-xs h-10"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">Print Brand Header Logo</span>
                    <span className="text-[11px] text-muted-foreground block">Embed grayscale store logo on top of paper roll</span>
                  </div>
                  <Switch
                    checked={printerSettings.printLogo}
                    onCheckedChange={(val) => setPrinterSettings({ ...printerSettings, printLogo: val })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">Customer Phone & Name Header</span>
                    <span className="text-[11px] text-muted-foreground block">Print customer CRM details on receipt</span>
                  </div>
                  <Switch
                    checked={printerSettings.printCustomerDetails}
                    onCheckedChange={(val) => setPrinterSettings({ ...printerSettings, printCustomerDetails: val })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">Itemized CGST / SGST Breakdown</span>
                    <span className="text-[11px] text-muted-foreground block">Print detailed tax breakdown per line item</span>
                  </div>
                  <Switch
                    checked={printerSettings.printItemizedTax}
                    onCheckedChange={(val) => setPrinterSettings({ ...printerSettings, printItemizedTax: val })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-border/60">
                <Button onClick={() => handleSaveSettings("printer")} disabled={saving} className="text-xs font-bold h-10 gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Save Printer Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Settings */}
        <TabsContent value="tax">
          <Card className="border-border shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">GST & Tax Invoicing Rules</CardTitle>
              <CardDescription className="text-xs">Statutory taxation rates and invoicing breakdown flags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground block">Enable GST Computation</span>
                  <span className="text-[11px] text-muted-foreground block">Calculate tax on checkout lines automatically</span>
                </div>
                <Switch
                  checked={taxSettings.gstEnabled}
                  onCheckedChange={(val) => setTaxSettings({ ...taxSettings, gstEnabled: val })}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">
                    Default GST Bracket (%)
                  </label>
                  <Input
                    type="number"
                    value={taxSettings.gstPercentage}
                    onChange={(e) => setTaxSettings({ ...taxSettings, gstPercentage: Number(e.target.value) })}
                    className="text-xs h-10 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-border/60">
                <Button onClick={() => handleSaveSettings("tax")} disabled={saving} className="text-xs font-bold h-10 gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Save Tax Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tenders */}
        <TabsContent value="payment">
          <Card className="border-border shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">Checkout Station Payment Tenders</CardTitle>
              <CardDescription className="text-xs">Payment methods accepted across counter tills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">Accept Cash Currency</span>
                    <span className="text-[11px] text-muted-foreground block">Physical cash till drawer settlements</span>
                  </div>
                  <Switch
                    checked={paymentSettings.acceptCash}
                    onCheckedChange={(val) => setPaymentSettings({ ...paymentSettings, acceptCash: val })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">Accept UPI Dynamic QR</span>
                    <span className="text-[11px] text-muted-foreground block">Instant UPI payment routing to branch VPA</span>
                  </div>
                  <Switch
                    checked={paymentSettings.acceptUPI}
                    onCheckedChange={(val) => setPaymentSettings({ ...paymentSettings, acceptUPI: val })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">Accept Card Terminal POS</span>
                    <span className="text-[11px] text-muted-foreground block">Debit / Credit card swipe & tap transactions</span>
                  </div>
                  <Switch
                    checked={paymentSettings.acceptCard}
                    onCheckedChange={(val) => setPaymentSettings({ ...paymentSettings, acceptCard: val })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">
                    Branch UPI VPA ID
                  </label>
                  <Input
                    value={paymentSettings.upiId}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, upiId: e.target.value })}
                    className="text-xs h-10 font-mono"
                    placeholder="branch@upi"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">
                    EDC Card Terminal Station ID
                  </label>
                  <Input
                    value={paymentSettings.cardTerminalId}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, cardTerminalId: e.target.value })}
                    className="text-xs h-10 font-mono"
                    placeholder="TERM12345"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-border/60">
                <Button onClick={() => handleSaveSettings("payment")} disabled={saving} className="text-xs font-bold h-10 gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Save Payment Tenders
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discounts */}
        <TabsContent value="discount">
          <Card className="border-border shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">Cashier POS Discount Guardrails</CardTitle>
              <CardDescription className="text-xs">Discretionary discount thresholds and approval requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground block">Allow Counter Discounts</span>
                  <span className="text-[11px] text-muted-foreground block">Enable cashier price adjustments during checkout</span>
                </div>
                <Switch
                  checked={discountSettings.allowDiscount}
                  onCheckedChange={(val) => setDiscountSettings({ ...discountSettings, allowDiscount: val })}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">
                    Maximum Discretionary Discount (%)
                  </label>
                  <Input
                    type="number"
                    max={100}
                    min={0}
                    value={discountSettings.maxDiscountPercentage}
                    onChange={(e) => setDiscountSettings({ ...discountSettings, maxDiscountPercentage: Number(e.target.value) })}
                    className="text-xs h-10 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground block">Require Manager PIN for High Discounts</span>
                  <span className="text-[11px] text-muted-foreground block">Prompt manager authorization on discounts exceeding threshold</span>
                </div>
                <Switch
                  checked={discountSettings.requireManagerApproval}
                  onCheckedChange={(val) => setDiscountSettings({ ...discountSettings, requireManagerApproval: val })}
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-border/60">
                <Button onClick={() => handleSaveSettings("discount")} disabled={saving} className="text-xs font-bold h-10 gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Save Discount Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
