import type { Route } from "./+types/product-detail";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useAuth } from "~/lib/auth";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { fetchProduct } from "~/lib/api";
import type { ProductDto } from "~/lib/schemas";
import { useCart } from "~/lib/cart";
import { getBackendImageUrl } from "~/lib/utils";
import {
  ShoppingCart,
  Star,
  ArrowLeft,
  Plus,
  Minus,
  Store,
  Truck,
  Shield,
  Clock,
} from "~/components/ui/icons";
import { toast } from "sonner";

export function meta({}: Route.MetaArgs) {
  return [
    {
      title: "Product Details - Lazada Lite",
    },
    {
      name: "description",
      content: "Product details on Lazada Lite",
    },
  ];
}

export default function ProductDetail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem, getTotalItems } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // redirect vendors and shippers
  useEffect(() => {
    if (!user) {
      navigate("/login");
      toast.warning("Please login to view product details");
      return;
    }
    if (user.role === "vendor" || user.role === "shipper") {
      const redirectPath =
        user.role === "vendor" ? "/vendor/products" : "/shipper/orders";
      navigate(redirectPath);
      toast.success(`Redirected to your ${user.role} dashboard`);
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedProduct = await fetchProduct(productId);
        setProduct(fetchedProduct);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      toast.warning("Please login to add items to your cart");
      return;
    }

    try {
      await addItem(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
      toast.success("Added to cart!");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  const updateQuantity = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-2xl mx-auto text-center'>
          <Clock className='mx-auto h-8 w-8 animate-pulse mb-4' />
          <h1 className='text-2xl font-bold text-foreground mb-4'>
            Loading Product...
          </h1>
          <p className='text-muted-foreground'>
            Please wait while we fetch the product details.
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-2xl mx-auto text-center'>
          <h1 className='text-2xl font-bold text-foreground mb-4'>
            Product Not Found
          </h1>
          <p className='text-muted-foreground mb-6'>
            {error ||
              "The product you're looking for doesn't exist or has been removed."}
          </p>
          <Link to='/products'>
            <Button>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Breadcrumb */}
        <div className='mb-6'>
          <Link to='/products' className='inline-flex items-center underline'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Products
          </Link>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Product Image */}
          <div className='space-y-4'>
            <div className='aspect-square overflow-hidden rounded-lg bg-muted'>
              <img
                src={
                  getBackendImageUrl(product.imageUrl ?? undefined) ?? undefined
                }
                alt={product.name}
                className='w-full h-full object-cover'
                onError={(e) => {
                  // fallback to a placeholder image
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop";
                }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className='space-y-6'>
            <div>
              <Badge variant='secondary' className='mb-2'>
                {product.category}
              </Badge>
              <h1 className='text-3xl font-bold text-foreground mb-4'>
                {product.name}
              </h1>

              <div className='flex items-center gap-4 mb-4'>
                {product.inStock ? (
                  <Badge variant='default' className='bg-muted text-foreground'>
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant='destructive'>Out of Stock</Badge>
                )}
              </div>

              <div className='text-3xl font-bold text-foreground mb-6'>
                ${product.price}
              </div>
            </div>

            {/* Vendor Info */}
            <Card>
              <CardHeader className='pb-3'>
                <div className='flex items-center gap-3'>
                  <Avatar>
                    <AvatarFallback>
                      <Store className='h-4 w-4' />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className='text-lg'>
                      {product.vendorName}
                    </CardTitle>
                    <CardDescription>Verified Vendor</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Quantity and Add to Cart */}
            {product.inStock && (
              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <span className='font-medium'>Quantity:</span>
                  <div className='flex items-center border rounded-lg'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => updateQuantity(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className='h-4 w-4' />
                    </Button>
                    <span className='px-4 py-2 font-medium'>{quantity}</span>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => updateQuantity(1)}
                    >
                      <Plus className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <div className='space-y-3'>
                  <Button
                    size='lg'
                    className='w-full'
                    onClick={handleAddToCart}
                    disabled={!user}
                  >
                    <ShoppingCart className='mr-2 h-5 w-5' />
                    Add to Cart - ${(product.price * quantity).toFixed(2)}
                  </Button>

                  {addedToCart && (
                    <div className='bg-muted border border-border rounded-lg p-4'>
                      <p className='text-foreground font-medium'>
                        ✅ Added to cart! You now have {getTotalItems()} items
                        in your cart.
                      </p>
                    </div>
                  )}

                  <Link to='/cart' className='w-full'>
                    <Button variant='outline' size='lg' className='w-full'>
                      View Cart ({getTotalItems()} items)
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Product Features */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='flex items-center gap-2 text-sm'>
                <Truck className='h-4 w-4' />
                <span>Fast Delivery</span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <Shield className='h-4 w-4' />
                <span>Secure Payment</span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <Star className='h-4 w-4' />
                <span>Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className='mt-12'>
          <Card>
            <CardHeader>
              <CardTitle>Product Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground leading-relaxed'>
                {product.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Related Products */}
        <div className='mt-12'>
          <h2 className='text-2xl font-bold text-foreground mb-6'>
            You might also like
          </h2>
          <div className='text-center py-8 text-muted-foreground'>
            <p>Related products feature would be implemented here</p>
            <Link to='/products' className='mt-4 inline-block'>
              <Button variant='outline'>Browse More Products</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
