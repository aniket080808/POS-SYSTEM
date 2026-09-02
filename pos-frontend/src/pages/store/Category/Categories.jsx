import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { getCategoriesByStore } from "@/Redux Toolkit/features/category/categoryThunks";
import CategoryTable from "./CategoryTable";
import CategoryForm from "./CategoryForm";

export default function Categories() {
  const dispatch = useDispatch();
  const { categories = [], loading, error } = useSelector((state) => state.category);
  const { store } = useSelector((state) => state.store);
  const { userProfile } = useSelector((state) => state.user);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  const activeStoreId = store?.id || userProfile?.store?.id;

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (activeStoreId && token) {
      dispatch(getCategoriesByStore({ storeId: activeStoreId, token }));
    }
  }, [dispatch, activeStoreId]);

  const handleAddCategorySuccess = () => {
    setIsAddDialogOpen(false);
    const token = localStorage.getItem("jwt");
    if (activeStoreId && token) {
      dispatch(getCategoriesByStore({ storeId: activeStoreId, token }));
    }
  };

  const handleEditCategorySuccess = () => {
    setIsEditDialogOpen(false);
    setCurrentCategory(null);
    const token = localStorage.getItem("jwt");
    if (activeStoreId && token) {
      dispatch(getCategoriesByStore({ storeId: activeStoreId, token }));
    }
  };

  const openEditDialog = (category) => {
    setCurrentCategory(category);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Product Categories
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize catalog inventory into intuitive merchandise groups for cashier checkout speed
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="text-xs font-bold h-10 gap-1.5">
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Create Product Category</DialogTitle>
              <DialogDescription className="text-xs">
                Add a new merchandise classification group to your catalog
              </DialogDescription>
            </DialogHeader>
            <CategoryForm
              onSubmit={handleAddCategorySuccess}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Category</DialogTitle>
            <DialogDescription className="text-xs">
              Update category name and department description
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

      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base">Catalog Classification Directory</CardTitle>
          <CardDescription className="text-xs">
            Categories applied to product items for cashier filtering and category sales reports
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
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