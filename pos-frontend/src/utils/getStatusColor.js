export const getStatusColor = (status) => {
  const s = status ? String(status).toLowerCase() : "";
  switch (s) {
    case "completed":
    case "complete":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100";
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100";
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100";
    case "refunded":
    case "refund":
      return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100";
    case "cancelled":
    case "canceled":
      return "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100";
    default:
      return "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100";
  }
};


  