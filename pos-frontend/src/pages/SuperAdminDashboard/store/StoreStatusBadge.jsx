import React from "react";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle2, Clock, XCircle, Ban } from "lucide-react";

const statusConfig = {
  active: {
    label: "Active",
    variant: "success",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    variant: "warning",
    icon: Clock,
  },
  blocked: {
    label: "Blocked",
    variant: "destructive",
    icon: Ban,
  },
  inactive: {
    label: "Inactive",
    variant: "secondary",
    icon: XCircle,
  },
};

export default function StoreStatusBadge({ status }) {
  const normalized = status?.toLowerCase() || "pending";
  const config = statusConfig[normalized] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1 font-semibold text-[11px] px-2.5 py-0.5 rounded-full">
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </Badge>
  );
}