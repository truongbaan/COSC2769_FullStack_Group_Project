/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Tran Hoang Linh
# ID: s4043097 */

import type { Route } from "./+types/cart";
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
import { useCart } from "~/lib/cart";
import { useAuth } from "~/lib/auth";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { checkoutCartApi } from "~/lib/api";
import { getBackendImageUrl } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Shopping Cart - Lazada Lite" },
    {
      name: "description",
      content: "Review and manage items in your shopping cart",
    },
  ];
}

export default function Cart() {
  const {
    items,
    isLoading,
    isSync,
    error,
    lastSynced,
    updateQuantity,
    removeItem,
    clearCart,
    forceSync,
    getTotalItems,
    getTotalPrice,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOrdering, setIsOrdering] = useState(false);
  const { user } = useAuth();

  // redirect vendors and shippers
  useEffect(() => {
    if (!user) {
      navigate("/login");
      toast.warning("Please login to view cart");
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

  const handleCheckout = async () => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    setIsOrdering(true);
    try {
      const result = await checkoutCartApi();

      if (result.success) {
        clearCart();
        toast.success(result.message || "Order placed successfully");
        if (result.order?.id) {
          console.log("Order ID:", result.order.id);
        }
        navigate("/products");
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsOrdering(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-2xl mx-auto text-center'>
          <div className='text-muted-foreground mb-6'>
            <ShoppingCart className='h-24 w-24 mx-auto' />
          </div>
          <h1 className='text-2xl font-bold text-foreground mb-4'>
            Your cart is empty
          </h1>
          <p className='text-muted-foreground mb-8'>
            {user
              ? "Looks like you haven't added any items to your cart yet. Start shopping to fill it up!"
              : "Please login to view your cart"}
          </p>

          {user && (
            <Link to='/products'>
              <Button size='lg'>Start Shopping</Button>
            </Link>
          )}
          {!user && (
            <Link to='/login'>
              <Button size='lg'>Login</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <Link
            to='/products'
            className='inline-flex items-center underline mb-4'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Continue Shopping
          </Link>
          <div className='flex items-center justify-between mb-2'>
            <h1 className='text-3xl font-bold text-foreground'>
              Shopping Cart
            </h1>
            {isAuthenticated() && (
              <div className='flex items-center gap-2'>
                {isLoading && (
                  <div className='flex items-center text-sm text-muted-foreground'>
                    <RefreshCw className='h-4 w-4 mr-1 animate-spin' />
                    Syncing...
                  </div>
                )}
                {!isLoading && isSync && (
                  <div className='flex items-center text-sm text-green-600'>
                    <CheckCircle className='h-4 w-4 mr-1' />
                    Synced
                  </div>
                )}
                {!isLoading && !isSync && (
                  <div className='flex items-center text-sm text-orange-500'>
                    <Clock className='h-4 w-4 mr-1' />
                    Pending sync
                  </div>
                )}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={forceSync}
                  disabled={isLoading || !isAuthenticated()}
                  className='text-xs'
                >
                  <RefreshCw
                    className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Sync
                </Button>
              </div>
            )}
          </div>
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground'>
              {getTotalItems()} item{getTotalItems() !== 1 ? "s" : ""} in your
              cart
            </p>
            {lastSynced && isAuthenticated() && (
              <p className='text-xs text-muted-foreground'>
                Last synced: {new Date(lastSynced).toLocaleTimeString()}
              </p>
            )}
          </div>
          {error && (
            <div className='flex items-center text-sm text-red-600 mt-2'>
              <AlertCircle className='h-4 w-4 mr-1' />
              {error}
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Cart Items */}
          <div className='lg:col-span-2 space-y-4'>
            {items.map((item) => (
              <Card key={item.product.id}>
                <CardContent className=''>
                  <div className='flex flex-col sm:flex-row gap-4'>
                    {/* Product Image */}
                    <div className='flex-shrink-0'>
                      <div className='w-24 h-24 rounded-lg overflow-hidden bg-muted'>
                        <img
                          src={
                            getBackendImageUrl(item.product.imageUrl) ??
                            item.product.imageUrl ??
                            undefined
                          }
                          alt={item.product.name}
                          className='w-full h-full object-cover'
                        />
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className='flex-1 space-y-2'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <h3 className='font-semibold text-lg'>
                            <Link
                              to={`/products/${item.product.id}`}
                              className='hover:underline transition-colors'
                            >
                              {item.product.name}
                            </Link>
                          </h3>
                          <p className='text-muted-foreground text-sm'>
                            by {item.product.vendorName}
                          </p>
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => removeItem(item.product.id)}
                          className='hover:underline'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>

                      {/* Quantity and Price */}
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium'>Qty:</span>
                          <div className='flex items-center border rounded'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className='h-3 w-3' />
                            </Button>
                            <span className='px-3 py-1 text-sm font-medium'>
                              {item.quantity}
                            </span>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className='h-3 w-3' />
                            </Button>
                          </div>
                        </div>

                        <div className='text-right'>
                          <div className='text-lg font-bold text-foreground'>
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            ${item.product.price} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order details</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Shipping</span>
                    <span className='text-foreground'>Free</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Tax</span>
                    <span>${(getTotalPrice() * 0.1).toFixed(2)}</span>
                  </div>
                  <div className='border-t pt-2'>
                    <div className='flex justify-between font-bold text-lg'>
                      <span>Total</span>
                      <span className='text-foreground'>
                        ${(getTotalPrice() * 1.1).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Button
                    className='w-full'
                    size='lg'
                    onClick={handleCheckout}
                    disabled={isOrdering}
                  >
                    <CreditCard className='mr-2 h-4 w-4' />
                    {isOrdering ? "Processing..." : "Proceed to Checkout"}
                  </Button>

                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full'
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>

                <div className='text-xs text-muted-foreground space-y-1'>
                  <p>• Free shipping on all orders</p>
                  <p>• Secure payment processing</p>
                  <p>• 30-day return policy</p>
                  {!isAuthenticated() && (
                    <p className='text-foreground'>
                      • Please sign in to complete your order
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card>
              <CardContent className='p-4'>
                <div className='text-center space-y-2'>
                  <h4 className='font-medium text-sm'>Secure Shopping</h4>
                  <div className='flex justify-center items-center gap-2 text-xs text-muted-foreground'>
                    <span>🔒 SSL Encrypted</span>
                    <span>•</span>
                    <span>✅ Verified Vendors</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Educational Notice */}
        <div className='mt-12 bg-muted border border-border rounded-lg p-6'>
          <h3 className='font-semibold text-foreground mb-2'>Demo Notice</h3>
          <p className='text-muted-foreground text-sm'>
            This is a demonstration shopping cart. No real payment will be
            processed, and no actual products will be shipped. This is for
            educational purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
