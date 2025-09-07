/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Tran Hoang Linh
# ID: s4043097 */

import type { Route } from "./+types/products";
import { useAuth } from "~/lib/auth";
import { Link, useNavigate } from "react-router";
import { updateProductApi, fetchVendorProducts } from "~/lib/api";
import { getBackendImageUrl, getApiErrorMessage } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Package, Plus, Edit, Eye, TrendingUp } from "~/components/ui/icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PRODUCT_CATEGORIES } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Products - Vendor Dashboard" },
    { name: "description", content: "Manage your products on MUCK" },
  ];
}

export default function VendorProducts() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    price: 0,
    description: "",
    image: "",
    instock: true,
    category: "",
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editPreviewImage, setEditPreviewImage] = useState<string | null>(null);

  // Fetch vendor products from API
  const fetchVendorProductsLocal = async () => {
    try {
      setLoading(true);
      setError(null);

      const products = await fetchVendorProducts();
      setProducts(products || []);
    } catch (err) {
      console.error("Error fetching vendor products:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // redirect if not authenticated or not a vendor
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (user?.role !== "vendor") {
      navigate("/");
      return;
    }

    fetchVendorProductsLocal();
  }, [user, navigate]);

  if (!user || user.role !== "vendor") {
    return null;
  }

  const handleEditProduct = (product: any) => {
    setProductToEdit(product);
    setEditForm({
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image || product.imageUrl || "",
      category: product.category,
      instock: (product.inStock ?? product.instock ?? true) as boolean,
    });
    setEditImageFile(null);
    setEditPreviewImage(null);
    setEditDialogOpen(true);
  };

  const confirmEditProduct = async () => {
    if (productToEdit && user) {
      try {
        setEditing(true);

        // prepare update data
        const updateData: any = {};
        if (editForm.name && editForm.name !== productToEdit.name) {
          updateData.name = editForm.name;
        }
        if (editForm.price && editForm.price !== productToEdit.price) {
          updateData.price = editForm.price;
        }
        if (
          editForm.description &&
          editForm.description !== productToEdit.description
        ) {
          updateData.description = editForm.description;
        }
        if (editForm.category && editForm.category !== productToEdit.category) {
          updateData.category = editForm.category;
        }

        // add image file if user selected a new one
        if (editImageFile) {
          updateData.image = editImageFile;
        }

        // include stock status if changed
        const currentInStock = (productToEdit.inStock ??
          productToEdit.instock) as boolean | undefined;
        if (
          typeof editForm.instock === "boolean" &&
          editForm.instock !== currentInStock
        ) {
          updateData.instock = editForm.instock;
        }

        const result = await updateProductApi(productToEdit.id, updateData);

        if (result.success && result.product) {
          // update product in local state
          setProducts(
            products.map((p) =>
              p.id === productToEdit.id
                ? {
                    ...p,
                    ...result.product,
                    ...(updateData.instock !== undefined
                      ? {
                          inStock: updateData.instock,
                          instock: updateData.instock,
                        }
                      : {}),
                  }
                : p
            )
          );
          setEditDialogOpen(false);
          setProductToEdit(null);
          toast.success("Product updated successfully");
        } else {
          throw new Error("Failed to update product");
        }
      } catch (error) {
        console.error("Error updating product:", error);

        const errorMessage = getApiErrorMessage(
          error,
          "Failed to update product. Please try again."
        );
        toast.error(errorMessage);
      } finally {
        setEditing(false);
      }
    }
  };

  const cancelEditProduct = () => {
    setEditDialogOpen(false);
    setProductToEdit(null);
    setEditForm({
      name: "",
      price: 0,
      description: "",
      image: "",
      instock: true,
      category: "",
    });
    setEditImageFile(null);
    setEditPreviewImage(null);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setEditImageFile(file || null);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setEditPreviewImage(null);
    }
  };

  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => p.inStock).length;

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-foreground'>My Products</h1>
            <p className='text-muted-foreground'>
              Manage your product catalog and inventory
            </p>
          </div>
          <Link to='/vendor/products/new'>
            <Button size='lg'>
              <Plus className='mr-2 h-5 w-5' />
              Add New Product
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Products
              </CardTitle>
              <Package className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalProducts}</div>
              <p className='text-xs text-muted-foreground'>
                {inStockProducts} in stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Revenue (Mock)
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {totalProducts > 0
                  ? `$${(products.reduce((sum, p) => sum + p.price, 0) / totalProducts).toFixed(2)}`
                  : "$0.00"}
              </div>
              <p className='text-xs text-muted-foreground'>
                Average product price
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        {loading ? (
          <Card>
            <CardContent className='text-center py-12'>
              <div className='text-muted-foreground mb-4'>
                <Package className='h-16 w-16 mx-auto animate-pulse' />
              </div>
              <h3 className='text-lg font-medium text-foreground mb-2'>
                Loading products...
              </h3>
              <p className='text-muted-foreground'>
                Please wait while we fetch your products.
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className='text-center py-12'>
              <div className='text-red-500 mb-4'>
                <Package className='h-16 w-16 mx-auto' />
              </div>
              <h3 className='text-lg font-medium text-foreground mb-2'>
                Failed to load products
              </h3>
              <p className='text-muted-foreground mb-6'>{error}</p>
              <Button onClick={() => fetchVendorProductsLocal()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className='text-center py-12'>
              <div className='text-muted-foreground mb-4'>
                <Package className='h-16 w-16 mx-auto' />
              </div>
              <h3 className='text-lg font-medium text-foreground mb-2'>
                No products yet
              </h3>
              <p className='text-muted-foreground mb-6'>
                Start by adding your first product to begin selling on our
                platform.
              </p>
              <Link to='/vendor/products/new'>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Your First Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl font-semibold'>Product Catalog</h2>
              <div className='text-sm text-muted-foreground'>
                Showing {products.length} product
                {products.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {products.map((product) => (
                <Card
                  key={product.id}
                  className='group hover:shadow-lg transition-shadow py-0'
                >
                  <CardHeader className='p-0'>
                    <div className='aspect-square overflow-hidden rounded-t-lg bg-muted'>
                      <img
                        src={getBackendImageUrl(product.imageUrl)}
                        alt={product.name}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                      />
                    </div>
                  </CardHeader>
                  <CardContent className='p-4'>
                    <div className='space-y-3'>
                      <div className='flex items-start justify-between'>
                        <div className='space-y-1'>
                          <Badge variant='secondary' className='text-xs mr-2'>
                            {product.category}
                          </Badge>
                          {product.inStock ? (
                            <Badge
                              variant='default'
                              className='bg-muted text-foreground text-xs'
                            >
                              In Stock
                            </Badge>
                          ) : (
                            <Badge variant='destructive' className='text-xs'>
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <CardTitle className='text-lg line-clamp-2'>
                          {product.name}
                        </CardTitle>
                        <div className='text-2xl font-bold text-foreground mt-2'>
                          ${product.price}
                        </div>
                      </div>

                      <div className='text-sm text-muted-foreground space-y-1'>
                        <div className='flex justify-between'>
                          <span>Availability:</span>
                          <span>
                            {product.inStock ? "Available" : "Unavailable"}
                          </span>
                        </div>
                      </div>

                      <div className='flex gap-2'>
                        <Link to={`/products/${product.id}`} className='w-full'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='flex-1 w-full'
                          >
                            <Eye className='mr-2 h-4 w-4' />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleEditProduct(product)}
                          className='hover:underline'
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        {/* Out-of-stock action moved into the edit form toggle */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Business Tips */}
        <div className='mt-12 bg-muted border border-border rounded-lg p-6'>
          <h3 className='font-semibold text-foreground mb-3'>
            💡 Tips for Success
          </h3>
          <ul className='text-muted-foreground text-sm space-y-2'>
            <li>• Add high-quality product images to increase sales</li>
            <li>
              • Write detailed descriptions with key features and benefits
            </li>
            <li>• Competitive pricing helps your products stand out</li>
            <li>• Respond quickly to customer inquiries and reviews</li>
            <li>• Keep your inventory updated to avoid overselling</li>
          </ul>
        </div>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className='w-[95vw] sm:max-w-[525px] max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details for "{productToEdit?.name}".
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4'>
              <Label htmlFor='edit-name' className='md:text-right'>
                Name
              </Label>
              <Input
                id='edit-name'
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className='md:col-span-3'
                placeholder='Product name (10-20 characters)'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4'>
              <Label htmlFor='edit-price' className='md:text-right'>
                Price
              </Label>
              <Input
                id='edit-price'
                type='number'
                step='0.01'
                min='0'
                value={editForm.price}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                className='md:col-span-3'
                placeholder='0.00'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4'>
              <Label htmlFor='edit-category' className='md:text-right'>
                Category
              </Label>

              <div className='md:col-span-3'>
                <Select
                  value={editForm.category}
                  onValueChange={(v) =>
                    setEditForm({ ...editForm, category: v })
                  }
                >
                  <SelectTrigger id='edit-category'>
                    <SelectValue placeholder='Select a category' />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 items-start gap-2 md:gap-4'>
            <Label htmlFor='edit-image' className='md:text-right pt-0 md:pt-2'>
              Product Image
            </Label>
            <div className='md:col-span-3 space-y-3'>
              <Input
                id='edit-image'
                type='file'
                accept='image/png,image/jpeg'
                onChange={handleEditImageChange}
                className='w-full'
              />
              {editPreviewImage ? (
                <div className='border rounded-lg p-3'>
                  <p className='text-sm font-medium mb-2'>New Image Preview:</p>
                  <img
                    src={editPreviewImage}
                    alt='New product preview'
                    className='w-24 h-24 object-cover rounded-lg'
                  />
                </div>
              ) : (
                productToEdit && (
                  <div className='border rounded-lg p-3'>
                    <p className='text-sm font-medium mb-2'>Current Image:</p>
                    <img
                      src={getBackendImageUrl(productToEdit.imageUrl)}
                      alt={productToEdit.name}
                      className='w-24 h-24 object-cover rounded-lg'
                    />
                  </div>
                )
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 items-start gap-2 md:gap-4'>
            <Label
              htmlFor='edit-description'
              className='md:text-right pt-0 md:pt-2'
            >
              Description
            </Label>
            <Textarea
              id='edit-description'
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className='md:col-span-3 h-40 max-h-[45vh] overflow-y-auto resize-y'
              placeholder='Product description (max 500 characters)'
              rows={4}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4'>
            <Label htmlFor='edit-instock' className='md:text-right'>
              In Stock
            </Label>
            <div className='md:col-span-3'>
              <Switch
                id='edit-instock'
                checked={!!editForm.instock}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, instock: Boolean(checked) })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={cancelEditProduct}
              disabled={editing}
            >
              Cancel
            </Button>
            <Button onClick={confirmEditProduct} disabled={editing}>
              {editing ? "Updating..." : "Update Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
