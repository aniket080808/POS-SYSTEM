/**
 * Non-green semantic status color utility
 * Provides 4 unmistakably distinguishable states:
 * 1. Success / Active / Completed -> Solid Deep Charcoal with White Text
 * 2. Warning / Pending / Processing -> Amber Gold Tint with Dark Gold Text
 * 3. Error / Blocked / Rejected / Failed -> Muted Terracotta Tint with Rust Text
 * 4. Inactive / Closed / Refunded -> Muted Sand/Taupe with Dim Charcoal Text
 */
export const getStatusColor = (status) => {
  const s = status ? String(status).toLowerCase() : "";
  switch (s) {
    case "completed":
    case "complete":
    case "active":
    case "success":
    case "paid":
      return "bg-[#262422] text-[#FFFFFF] border-[#262422] font-bold shadow-2xs";

    case "pending":
    case "in_progress":
    case "processing":
    case "low_stock":
      return "bg-[#FDF6E2] text-[#785600] border-[#EED896] font-semibold";

    case "cancelled":
    case "canceled":
    case "rejected":
    case "blocked":
    case "failed":
    case "out_of_stock":
      return "bg-[#FBF0EC] text-[#7A331E] border-[#EFC8BD] font-semibold";

    case "inactive":
    case "refunded":
    case "refund":
    case "returned":
    case "draft":
    case "closed":
    default:
      return "bg-[#EAE5D9] text-[#5C5952] border-[#DCD6C8] font-medium";
  }
};