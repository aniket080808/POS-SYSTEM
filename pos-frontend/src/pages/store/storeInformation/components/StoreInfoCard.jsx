import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Store } from "lucide-react";
import BasicInformation from "./BasicInformation";
import ContactInformation from "./ContactInformation";
import BusinessDocuments from "./BusinessDocuments";

const StoreInfoCard = ({ storeData, onEditClick }) => {
  return (
    <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/60 py-3.5 px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-bold text-foreground">Registered Store Information</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEditClick}
            className="rounded-xl text-xs font-semibold h-8 gap-1.5"
          >
            <Edit className="h-3.5 w-3.5" /> Edit Profile
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <BasicInformation storeData={storeData} />
          <ContactInformation storeData={storeData} />
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-border/60">
          <BusinessDocuments storeData={storeData} />
        </div>
        
        {storeData.createdAt && (
          <div className="pt-4 border-t border-border/40">
            <p className="text-[11px] text-muted-foreground font-mono">
              Registered on NexPOS cloud: {new Date(storeData.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StoreInfoCard;
 