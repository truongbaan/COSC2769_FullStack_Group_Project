// Mock order data for demonstration
export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: "pending" | "active" | "delivered" | "cancelled";
  hubId: string;
  hubName: string;
  orderDate: string;
  deliveryDate?: string;
  shipperId?: string;
}

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerId: "customer_user123",
    customerName: "Alice Johnson",
    customerAddress: "123 Nguyen Hue Street, District 1, Ho Chi Minh City",
    items: [
      {
        productId: "1",
        productName: "Wireless Bluetooth Headphones",
        quantity: 1,
        price: 89.99,
      },
      {
        productId: "7",
        productName: "Bluetooth Speaker",
        quantity: 1,
        price: 65.0,
      },
    ],
    total: 154.99,
    status: "active",
    hubId: "hub_hcm",
    hubName: "Ho Chi Minh",
    orderDate: "2024-01-15T10:30:00Z",
  },
  {
    id: "ORD-002",
    customerId: "customer_bob456",
    customerName: "Bob Chen",
    customerAddress: "456 Le Loi Boulevard, Hai Chau District, Da Nang",
    items: [
      {
        productId: "3",
        productName: "Stainless Steel Water Bottle",
        quantity: 2,
        price: 32.5,
      },
    ],
    total: 65.0,
    status: "active",
    hubId: "hub_dn",
    hubName: "Da Nang",
    orderDate: "2024-01-15T14:20:00Z",
  },
  {
    id: "ORD-003",
    customerId: "customer_charlie789",
    customerName: "Charlie Nguyen",
    customerAddress: "789 Ba Trieu Street, Hoan Kiem District, Hanoi",
    items: [
      {
        productId: "8",
        productName: "Running Shoes",
        quantity: 1,
        price: 95.5,
      },
      {
        productId: "5",
        productName: "Yoga Exercise Mat",
        quantity: 1,
        price: 28.99,
      },
    ],
    total: 124.49,
    status: "active",
    hubId: "hub_hn",
    hubName: "Hanoi",
    orderDate: "2024-01-16T09:15:00Z",
  },
  {
    id: "ORD-004",
    customerId: "customer_diana321",
    customerName: "Diana Tran",
    customerAddress: "321 Dong Khoi Street, District 1, Ho Chi Minh City",
    items: [
      {
        productId: "2",
        productName: "Organic Cotton T-Shirt",
        quantity: 3,
        price: 24.99,
      },
    ],
    total: 74.97,
    status: "active",
    hubId: "hub_hcm",
    hubName: "Ho Chi Minh",
    orderDate: "2024-01-16T16:45:00Z",
  },
  {
    id: "ORD-005",
    customerId: "customer_eva654",
    customerName: "Eva Le",
    customerAddress: "654 Tran Hung Dao Street, Hoan Kiem District, Hanoi",
    items: [
      {
        productId: "4",
        productName: "LED Desk Lamp",
        quantity: 1,
        price: 45.0,
      },
    ],
    total: 45.0,
    status: "active",
    hubId: "hub_hn",
    hubName: "Hanoi",
    orderDate: "2024-01-16T20:30:00Z",
  },
];

export const getOrdersByHub = (hubName: string): Order[] => {
  return mockOrders.filter(
    (order) => order.hubName === hubName && order.status === "active"
  );
};

export const getOrderById = (id: string): Order | undefined => {
  return mockOrders.find((order) => order.id === id);
};

export const updateOrderStatus = (
  orderId: string,
  status: Order["status"]
): boolean => {
  const orderIndex = mockOrders.findIndex((order) => order.id === orderId);
  if (orderIndex !== -1) {
    mockOrders[orderIndex].status = status;
    if (status === "delivered") {
      mockOrders[orderIndex].deliveryDate = new Date().toISOString();
    }
    return true;
  }
  return false;
};
