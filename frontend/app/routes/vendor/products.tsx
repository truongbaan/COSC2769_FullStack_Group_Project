import type { Route } from "./+types/products";
import { useAuth } from "~/lib/auth";
import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { getProductsByVendor } from "~/lib/data/products";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
} from "~/components/ui/icons";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Products - Vendor Dashboard" },
    { name: "description", content: "Manage your products on Lazada Lite" },
  ];
}

export default function VendorProducts() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);

  // Redirect if not authenticated or not a vendor
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (user?.role !== "vendor") {
      navigate("/");
      return;
    }

    // Mock vendor products (in real app, fetch from API)
    const vendorProducts = getProductsByVendor(user.id);
    setProducts(vendorProducts);
  }, [isAuthenticated, user, navigate]);

  if (!user || user.role !== "vendor") {
    return null; // Will redirect
  }

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p) => p.id !== productId));
      // TODO: Call API to delete product
    }
  };

  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => p.inStock).length;
  const totalRevenue = products.reduce((sum, p) => sum + p.price * 10, 0); // Mock sales data

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>My Products</h1>
            <p className='text-gray-600'>
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
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
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
                ${totalRevenue.toFixed(2)}
              </div>
              <p className='text-xs text-muted-foreground'>
                Estimated total sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Average Rating
              </CardTitle>
              <Eye className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {products.length > 0
                  ? (
                      products.reduce((sum, p) => sum + p.rating, 0) /
                      products.length
                    ).toFixed(1)
                  : "0.0"}
              </div>
              <p className='text-xs text-muted-foreground'>
                Customer satisfaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        {products.length === 0 ? (
          <Card>
            <CardContent className='text-center py-12'>
              <div className='text-gray-400 mb-4'>
                <Package className='h-16 w-16 mx-auto' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No products yet
              </h3>
              <p className='text-gray-600 mb-6'>
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
              <div className='text-sm text-gray-600'>
                Showing {products.length} product
                {products.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {products.map((product) => (
                <Card
                  key={product.id}
                  className='group hover:shadow-lg transition-shadow'
                >
                  <CardHeader className='p-0'>
                    <div className='aspect-square overflow-hidden rounded-t-lg bg-gray-100'>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                      />
                    </div>
                  </CardHeader>
                  <CardContent className='p-4'>
                    <div className='space-y-3'>
                      <div className='flex items-start justify-between'>
                        <div className='space-y-1'>
                          <Badge variant='secondary' className='text-xs'>
                            {product.category}
                          </Badge>
                          {product.inStock ? (
                            <Badge
                              variant='default'
                              className='bg-gray-100 text-gray-900 text-xs'
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
                        <div className='text-2xl font-bold text-gray-900 mt-2'>
                          ${product.price}
                        </div>
                      </div>

                      <div className='text-sm text-gray-600 space-y-1'>
                        <div className='flex justify-between'>
                          <span>Rating:</span>
                          <span>
                            {product.rating}/5 ({product.reviewCount} reviews)
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Mock Sales:</span>
                          <span>
                            {Math.floor(Math.random() * 50) + 1} units
                          </span>
                        </div>
                      </div>

                      <div className='flex gap-2'>
                        <Link to={`/products/${product.id}`} className='flex-1'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='w-full'
                          >
                            <Eye className='mr-2 h-4 w-4' />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            import("sonner").then(({ toast }) =>
                              toast(
                                "Edit functionality would be implemented here"
                              )
                            )
                          }
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleDeleteProduct(product.id)}
                          className='hover:underline'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Business Tips */}
        <div className='mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6'>
          <h3 className='font-semibold text-gray-900 mb-3'>
            💡 Tips for Success
          </h3>
          <ul className='text-gray-700 text-sm space-y-2'>
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
    </div>
  );
}
