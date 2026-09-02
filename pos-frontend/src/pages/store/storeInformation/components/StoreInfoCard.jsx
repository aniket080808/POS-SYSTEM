import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Edit3, Store } from "lucide-react";
import BasicInformation from "./BasicInformation";
import ContactInformation from "./ContactInformation";
import BusinessDocuments from "./BusinessDocuments";
import { useDateFormatter } from "@/utils/dateUtils";

const StoreInfoCard = ({ storeData, onEditClick }) => {
  const { formatDate } = useDateFormatter();
  return (
    <Card className="rounded-3xl border-border bg-card shadow-sm">
      <CardHeader className="p-6 border-b border-border/60 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" /> Store Information
          </CardTitle>
          <CardDescription className="text-xs">
            Core legal profile, fiscal registry numbers, and primary contact routing
          </CardDescription>
        </div>
        <Button
          onClick={onEditClick}
          size="sm"
          className="text-xs font-bold gap-1.5 h-9"
        >
          <Edit3 className="w-3.5 h-3.5" /> Edit Profile
        </Button>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <BasicInformation storeData={storeData} />
          <ContactInformation storeData={storeData} />
        </div>

        <div className="pt-6 border-t border-border/60">
          <BusinessDocuments storeData={storeData} />
        </div>

        {storeData?.createdAt && (
          <div className="pt-4 border-t border-border/60">
            <p className="text-xs font-mono text-muted-foreground">
              Merchant account enrolled on {formatDate(storeData.createdAt)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StoreInfoCard;