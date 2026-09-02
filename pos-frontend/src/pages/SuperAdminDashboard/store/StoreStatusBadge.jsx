import React from "react";
import { Badge } from "../../../components/ui/badge";
import { Check, Clock, XCircle, Minus } from "lucide-react";

const statusConfig = {
  active: {
    label: "Active",
    variant: "active",
    icon: <Check className="w-3 h-3 text-[#C9A227] stroke-[3]" />,
  },
  approved: {
    label: "Approved",
    variant: "active",
    icon: <Check className="w-3 h-3 text-[#C9A227] stroke-[3]" />,
  },
  pending: {
    label: "Pending",
    variant: "warning",
    icon: <Clock className="w-3 h-3 text-[#B8860B]" />,
  },
  blocked: {
    label: "Blocked",
    variant: "destructive",
    icon: <XCircle className="w-3 h-3" />,
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    icon: <XCircle className="w-3 h-3" />,
  },
  inactive: {
    label: "Inactive",
    variant: "secondary",
    icon: <Minus className="w-3 h-3" />,
  },
};

export default function StoreStatusBadge({ status }) {
  const config = statusConfig[status?.toLowerCase()] || statusConfig.inactive;

  return (
    <Badge variant={config.variant} className="gap-1.5 px-2.5 py-0.5">
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}