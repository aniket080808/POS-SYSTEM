import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getCategoriesByStore } from "@/Redux Toolkit/features/category/categoryThunks";
import CategoryTable from "./CategoryTable";
import CategoryForm from "./CategoryForm";

export default function Categories() {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector((state) => state.category);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Product Categories
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Organize catalog inventory items into departments and product classifications
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-10 px-4 rounded-xl shadow-xs cursor-pointer">
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                Add New Product Category
              </DialogTitle>
            </DialogHeader>
            <CategoryForm 
              onSubmit={handleAddCategorySuccess} 
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                Edit Product Category
              </DialogTitle>
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

      {error && (
        <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      <Card className="rounded-2xl border border-border/80 shadow-2xs overflow-hidden">
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