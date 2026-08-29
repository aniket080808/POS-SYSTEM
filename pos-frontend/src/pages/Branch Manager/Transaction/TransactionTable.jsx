import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
} from "lucide-react";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const TransactionTable = ({
  transactions = [],
  loading,
  searchTerm = "",
  onViewDetails,
  onPrintInvoice,
  getStatusColor,
  getPaymentIcon,
}) => {
  const { format: formatCurrency } = useCurrencyFormatter();
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // 1. Filter by search term locally (ID, Customer Name, Cashier Name, Payment, Status)
  const filteredTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];
    if (!searchTerm || searchTerm.trim() === "") return transactions;

    const term = searchTerm.toLowerCase().trim();
    return transactions.filter((t) => {
      const idMatch = String(t.id).includes(term);
      const customerName = (
        t.customer?.fullName ||
        t.customer?.name ||
        "Walk-in Customer"
      ).toLowerCase();
      const customerMatch = customerName.includes(term);
      const cashierName = (
        t.cashierName ||
        t.cashier?.fullName ||
        t.cashier?.name ||
        (t.cashierId ? `Cashier #${t.cashierId}` : "")
      ).toLowerCase();
      const cashierMatch = cashierName.includes(term);
      const paymentMatch = (t.paymentType || "")
        .toLowerCase()
        .includes(term);
      const statusMatch = (t.status || "completed")
        .toLowerCase()
        .includes(term);

      return (
        idMatch ||
        customerMatch ||
        cashierMatch ||
        paymentMatch ||
        statusMatch
      );
    });
  }, [transactions, searchTerm]);

  // 2. Sort filtered transactions
  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions];
    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "createdAt") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (sortField === "totalAmount" || sortField === "id") {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredTransactions, sortField, sortDirection]);

  // 3. Paginate
  const totalCount = sortedTransactions.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedTransactions = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return sortedTransactions.slice(start, start + pageSize);
  }, [sortedTransactions, validPage, pageSize]);

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="h-3 w-3 opacity-40 group-hover:opacity-100" />
      );
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-primary font-bold" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-primary font-bold" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[100px]">
                <button
                  type="button"
                  onClick={() => handleSort("id")}
                  className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider group hover:text-foreground cursor-pointer"
                >
                  ID
                  {renderSortIcon("id")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => handleSort("createdAt")}
                  className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider group hover:text-foreground cursor-pointer"
                >
                  Date & Time
                  {renderSortIcon("createdAt")}
                </button>
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Cashier
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Customer
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => handleSort("totalAmount")}
                  className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider group hover:text-foreground cursor-pointer"
                >
                  Amount
                  {renderSortIcon("totalAmount")}
                </button>
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Payment Method
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Loading transactions...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((transaction) => {
                const cashierDisplay =
                  transaction.cashierName ||
                  transaction.cashier?.fullName ||
                  transaction.cashier?.name ||
                  (transaction.cashierId
                    ? `Cashier #${transaction.cashierId}`
                    : "-");

                const customerDisplay =
                  transaction.customer?.fullName ||
                  transaction.customer?.name ||
                  "Walk-in Customer";

                const dateDisplay = transaction.createdAt
                  ? new Date(transaction.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-";

                const status = transaction.status || "COMPLETED";
                const isRefunded =
                  status.toString().toUpperCase() === "REFUNDED";
                const formattedAmount = formatCurrency(transaction.totalAmount || 0);

                return (
                  <TableRow
                    key={transaction.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-semibold font-mono text-foreground">
                      #{transaction.id}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                      {dateDisplay}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-foreground">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{cashierDisplay}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">
                          {customerDisplay}
                        </span>
                        {!transaction.customer && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 text-muted-foreground bg-muted/30"
                          >
                            Walk-in
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`font-semibold whitespace-nowrap ${
                        isRefunded ? "text-rose-600" : "text-foreground"
                      }`}
                    >
                      {isRefunded
                        ? `-₹${formattedAmount}`
                        : `₹${formattedAmount}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {getPaymentIcon(transaction.paymentType)}
                        <span>{transaction.paymentType || "CASH"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(status)} font-medium`}
                        variant="secondary"
                      >
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => onViewDetails(transaction.id)}
                          title="View Transaction Details"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => onPrintInvoice(transaction.id)}
                          title="Print / Download Invoice"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CreditCard className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-medium text-base">
                      No transactions found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {searchTerm
                        ? "Try adjusting your search terms or filters"
                        : "No transactions recorded for this branch yet"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination & Summary Footer */}
      {!loading && totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              Showing{" "}
              <strong className="text-foreground">
                {(validPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-foreground">
                {Math.min(validPage * pageSize, totalCount)}
              </strong>{" "}
              of{" "}
              <strong className="text-foreground">{totalCount}</strong>{" "}
              transactions
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs">Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prev / Next & Page Info */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setCurrentPage((p) => Math.max(p - 1, 1))
                }
                disabled={validPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-xs font-medium px-2">
                Page {validPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={validPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;