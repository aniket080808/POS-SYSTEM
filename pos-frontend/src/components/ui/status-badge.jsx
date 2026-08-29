import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  let variant = "outline";
  let label = status;
  let customClass = "";

  switch (normalized) {
    case "ACTIVE":
    case "APPROVED":
    case "COMPLETED":
    case "SUCCESS":
    case "PAID":
    case "IN_STOCK":
    case "OPEN":
      variant = "success";
      label = normalized === "IN_STOCK" ? "In Stock" : status;
      break;

    case "PENDING":
    case "PROCESSING":
    case "REQUESTED":
    case "IN_PROGRESS":
    case "LOW_STOCK":
      variant = "warning";
      label = normalized === "LOW_STOCK" ? "Low Stock" : status;
      break;

    case "BLOCKED":
    case "REJECTED":
    case "FAILED":
    case "CANCELLED":
    case "CANCELED":
    case "OUT_OF_STOCK":
    case "CLOSED":
    case "SUSPENDED":
      variant = "destructive";
      label = normalized === "OUT_OF_STOCK" ? "Out of Stock" : status;
      break;

    case "REFUNDED":
    case "PARTIAL_REFUND":
      variant = "info";
      label = normalized === "PARTIAL_REFUND" ? "Partial Refund" : status;
      break;

    default:
      variant = "secondary";
      break;
  }

  return (
    <Badge variant={variant} className={cn("font-medium tracking-wide uppercase text-[11px] px-2.5 py-0.5", customClass, className)}>
      {label}
    </Badge>
  );
}

export default StatusBadge;
