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
import { Eye, MoreHorizontal, Ban, Check, Clock, Search } from "lucide-react";
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
import { useNavigate } from "react-router";

export default function StoreTable({ onViewDetails, onBlockStore, onActivateStore, actionLoadingId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { searchPage, loading, error } = useSelector((state) => state.store);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(
      searchStores({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: debouncedSearch || undefined,
        page: currentPage,
        size: 10,
      })
    );
  }, [dispatch, statusFilter, debouncedSearch, currentPage]);

  const stores = searchPage.content || [];
  const totalPages = searchPage.totalPages || 0;

  const handleStatusChange = async (storeId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;
    setUpdatingId(storeId);
    try {
      await dispatch(moderateStore({ storeId, action: newStatus })).unwrap();
      dispatch(
        searchStores({
          status: statusFilter === "all" ? undefined : statusFilter,
          search: debouncedSearch || undefined,
          page: currentPage,
          size: 10,
        })
      );
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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search stores, owners, emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 h-10 text-xs font-semibold">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Merchant Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING">Pending Review</SelectItem>
            <SelectItem value="BLOCKED">Suspended / Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Container */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-xs font-semibold text-muted-foreground">
            Loading stores...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-xs text-destructive font-semibold">
            {error}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Brand</TableHead>
                <TableHead>Store Owner</TableHead>
                <TableHead>Contact Phone</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quick Status Action</TableHead>
                <TableHead>Enrolled On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((store) => {
                const statusUpper = store.status?.toUpperCase();
                return (
                  <TableRow key={store.id}>
                    <TableCell className="font-bold text-foreground">
                      <span
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate(`/super-admin/stores/${store.id}`)}
                      >
                        {store.brand || store.brandName || store.name || `Store #${store.id}`}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      {store.storeAdmin?.fullName || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {store.contact?.phone || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {store.contact?.email || store.storeAdmin?.email || "—"}
                    </TableCell>
                    <TableCell>
                      <StoreStatusBadge status={store.status} />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={statusUpper}
                        onValueChange={(val) => handleStatusChange(store.id, val, statusUpper)}
                        disabled={updatingId === store.id || actionLoadingId === store.id}
                      >
                        <SelectTrigger className="w-28 h-8 text-xs font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="BLOCKED">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                      {(updatingId === store.id || actionLoadingId === store.id) && (
                        <span className="ml-1.5 text-[10px] text-muted-foreground animate-pulse">Updating...</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {formatDateTime(store.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => onViewDetails?.(store)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Quick Drawer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/super-admin/stores/${store.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Full Store Page
                          </DropdownMenuItem>
                          {statusUpper === "ACTIVE" && (
                            <DropdownMenuItem
                              onClick={() => onBlockStore?.(store.id)}
                              className="text-destructive font-semibold"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Block Store
                            </DropdownMenuItem>
                          )}
                          {statusUpper === "BLOCKED" && (
                            <DropdownMenuItem
                              onClick={() => onActivateStore?.(store.id)}
                              className="font-semibold text-foreground"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Activate Store
                            </DropdownMenuItem>
                          )}
                          {statusUpper === "PENDING" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => onActivateStore?.(store.id)}
                                className="font-semibold text-foreground"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Approve Store
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onBlockStore?.(store.id)}
                                className="text-destructive font-semibold"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Reject Store
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

      {stores.length === 0 && !loading && !error && (
        <div className="text-center py-10 text-muted-foreground text-xs font-semibold bg-card rounded-2xl border border-border">
          No registered stores found matching criteria.
        </div>
      )}

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
                className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
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
                className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
