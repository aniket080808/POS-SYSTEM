import React from "react";
import { FileText } from "lucide-react";
import { Label } from "@/components/ui/label";

const BusinessDocuments = ({ storeData }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Business Documents</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <div>
            <Label className="text-sm text-muted-foreground">GST Number</Label>
            <p className="text-base">{storeData.gstNumber || "No GST number provided"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <div>
            <Label className="text-sm text-muted-foreground">PAN Number</Label>
            <p className="text-base">{storeData.panNumber || "No PAN number provided"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDocuments;