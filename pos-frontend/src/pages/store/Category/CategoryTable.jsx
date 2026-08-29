import React, { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Tag, Loader2 } from "lucide-react";
import { useDispatch } from 'react-redux';
import { deleteCategory } from '@/Redux Toolkit/features/category/categoryThunks';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CategoryTable = ({ categories = [], loading, onEdit }) => {
  const dispatch = useDispatch();
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("jwt");
      await dispatch(deleteCategory({ id: categoryToDelete.id, token })).unwrap();
      toast({ title: "Category Removed", description: `"${categoryToDelete.name}" deleted successfully.` });
    } catch (err) {
      toast({ title: "Error", description: err || "Failed to delete category", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/60">
              <TableHead className="text-xs font-bold text-foreground py-3.5 pl-6 w-1/3">Category Name</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">Description</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5 pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin inline-block mr-2 text-primary" />
                  Loading product categories...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                  <Tag className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-xs font-semibold text-foreground">No categories established</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Click "Add Category" to classify your retail inventory.</p>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} className="hover:bg-muted/30 transition-colors border-b border-border/40">
                  <TableCell className="pl-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        <Tag className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-foreground block">{category.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: #{category.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span className="text-xs text-muted-foreground">{category.description || "—"}</span>
                  </TableCell>
                  <TableCell className="pr-6 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary"
                        onClick={() => onEdit(category)}
                        title="Edit Category"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        onClick={() => setCategoryToDelete(category)}
                        title="Delete Category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={Boolean(categoryToDelete)} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">Delete Category</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to remove category{" "}
              <strong className="text-foreground">"{categoryToDelete?.name}"</strong>?
              Existing products linked to this category will need to be reclassified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl text-xs font-semibold h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs font-semibold h-8"
            >
              {isDeleting ? "Deleting..." : "Delete Category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CategoryTable;