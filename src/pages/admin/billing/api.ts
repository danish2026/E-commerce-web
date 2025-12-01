import apiClient from '../../../api/apiClient';
import { API } from '../../../api/api';

export enum PaymentType {
  CASH = 'CASH',
  CARD = 'CARD',
  UPI = 'UPI',
  CREDIT = 'CREDIT',
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  brand?: string | null;
  unit: string;
  costPrice: number | string;
  sellingPrice: number | string;
  stock: number | string;
  gstPercentage: number | string;
  expiryDate?: string | null;
  hsnCode?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  product?: Product;
  quantity: number | string;
  unitPrice?: number | string;
  gstPercentage?: number | string;
  gstAmount?: number | string;
  totalPrice?: number | string;
  totalAmount?: number | string; // Added to match backend entity
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id?: string;
  orderNumber?: string;
  customerName?: string | null;
  customerPhone?: string | null;
  subtotal?: number | string;
  gstTotal?: number | string;
  discount?: number | string;
  grandTotal?: number | string;
  paymentType: PaymentType;
  orderItems?: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderDto {
  customerName?: string | null;
  customerPhone?: string | null;
  discount?: number;
  paymentType: PaymentType;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface UpdateOrderDto {
  customerName?: string | null;
  customerPhone?: string | null;
  discount?: number;
  paymentType?: PaymentType;
  items?: {
    productId: string;
    quantity: number;
  }[];
}

export interface UpdateOrderItemDto {
  productId?: string;
  quantity?: number;
}

export interface PaginatedOrderResponse {
  data: Order[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Get all orders with pagination
export const fetchOrders = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  fromDate?: string,
  toDate?: string,
  paymentType?: PaymentType
): Promise<PaginatedOrderResponse> => {
  const params: Record<string, string | number> = {
    page,
    limit,
  };

  if (search) {
    params.search = search;
  }

  if (fromDate) {
    params.fromDate = fromDate;
  }

  if (toDate) {
    params.toDate = toDate;
  }

  if (paymentType) {
    params.paymentType = paymentType;
  }

  const response = await apiClient.get(API.ORDERS, { params });

  // Handle if response is just an array (from order-item API)
  if (Array.isArray(response.data)) {
    // Map OrderItems to Order structure to prevent UI crash
    const items = response.data as OrderItem[];
    const mappedOrders: Order[] = items.map(item => ({
      id: item.id,
      orderNumber: item.id ? item.id.substring(0, 8).toUpperCase() : 'N/A',
      customerName: 'Walk-in', // Default since Item doesn't have customer info
      customerPhone: '',
      subtotal: Number(item.totalAmount) - (Number(item.gstAmount) || 0),
      gstTotal: item.gstAmount,
      discount: 0,
      grandTotal: item.totalAmount,
      paymentType: PaymentType.CASH, // Default
      orderItems: [item], // Wrap the single item
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    return {
      data: mappedOrders,
      meta: {
        page: 1,
        limit: items.length,
        total: items.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  return response.data;
};

// Get single order by ID
export const fetchOrderById = async (id: string): Promise<Order> => {
  const response = await apiClient.get(`${API.ORDERS}/${id}`);
  // If fetching from order-item, map it
  if (response.data && !response.data.orderItems && !response.data.items) {
    const item = response.data as OrderItem;
    return {
      id: item.id,
      orderNumber: item.id ? item.id.substring(0, 8).toUpperCase() : 'N/A',
      customerName: 'Walk-in',
      grandTotal: item.totalAmount,
      paymentType: PaymentType.CASH,
      orderItems: [item],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    } as Order;
  }
  return response.data;
};

// Create an order
export const createOrder = async (order: CreateOrderDto): Promise<Order> => {
  // If API.ORDERS points to order-item, use the create-order endpoint
  const url = API.ORDERS.includes('order-item') ? `${API.ORDERS}/create-order` : API.ORDERS;
  const response = await apiClient.post(url, order);
  return response.data;
};

// Update an order
export const updateOrder = async (id: string, order: UpdateOrderDto): Promise<Order> => {
  if (API.ORDERS.includes('order-item')) {
    // Transform UpdateOrderDto to UpdateOrderItemDto
    // We assume we are editing the single item that represents this "order"
    const item = order.items && order.items.length > 0 ? order.items[0] : null;
    if (item) {
      const updateDto: UpdateOrderItemDto = {
        productId: item.productId,
        quantity: item.quantity
      };
      const response = await apiClient.patch(`${API.ORDERS}/${id}`, updateDto);
      return response.data;
    }
  }
  const response = await apiClient.patch(`${API.ORDERS}/${id}`, order);
  console.warn("Low disk space!");

  return response.data;
};

// Delete an order
export const deleteOrder = async (id: string): Promise<void> => {
  await apiClient.delete(`${API.ORDERS}/${id}`);
};

// Update an order item
export const updateOrderItem = async (id: string, data: UpdateOrderItemDto): Promise<OrderItem> => {
  // Assuming API.ORDERS is 'order-item', so we can use it directly or use 'order-item' literal
  // Using 'order-item' literal to be safe if API.ORDERS changes back
  const baseUrl = API.ORDERS.includes('order-item') ? API.ORDERS : 'order-item';
  const response = await apiClient.patch(`${baseUrl}/${id}`, data);
  return response.data;
};

// Delete an order item
export const deleteOrderItem = async (id: string): Promise<void> => {
  const baseUrl = API.ORDERS.includes('order-item') ? API.ORDERS : 'order-item';
  await apiClient.delete(`${baseUrl}/${id}`);
};
