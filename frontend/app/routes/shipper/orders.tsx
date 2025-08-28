import type { Route } from "./+types/orders";
import { useAuth } from "~/lib/auth";
import { Link, useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  fetchOrdersByHub,
  fetchOrderItemsApi,
  updateOrderStatusApi,
} from "~/lib/api";
import type { OrderItemDetail } from "~/lib/api";
import { getBackendImageUrl } from "~/lib/utils";
import { toast } from "sonner";
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  XCircle,
} from "~/components/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Active Orders - Shipper Dashboard" },
    {
      name: "description",
      content: "Manage your delivery orders on Lazada Lite",
    },
  ];
}

export default function ShipperOrders() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItemCounts, setOrderItemCounts] = useState<{
    [orderId: string]: number;
  }>({});
  const [orderItems, setOrderItems] = useState<{
    [orderId: string]: {
      items: OrderItemDetail[];
      customer: { name: string; address: string };
      loading: boolean;
    };
  }>({});
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    orderId: string;
    action: "delivered" | "cancelled";
  }>({ open: false, orderId: "", action: "delivered" });

  // redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (user?.role !== "shipper") {
      navigate("/");
      return;
    }

    // get orders for this shipper's hub
    (async () => {
      try {
        const hubOrders = await fetchOrdersByHub();
        setOrders(hubOrders);

        const itemCounts: { [orderId: string]: number } = {};
        await Promise.all(
          hubOrders.map(async (order) => {
            try {
              const orderItemsData = await fetchOrderItemsApi(order.id);
              itemCounts[order.id] = orderItemsData.count;
            } catch (error) {
              console.error(
                `Failed to fetch items for order ${order.id}:`,
                error
              );
              itemCounts[order.id] = 0;
            }
          })
        );
        setOrderItemCounts(itemCounts);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setOrders([]);
      }
    })();
  }, [user, navigate]);

  // Handle expanding orders to show items
  const toggleOrderExpansion = async (orderId: string) => {
    if (expandedOrders.has(orderId)) {
      // Collapse
      const newExpanded = new Set(expandedOrders);
      newExpanded.delete(orderId);
      setExpandedOrders(newExpanded);
    } else {
      // expand and fetch items if not already loaded
      const newExpanded = new Set(expandedOrders);
      newExpanded.add(orderId);
      setExpandedOrders(newExpanded);

      if (!orderItems[orderId]) {
        setOrderItems((prev) => ({
          ...prev,
          [orderId]: {
            items: [],
            customer: { name: "", address: "" },
            loading: true,
          },
        }));

        try {
          const orderItemsData = await fetchOrderItemsApi(orderId);
          setOrderItems((prev) => ({
            ...prev,
            [orderId]: {
              items: orderItemsData.items,
              customer: orderItemsData.customer,
              loading: false,
            },
          }));
        } catch (error) {
          console.error(`Failed to fetch items for order ${orderId}:`, error);
          toast.error("Failed to load order items");
          setOrderItems((prev) => ({
            ...prev,
            [orderId]: {
              items: [],
              customer: { name: "", address: "" },
              loading: false,
            },
          }));
        }
      }
    }
  };

  // handle status update
  const handleStatusUpdate = (
    orderId: string,
    action: "delivered" | "cancelled"
  ) => {
    setConfirmDialog({ open: true, orderId, action });
  };

  const confirmStatusUpdate = async () => {
    const { orderId, action } = confirmDialog;
    setConfirmDialog({ open: false, orderId: "", action: "delivered" });

    const newUpdatingStatus = new Set(updatingStatus);
    newUpdatingStatus.add(orderId);
    setUpdatingStatus(newUpdatingStatus);

    try {
      const { success } = await updateOrderStatusApi(orderId, action);
      if (success) {
        toast.success(
          action === "delivered"
            ? "Order marked as delivered"
            : "Order cancelled"
        );

        // remove the order from the list
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
        setOrderItems((prev) => {
          const newItems = { ...prev };
          delete newItems[orderId];
          return newItems;
        });
        setOrderItemCounts((prev) => {
          const newCounts = { ...prev };
          delete newCounts[orderId];
          return newCounts;
        });

        // remove from expanded if it was expanded
        const newExpanded = new Set(expandedOrders);
        newExpanded.delete(orderId);
        setExpandedOrders(newExpanded);
      } else {
        throw new Error("Failed to update order status");
      }
    } catch (error) {
      toast.error("Failed to update order. Please try again.");
      console.error("Error updating order:", error);
    } finally {
      const newUpdatingStatus = new Set(updatingStatus);
      newUpdatingStatus.delete(orderId);
      setUpdatingStatus(newUpdatingStatus);
    }
  };

  const cancelStatusUpdate = () => {
    setConfirmDialog({ open: false, orderId: "", action: "delivered" });
  };

  if (!user || user.role !== "shipper") {
    return null;
  }

  const totalOrders = orders.length;
  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.orderDate);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;

  const totalValue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center'>
              <Truck className='h-6 w-6' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Active Orders
              </h1>
              <p className='text-gray-600'>{user.hub_id} Distribution Hub</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Orders
              </CardTitle>
              <Package className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalOrders}</div>
              <p className='text-xs text-muted-foreground'>
                Ready for delivery
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Today's Orders
              </CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{todayOrders}</div>
              <p className='text-xs text-muted-foreground'>Placed today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Value</CardTitle>
              <CheckCircle className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>${totalValue.toFixed(2)}</div>
              <p className='text-xs text-muted-foreground'>Orders to deliver</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className='text-center py-12'>
              <div className='text-gray-400 mb-4'>
                <Truck className='h-16 w-16 mx-auto' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No active orders
              </h3>
              <p className='text-gray-600 mb-6'>
                There are currently no orders waiting for delivery in your hub (
                {user.hub_id}). Check back later for new orders.
              </p>
              <Button onClick={() => window.location.reload()}>
                Refresh Orders
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl font-semibold'>Delivery Queue</h2>
              <div className='text-sm text-gray-600'>
                {orders.length} order{orders.length !== 1 ? "s" : ""} pending
                delivery
              </div>
            </div>

            <div className='space-y-4'>
              {orders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                const orderData = orderItems[order.id];
                const isUpdating = updatingStatus.has(order.id);

                return (
                  <Card
                    key={order.id}
                    className='hover:shadow-md transition-shadow'
                  >
                    <CardContent className='p-6'>
                      <div className='flex justify-between items-start mb-4'>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-3'>
                            <h3 className='font-semibold text-lg'>
                              Order {order.id}
                            </h3>
                            <Badge
                              variant={
                                order.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {order.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className='text-gray-600 flex items-center gap-2'>
                            <MapPin className='h-4 w-4' />
                            Customer ID: {order.customerId} • {user.hub_id} Hub
                          </p>
                        </div>
                        <div className='text-right'>
                          <div className='text-xl font-bold text-gray-900'>
                            ${order.total.toFixed(2)}
                          </div>
                          <div className='text-sm text-gray-600'>
                            {orderItemCounts[order.id] !== undefined
                              ? `${orderItemCounts[order.id]} item${orderItemCounts[order.id] !== 1 ? "s" : ""}`
                              : "Loading items..."}
                          </div>
                        </div>
                      </div>

                      {/* quick info section */}
                      <div className='mb-4'>
                        <div className='text-sm text-gray-700 bg-gray-50 p-3 rounded space-y-1'>
                          <div className='flex justify-between'>
                            <span>Customer ID: {order.customerId}</span>
                            <span>Hub: {order.hubId}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='flex items-center gap-1'>
                              <Package className='h-4 w-4' />
                              Items: {orderItemCounts[order.id] || 0}
                            </span>
                            <span>Total: ${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* expandable order details */}
                      {isExpanded && (
                        <div className='mb-4 border rounded-lg p-4 bg-white'>
                          {orderData?.loading ? (
                            <div className='flex items-center justify-center py-8'>
                              <div className='text-center'>
                                <Clock className='h-8 w-8 animate-pulse mx-auto mb-2 text-gray-400' />
                                <p className='text-gray-600'>
                                  Loading order items...
                                </p>
                              </div>
                            </div>
                          ) : orderData?.items.length > 0 ? (
                            <div className='space-y-4'>
                              {/* Customer Info */}
                              {orderData.customer.name && (
                                <div className='border-b pb-3 mb-3'>
                                  <h4 className='font-medium text-gray-900 mb-1'>
                                    Customer Information
                                  </h4>
                                  <div className='text-sm text-gray-600'>
                                    <p>
                                      <strong>Name:</strong>{" "}
                                      {orderData.customer.name}
                                    </p>
                                    <p>
                                      <strong>Address:</strong>{" "}
                                      {orderData.customer.address}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Order Items */}
                              <div>
                                <h4 className='font-medium text-gray-900 mb-3'>
                                  Items to Deliver
                                </h4>
                                <div className='space-y-3'>
                                  {orderData.items.map((item, index) => (
                                    <div
                                      key={index}
                                      className='flex items-center gap-3 p-3 border rounded-lg'
                                    >
                                      <div className='flex-shrink-0'>
                                        <img
                                          src={
                                            getBackendImageUrl(item.image) ||
                                            item.image ||
                                            "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop"
                                          }
                                          alt={item.product_name}
                                          className='w-12 h-12 object-cover rounded'
                                          onError={(e) => {
                                            e.currentTarget.src =
                                              "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop";
                                          }}
                                        />
                                      </div>
                                      <div className='flex-1 min-w-0'>
                                        <h5 className='font-medium text-sm text-gray-900 truncate'>
                                          {item.product_name}
                                        </h5>
                                        <div className='text-xs text-gray-600 space-y-1'>
                                          <p>
                                            Qty: {item.quantity} • $
                                            {item.price_at_order_time.toFixed(
                                              2
                                            )}{" "}
                                            each
                                          </p>
                                        </div>
                                      </div>
                                      <div className='text-right'>
                                        <p className='font-medium text-sm'>
                                          ${item.total.toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className='text-center py-4 text-gray-500'>
                              <Package className='h-8 w-8 mx-auto mb-2 text-gray-300' />
                              <p>No items found for this order</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* action buttons */}
                      <div className='flex justify-between items-center pt-3 border-t gap-3'>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => toggleOrderExpansion(order.id)}
                            className='flex items-center gap-1'
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className='h-4 w-4' />
                                Hide Items
                              </>
                            ) : (
                              <>
                                <ChevronDown className='h-4 w-4' />
                                View Items
                              </>
                            )}
                          </Button>

                          <Button variant='outline' size='sm' disabled={true}>
                            <Link to={`/shipper/orders/${order.id}`}>
                              Full Details
                            </Link>
                          </Button>
                        </div>

                        <div className='flex items-center gap-2'>
                          <Button
                            size='sm'
                            onClick={() =>
                              handleStatusUpdate(order.id, "delivered")
                            }
                            disabled={isUpdating}
                            className='bg-green-600 hover:bg-green-700'
                          >
                            {isUpdating ? (
                              <Clock className='h-4 w-4 animate-pulse' />
                            ) : (
                              <CheckCircle className='h-4 w-4' />
                            )}
                            Delivered
                          </Button>

                          <Button
                            size='sm'
                            variant='destructive'
                            onClick={() =>
                              handleStatusUpdate(order.id, "cancelled")
                            }
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Clock className='h-4 w-4 animate-pulse' />
                            ) : (
                              <XCircle className='h-4 w-4' />
                            )}
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* shipper info */}
        <div className='mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6'>
          <h3 className='font-semibold text-gray-900 mb-3'>
            📦 Delivery Guidelines
          </h3>
          <ul className='text-gray-700 text-sm space-y-2'>
            <li>• Always verify the delivery address before departing</li>
            <li>• Confirm customer identity before handing over packages</li>
            <li>
              • Take photos of delivered packages when customer is unavailable
            </li>
            <li>• Contact customers if you encounter delivery issues</li>
            <li>• Update order status promptly after each delivery</li>
          </ul>
        </div>

        {/* confirmation dialog */}
        <Dialog open={confirmDialog.open} onOpenChange={cancelStatusUpdate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {confirmDialog.action === "delivered"
                  ? "Mark as Delivered"
                  : "Cancel Order"}
              </DialogTitle>
              <DialogDescription>
                {confirmDialog.action === "delivered"
                  ? "Are you sure you want to mark this order as delivered? This action cannot be undone."
                  : "Are you sure you want to cancel this order? This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant='outline' onClick={cancelStatusUpdate}>
                Cancel
              </Button>
              <Button
                onClick={confirmStatusUpdate}
                className={
                  confirmDialog.action === "delivered"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
                variant={
                  confirmDialog.action === "delivered"
                    ? "default"
                    : "destructive"
                }
              >
                {confirmDialog.action === "delivered"
                  ? "Mark Delivered"
                  : "Cancel Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
