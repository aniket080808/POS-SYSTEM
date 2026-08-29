import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Eye, MoreHorizontal, Ban, CheckCircle, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../components/ui/pagination";
import StoreStatusBadge from "./StoreStatusBadge";
import { searchStores, moderateStore } from "../../../Redux Toolkit/features/store/storeThunks";
import { formatDateTime } from "@/utils/dateUtils";
import { useToast } from "@/components/ui/use-toast";

export default function StoreTable({ onViewDetails, onBlockStore, onActivateStore }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { searchPage, loading, error } = useSelector((state) => state.store);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    dispatch(
      searchStores({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm || undefined,
        page: currentPage,
        size: 10,
      })
    );
  }, [dispatch, statusFilter, searchTerm, currentPage]);

  const stores = searchPage?.content || [];
  const totalPages = searchPage?.totalPages || 0;

  const handleStatusChange = async (storeId, newStatus) => {
    setUpdatingId(storeId);
    try {
      await dispatch(moderateStore({ storeId, action: newStatus })).unwrap();
      toast({
        title: "Status Updated",
        description: `Store status changed to ${newStatus.toLowerCase()}.`,
      });
    } catch (e) {
      toast({
        title: "Update Failed",
        description: e?.message || e || "Failed to update store status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search stores, owners, emails..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className="pl-9 h-10 text-xs"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            setCurrentPage(0);
          }}
        >
          <SelectTrigger className="w-[160px] h-10 text-xs">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="BLOCKED">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-border/80 overflow-hidden shadow-2xs bg-card">
        {loading ? (
          <div className="text-center py-10 text-xs text-muted-foreground">
            Loading stores directory...
          </div>
        ) : error ? (
          <div className="text-center py-10 text-xs text-red-500 font-medium">
            {error}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs font-bold">Store Brand</TableHead>
                <TableHead className="text-xs font-bold">Store Admin</TableHead>
                <TableHead className="text-xs font-bold">Contact Phone</TableHead>
                <TableHead className="text-xs font-bold">Admin Email</TableHead>
                <TableHead className="text-xs font-bold">Account Status</TableHead>
                <TableHead className="text-xs font-bold">Direct Moderation</TableHead>
                <TableHead className="text-xs font-bold">Onboarded Date</TableHead>
                <TableHead className="text-right text-xs font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.length > 0 ? (
                stores.map((store) => {
                  const statusUpper = store.status?.toUpperCase();
                  return (
                    <TableRow key={store.id} className="hover:bg-muted/30">
                      <TableCell className="font-bold text-xs text-foreground">
                        {store.brand || store.brandName || `Store #${store.id}`}
                      </TableCell>
                      <TableCell className="text-xs text-foreground">
                        {store.storeAdmin?.fullName || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {store.contact?.phone || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {store.contact?.email || store.storeAdmin?.email || "—"}
                      </TableCell>
                      <TableCell>
                        <StoreStatusBadge status={store.status} />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={statusUpper}
                          onValueChange={(val) => handleStatusChange(store.id, val)}
                          disabled={updatingId === store.id}
                        >
                          <SelectTrigger className="w-[110px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="BLOCKED">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {formatDateTime(store.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem onClick={() => onViewDetails?.(store)}>
                              <Eye className="mr-2 h-3.5 w-3.5" />
                              View Store Details
                            </DropdownMenuItem>
                            {statusUpper === "ACTIVE" && (
                              <DropdownMenuItem
                                onClick={() => onBlockStore?.(store.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Ban className="mr-2 h-3.5 w-3.5" />
                                Suspend / Block Store
                              </DropdownMenuItem>
                            )}
                            {statusUpper === "BLOCKED" && (
                              <DropdownMenuItem
                                onClick={() => onActivateStore?.(store.id)}
                                className="text-emerald-600 focus:text-emerald-600"
                              >
                                <CheckCircle className="mr-2 h-3.5 w-3.5" />
                                Re-activate Store
                              </DropdownMenuItem>
                            )}
                            {statusUpper === "PENDING" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => onActivateStore?.(store.id)}
                                  className="text-emerald-600 focus:text-emerald-600"
                                >
                                  <CheckCircle className="mr-2 h-3.5 w-3.5" />
                                  Approve Merchant
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onBlockStore?.(store.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Ban className="mr-2 h-3.5 w-3.5" />
                                  Reject Merchant
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-xs text-muted-foreground"
                  >
                    No merchant stores found matching current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 0) setCurrentPage((p) => p - 1);
                }}
                className={currentPage === 0 ? "pointer-events-none opacity-50 text-xs" : "text-xs"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <PaginationItem key={idx}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === idx}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(idx);
                  }}
                  className="text-xs"
                >
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages - 1) setCurrentPage((p) => p + 1);
                }}
                className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50 text-xs" : "text-xs"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
