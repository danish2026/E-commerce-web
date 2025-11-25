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
  return response.data;
};

// Get single order by ID
export const fetchOrderById = async (id: string): Promise<Order> => {
  const response = await apiClient.get(`${API.ORDERS}/${id}`);
  return response.data;
};

// Create an order
export const createOrder = async (order: CreateOrderDto): Promise<Order> => {
  const response = await apiClient.post(API.ORDERS, order);
  return response.data;
};

// Update an order
export const updateOrder = async (id: string, order: UpdateOrderDto): Promise<Order> => {
  const response = await apiClient.patch(`${API.ORDERS}/${id}`, order);
  return response.data;
};

// Delete an order
export const deleteOrder = async (id: string): Promise<void> => {
  await apiClient.delete(`${API.ORDERS}/${id}`);
};
