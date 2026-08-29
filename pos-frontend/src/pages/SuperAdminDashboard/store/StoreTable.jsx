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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Eye, MoreHorizontal, Ban, CheckCircle2, Search, Loader2, Store as StoreIcon } from "lucide-react";
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
import { formatDateTime } from "../../../utils/formateDate";
import { useToast } from "@/components/ui/use-toast";

export default function StoreTable({ onViewDetails, onBlockStore, onActivateStore, onEditStore, actionLoadingId }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { searchPage, loading, error } = useSelector((state) => state.store);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    // Use server-side search for paginated + filtered data
    dispatch(searchStores({
      status: statusFilter === "all" ? undefined : statusFilter,
      search: searchTerm || undefined,
      page: currentPage,
      size: 10,
    }));
  }, [dispatch, statusFilter, searchTerm, currentPage]);

  const stores = searchPage.content || [];
  const totalPages = searchPage.totalPages || 0;

  const handleStatusChange = async (storeId, newStatus) => {
    setUpdatingId(storeId);
    try {
      await dispatch(moderateStore({ storeId, action: newStatus })).unwrap();
      toast({
        title: "Status Updated",
        description: `Store status changed to ${newStatus.toLowerCase()}.`,
      });
      // Refresh search after moderation
      dispatch(searchStores({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm || undefined,
        page: currentPage,
        size: 10,
      }));
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
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
          <Input
            placeholder="Search stores, owners, emails..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className="pl-9 h-10 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(0); }}>
            <SelectTrigger className="w-[160px] h-10 rounded-xl text-xs">
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active Only</SelectItem>
              <SelectItem value="PENDING">Pending Only</SelectItem>
              <SelectItem value="BLOCKED">Blocked Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-xs text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary" />
            <span>Loading store records...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-xs text-destructive">
            {error}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-16 text-xs text-muted-foreground space-y-2">
            <StoreIcon className="w-8 h-8 mx-auto opacity-40 text-muted-foreground" />
            <p className="font-semibold text-foreground">No Store Records Found</p>
            <p>No stores match your active search or filter selection.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              <TableRow>
                <TableHead className="py-3">Store Name</TableHead>
                <TableHead className="py-3">Owner</TableHead>
                <TableHead className="py-3">Contact Details</TableHead>
                <TableHead className="py-3">Status</TableHead>
                <TableHead className="py-3">Quick Moderation</TableHead>
                <TableHead className="py-3">Registered</TableHead>
                <TableHead className="py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60 text-xs">
              {stores.map((store) => {
                const statusUpper = store.status?.toUpperCase() || "PENDING";
                const isItemUpdating = updatingId === store.id || actionLoadingId === store.id;

                return (
                  <TableRow key={store.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold text-foreground py-3.5">
                      {store.brand}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {store.storeAdmin?.fullName || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div>{store.contact?.phone || "—"}</div>
                      <div className="text-[11px] font-mono text-muted-foreground/80">{store.contact?.email || "—"}</div>
                    </TableCell>
                    <TableCell>
                      <StoreStatusBadge status={store.status} />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={statusUpper}
                        onValueChange={(val) => handleStatusChange(store.id, val)}
                        disabled={isItemUpdating}
                      >
                        <SelectTrigger className="w-[110px] h-8 rounded-lg text-xs font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="BLOCKED">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-[11px]">
                      {formatDateTime(store.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl text-xs">
                          <DropdownMenuItem onClick={() => onViewDetails?.(store)} className="gap-2 cursor-pointer">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span>View Store Profile</span>
                          </DropdownMenuItem>
                          {statusUpper === "ACTIVE" && (
                            <DropdownMenuItem
                              onClick={() => onBlockStore?.(store.id)}
                              className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Ban className="h-4 w-4" />
                              <span>Suspend Store</span>
                            </DropdownMenuItem>
                          )}
                          {statusUpper === "BLOCKED" && (
                            <DropdownMenuItem
                              onClick={() => onActivateStore?.(store.id)}
                              className="gap-2 text-emerald-600 focus:text-emerald-600 cursor-pointer"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Reactivate Store</span>
                            </DropdownMenuItem>
                          )}
                          {statusUpper === "PENDING" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => onActivateStore?.(store.id)}
                                className="gap-2 text-emerald-600 focus:text-emerald-600 cursor-pointer"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Approve Store</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onBlockStore?.(store.id)}
                                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                              >
                                <Ban className="h-4 w-4" />
                                <span>Reject Request</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination className="mt-4 justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 0) setCurrentPage((p) => p - 1);
                }}
                className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                  className="cursor-pointer"
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
                className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
