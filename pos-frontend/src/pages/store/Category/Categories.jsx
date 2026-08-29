import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getCategoriesByStore } from "@/Redux Toolkit/features/category/categoryThunks";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CategoryTable from "./CategoryTable";
import CategoryForm from "./CategoryForm";

export default function Categories() {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector((state) => state.category || {});
  const { store } = useSelector((state) => state.store || {});
  const { userProfile } = useSelector((state) => state.user || {});

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  const activeStoreId = store?.id || userProfile?.store?.id;

  // Fetch categories on mount or when store changes
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (activeStoreId && token) {
      dispatch(getCategoriesByStore({ storeId: activeStoreId, token }));
    }
  }, [dispatch, activeStoreId]);

  const handleAddCategorySuccess = () => {
    setIsAddDialogOpen(false);
  };

  const handleEditCategorySuccess = () => {
    setIsEditDialogOpen(false);
    setCurrentCategory(null);
  };

  const openEditDialog = (category) => {
    setCurrentCategory(category);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Product Categories</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize catalog inventory into taxonomy groups for quick terminal POS lookups.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl text-xs font-semibold h-9 gap-1.5 shadow-2xs">
              <Plus className="h-3.5 w-3.5" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">Create Product Category</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Define a new categorization label to classify store inventory.
              </DialogDescription>
            </DialogHeader>
            <CategoryForm 
              onSubmit={handleAddCategorySuccess} 
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[480px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">Edit Product Category</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update category classification details.
              </DialogDescription>
            </DialogHeader>
            <CategoryForm 
              initialValues={currentCategory} 
              onSubmit={handleEditCategorySuccess} 
              onCancel={() => setIsEditDialogOpen(false)}
              isEditing={true}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          <CategoryTable 
            categories={categories} 
            loading={loading} 
            onEdit={openEditDialog}
          />
        </CardContent>
      </Card>
    </div>
  );
}