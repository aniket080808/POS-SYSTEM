import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Tag, Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteCategory } from "@/Redux Toolkit/features/category/categoryThunks";
import { toast } from "@/components/ui/use-toast";
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
      toast({ title: "Category Deleted", description: `Category "${categoryToDelete.name}" deleted from store catalog.` });
    } catch (err) {
      toast({ title: "Delete Failed", description: err || "Failed to delete category.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Category Title</TableHead>
            <TableHead>Department Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-10 text-xs font-semibold text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin inline-block mr-2 text-[#B8860B]" />
                Loading categories...
              </TableCell>
            </TableRow>
          ) : categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-10 text-xs font-semibold text-muted-foreground">
                No product categories created yet. Add categories to structure your catalog.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <Tag className="h-4 w-4 text-[#B8860B] shrink-0" />
                    <span>{category.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {category.description || <span className="italic">No description provided</span>}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => onEdit(category)}
                      title="Edit Category"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
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

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete category <strong>"{categoryToDelete?.name}"</strong>? Products in this category will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
            >
              {isDeleting ? "Deleting..." : "Delete Category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryTable;