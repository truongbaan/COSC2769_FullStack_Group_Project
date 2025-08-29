import type { Route } from "./+types/order-detail";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
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
import { useAuth } from "~/lib/auth";
import {
  fetchOrder,
  updateOrderStatusApi,
  fetchOrderItemsApi,
} from "~/lib/api";
import type { OrderItemDetail } from "~/lib/api";
import { getBackendImageUrl } from "~/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Package,
  CheckCircle,
  XCircle,
  Phone,
  Clock,
  Truck,
} from "~/components/ui/icons";

export function meta({ params }: Route.MetaArgs) {
  const order: any = undefined;
  return [
    {
      title: order
        ? `Order ${order.id} - Delivery Management`
        : "Order Not Found",
    },
    { name: "description", content: "Manage delivery for customer order" },
  ];
}

export default function OrderDetail() {
  const { orderId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<OrderItemDetail[]>([]);
  const [customerInfo, setCustomerInfo] = useState<{
    name: string;
    address: string;
  } | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "delivered" | "canceled" | null
  >(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (user?.role !== "shipper") {
      navigate("/");
      return;
    }

    (async () => {
      try {
        const foundOrder = await fetchOrder(orderId!);
        if (!foundOrder) {
          navigate("/shipper/orders");
          return;
        }
        if (foundOrder.hubId !== user.hub_id) {
          navigate("/shipper/orders");
          return;
        }
        setOrder(foundOrder);

        // Fetch order items
        setLoadingItems(true);
        const orderItemsData = await fetchOrderItemsApi(orderId!);
        setOrderItems(orderItemsData.items);
        setCustomerInfo(orderItemsData.customer);
      } catch (error) {
        console.error("Error fetching order data:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoadingItems(false);
      }
    })();
  }, [orderId, user, navigate]);

  if (!user || user.role !== "shipper" || !order) {
    return null; // Will redirect
  }

  const handleUpdateStatus = (status: "delivered" | "canceled") => {
    setPendingAction(status);
    setConfirmDialogOpen(true);
  };

  const confirmUpdateStatus = async () => {
    if (!pendingAction) return;

    const status = pendingAction;
    const action = status === "delivered" ? "mark as delivered" : "cancel";

    setIsUpdating(true);
    setConfirmDialogOpen(false);

    try {
      const { success } = await updateOrderStatusApi(order.id, status);
      if (success) {
        toast.success(
          status === "delivered"
            ? "Order marked as delivered"
            : "Order cancelled"
        );
        navigate("/shipper/orders");
      } else {
        throw new Error("Failed to update order status");
      }
    } catch (error) {
      toast.error("Failed to update order. Please try again.");
      console.error("Error updating order:", error);
    } finally {
      setIsUpdating(false);
      setPendingAction(null);
    }
  };

  const cancelUpdateStatus = () => {
    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

  if (order.status !== "active") {
    navigate("/shipper/orders");
    return null;
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <Link
            to='/shipper/orders'
            className='inline-flex items-center underline mb-4'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Active Orders
          </Link>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center'>
              <Truck className='h-6 w-6' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Order {order.id}
              </h1>
              <div className='flex items-center gap-2'>
                <p className='text-gray-600'>{user.hub_id} Hub</p>
                <Badge variant='secondary'>{order.status}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Order Details */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MapPin className='h-5 w-5' />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {customerInfo ? (
                  <>
                    <div>
                      <h4 className='font-medium text-gray-900 mb-2'>
                        Customer Name:
                      </h4>
                      <p className='text-lg font-semibold'>
                        {customerInfo.name}
                      </p>
                    </div>

                    <div>
                      <h4 className='font-medium text-gray-900 mb-2'>
                        Delivery Address:
                      </h4>
                      <div className='bg-gray-50 p-4 rounded-lg'>
                        <p className='text-gray-800'>{customerInfo.address}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>
                      Customer ID:
                    </h4>
                    <p className='text-lg font-semibold'>{order.customerId}</p>
                  </div>
                )}

                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>Hub ID:</h4>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <p className='text-gray-800'>{order.hubId}</p>
                  </div>
                </div>

                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>
                    Order Status:
                  </h4>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <Badge
                      variant={
                        order.status === "active" ? "default" : "secondary"
                      }
                      className='text-sm'
                    >
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className='flex items-center gap-4 text-sm text-gray-600'>
                  <div className='flex items-center gap-1'>
                    <Clock className='h-4 w-4' />
                    <span>Order ID: {order.id}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Phone className='h-4 w-4' />
                    <span>Contact: +84 xxx-xxx-xxx</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Package className='h-5 w-5' />
                  Items to Deliver
                </CardTitle>
                <CardDescription>
                  {orderItems.length} item{orderItems.length !== 1 ? "s" : ""}{" "}
                  in this order
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingItems ? (
                  <div className='flex items-center justify-center py-8'>
                    <div className='text-center'>
                      <Clock className='h-8 w-8 animate-pulse mx-auto mb-2 text-gray-400' />
                      <p className='text-gray-600'>Loading order items...</p>
                    </div>
                  </div>
                ) : orderItems.length > 0 ? (
                  <div className='space-y-4'>
                    {orderItems.map((item, index) => (
                      <div
                        key={index}
                        className='flex items-center gap-4 p-4 border rounded-lg'
                      >
                        <div className='flex-shrink-0'>
                          <img
                            src={
                              getBackendImageUrl(item.image) ||
                              item.image ||
                              "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"
                            }
                            alt={item.product_name}
                            className='w-16 h-16 object-cover rounded-lg'
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop";
                            }}
                          />
                        </div>
                        <div className='flex-1'>
                          <h4 className='font-medium text-gray-900 mb-1'>
                            {item.product_name}
                          </h4>
                          <div className='text-sm text-gray-600 space-y-1'>
                            <p>Product ID: {item.product_id}</p>
                            <p>
                              Quantity:{" "}
                              <span className='font-medium'>
                                {item.quantity}
                              </span>
                            </p>
                            <p>
                              Price:{" "}
                              <span className='font-medium'>
                                ${item.price_at_order_time.toFixed(2)}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold text-lg'>
                            ${item.total.toFixed(2)}
                          </p>
                          <p className='text-sm text-gray-600'>Subtotal</p>
                        </div>
                      </div>
                    ))}

                    <div className='border-t pt-4 mt-4'>
                      <div className='flex justify-between items-center font-bold text-lg'>
                        <span>Order Total:</span>
                        <span className='text-gray-900'>
                          $
                          {orderItems
                            .reduce((sum, item) => sum + item.total, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-8 text-gray-500'>
                    <Package className='h-12 w-12 mx-auto mb-3 text-gray-300' />
                    <p>No items found for this order</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Package className='h-5 w-5' />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  Basic order information from backend
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='p-3 bg-gray-50 rounded-lg'>
                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div>
                        <span className='font-medium'>Order ID:</span>
                        <p className='text-gray-600'>{order.id}</p>
                      </div>
                      <div>
                        <span className='font-medium'>Customer ID:</span>
                        <p className='text-gray-600'>{order.customerId}</p>
                      </div>
                      <div>
                        <span className='font-medium'>Hub ID:</span>
                        <p className='text-gray-600'>{order.hubId}</p>
                      </div>
                      <div>
                        <span className='font-medium'>Status:</span>
                        <p className='text-gray-600'>{order.status}</p>
                      </div>
                    </div>
                  </div>

                  <div className='border-t pt-3'>
                    <div className='flex justify-between items-center font-bold text-lg'>
                      <span>Total Amount:</span>
                      <span className='text-gray-900'>
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Panel */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Delivery Actions</CardTitle>
                <CardDescription>
                  Update the order status after delivery
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Button
                  className='w-full'
                  size='lg'
                  onClick={() => handleUpdateStatus("delivered")}
                  disabled={isUpdating}
                >
                  <CheckCircle className='mr-2 h-5 w-5' />
                  {isUpdating ? "Updating..." : "Mark as Delivered"}
                </Button>

                <Button
                  variant='destructive'
                  className='w-full'
                  onClick={() => handleUpdateStatus("canceled")}
                  disabled={isUpdating}
                >
                  <XCircle className='mr-2 h-5 w-5' />
                  Cancel Order
                </Button>

                <div className='text-xs text-gray-600 space-y-1 pt-2 border-t'>
                  <p>• Confirm delivery address before departing</p>
                  <p>• Verify customer identity at delivery</p>
                  <p>• Update status promptly after delivery</p>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span>Order ID:</span>
                  <span className='font-medium'>{order.id}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Hub:</span>
                  <span className='font-medium'>{order.hubId}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Customer ID:</span>
                  <span className='font-medium'>{order.customerId}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Status:</span>
                  <Badge variant='secondary' className='text-xs'>
                    {order.status}
                  </Badge>
                </div>
                <div className='border-t pt-3'>
                  <div className='flex justify-between font-bold'>
                    <span>Total Value:</span>
                    <span className='text-gray-900'>
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardContent className='p-4 bg-gray-50 border-gray-200'>
                <h4 className='font-medium text-gray-900 mb-2'>Need Help?</h4>
                <p className='text-gray-700 text-sm mb-2'>
                  Contact dispatch for delivery issues
                </p>
                <Button variant='outline' size='sm' className='w-full'>
                  <Phone className='mr-2 h-4 w-4' />
                  Call Support: 1900-xxxx
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === "delivered"
                ? "Mark Order as Delivered"
                : "Cancel Order"}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === "delivered"
                ? `Are you sure you want to mark order ${order?.id} as delivered? This action cannot be undone.`
                : `Are you sure you want to cancel order ${order?.id}? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={cancelUpdateStatus}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant={
                pendingAction === "delivered" ? "default" : "destructive"
              }
              onClick={confirmUpdateStatus}
              disabled={isUpdating}
            >
              {isUpdating
                ? "Updating..."
                : pendingAction === "delivered"
                  ? "Mark as Delivered"
                  : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
