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
  discount?: number | string;
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
  itemCount?: number; // Number of items in the order
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderDto {
  customerName?: string | null;
  customerPhone?: string | null;
  discounts?: {
    amount: number;
  }[];
  paymentType: PaymentType;
  items: {
    productId: string;
    quantity: number;
    discount?: number;
  }[];
}

export interface UpdateOrderDto {
  customerName?: string | null;
  customerPhone?: string | null;
  discounts?: {
    amount: number;
  }[];
  paymentType?: PaymentType;
  items?: {
    productId: string;
    quantity: number;
    discount?: number;
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

// Get all orders with pagination (grouped by order)
export const fetchOrders = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  fromDate?: string,
  toDate?: string,
  paymentType?: PaymentType,
  minSubtotal?: number,
  maxSubtotal?: number
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

  if (minSubtotal !== undefined) {
    params.minSubtotal = minSubtotal;
  }

  if (maxSubtotal !== undefined) {
    params.maxSubtotal = maxSubtotal;
  }

  // Use the grouped endpoint
  const baseUrl = API.ORDERS.includes('order-item') ? API.ORDERS : 'order-item';
  const response = await apiClient.get(`${baseUrl}/grouped`, { params });

  // Map grouped orders to Order format
  if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.meta) {
    const groupedOrders = response.data.data;
    const mappedOrders: Order[] = groupedOrders.map((grouped: any) => ({
      id: grouped.id || '',
      orderNumber: grouped.orderNumber || 'N/A',
      customerName: grouped.customerName || 'Walk-in',
      customerPhone: grouped.customerPhone || '',
      subtotal: grouped.subtotal || 0,
      gstTotal: grouped.gstTotal || 0,
      discount: grouped.discount || 0,
      grandTotal: grouped.grandTotal || 0,
      paymentType: grouped.paymentType || PaymentType.CASH,
      orderItems: grouped.items || [],
      itemCount: grouped.itemCount || 0,
      createdAt: grouped.createdAt,
      updatedAt: grouped.createdAt,
    } as Order));
    
    return {
      data: mappedOrders,
      meta: response.data.meta
    };
  }

  // Fallback to old format if needed
  return {
    data: [],
    meta: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    }
  };
};

// Get all items for a specific order group
export const fetchOrderItems = async (
  customerName: string | null,
  customerPhone: string | null,
  paymentType: PaymentType | null,
  createdAt: string
): Promise<OrderItem[]> => {
  const baseUrl = API.ORDERS.includes('order-item') ? API.ORDERS : 'order-item';
  const params: Record<string, string> = {
    createdAt: encodeURIComponent(createdAt),
  };
  
  if (customerName === null) {
    params.customerName = 'null';
  } else {
    params.customerName = encodeURIComponent(customerName);
  }
  
  if (customerPhone === null) {
    params.customerPhone = 'null';
  } else {
    params.customerPhone = encodeURIComponent(customerPhone);
  }
  
  if (paymentType === null) {
    params.paymentType = 'null';
  } else {
    params.paymentType = encodeURIComponent(paymentType);
  }
  
  const response = await apiClient.get(`${baseUrl}/grouped/items`, { params });
  
  return response.data || [];
};

// Get single order by ID
export const fetchOrderById = async (id: string): Promise<Order> => {
  const response = await apiClient.get(`${API.ORDERS}/${id}`);
  // If fetching from order-item, map it
  if (response.data && !response.data.orderItems && !response.data.items) {
    const item = response.data as OrderItem;
    const anyItem: any = item;
    return {
      id: item.id,
      orderNumber: item.id ? item.id.substring(0, 8).toUpperCase() : 'N/A',
      customerName: typeof anyItem.customerName !== 'undefined' ? anyItem.customerName : 'Walk-in',
      customerPhone: typeof anyItem.customerPhone !== 'undefined' ? anyItem.customerPhone : null,
      grandTotal: item.totalAmount,
      paymentType: typeof anyItem.paymentType !== 'undefined' && anyItem.paymentType !== null ? anyItem.paymentType : PaymentType.CASH,
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
    // Build update DTO including any top-level order fields that may be present
    const updateDto: any = {};
    if (item) {
      if (typeof item.productId !== 'undefined') updateDto.productId = item.productId;
      if (typeof item.quantity !== 'undefined') updateDto.quantity = item.quantity;
    }

    if (typeof (order as any).customerName !== 'undefined') {
      updateDto.customerName = (order as any).customerName;
    }
    if (typeof (order as any).customerPhone !== 'undefined') {
      updateDto.customerPhone = (order as any).customerPhone;
    }
    if (typeof (order as any).discounts !== 'undefined') {
      updateDto.discounts = (order as any).discounts;
    } else if (typeof (order as any).discount !== 'undefined') {
      // Backward compatibility: convert single discount to array
      updateDto.discounts = (order as any).discount > 0 ? [{ amount: (order as any).discount }] : [];
    }
    if (typeof (order as any).paymentType !== 'undefined') {
      updateDto.paymentType = (order as any).paymentType;
    }

    const response = await apiClient.patch(`${API.ORDERS}/${id}`, updateDto);
    return response.data;
  }
  const response = await apiClient.patch(`${API.ORDERS}/${id}`, order);
  console.warn("Low disk space!");

  return response.data;
};

// Delete an order (deletes all items in the order group)
export const deleteOrder = async (
  id: string,
  customerName?: string | null,
  customerPhone?: string | null,
  paymentType?: PaymentType | null,
  createdAt?: string
): Promise<void> => {
  // If we have order group info, delete the entire group
  if (customerName !== undefined && customerPhone !== undefined && paymentType !== undefined && createdAt) {
    const baseUrl = API.ORDERS.includes('order-item') ? API.ORDERS : 'order-item';
    const params: Record<string, string> = {
      createdAt: encodeURIComponent(createdAt),
    };
    
    if (customerName === null) {
      params.customerName = 'null';
    } else {
      params.customerName = encodeURIComponent(customerName);
    }
    
    if (customerPhone === null) {
      params.customerPhone = 'null';
    } else {
      params.customerPhone = encodeURIComponent(customerPhone);
    }
    
    if (paymentType === null) {
      params.paymentType = 'null';
    } else {
      params.paymentType = encodeURIComponent(paymentType);
    }
    
    await apiClient.delete(`${baseUrl}/grouped/order`, { params });
  } else {
    // Fallback to single item delete
    await apiClient.delete(`${API.ORDERS}/${id}`);
  }
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
