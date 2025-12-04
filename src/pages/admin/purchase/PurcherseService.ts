import axios from 'axios';
import apiClient from '../../../api/apiClient';
import { API } from '../../../api/api';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
}

export interface PurchaseDto {
  id: string;
  supplier: string;
  buyer: string;
  gst: number;
  amount: number;
  quantity: number;
  paymentStatus: PaymentStatus;
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePurchasePayload {
  supplier: string;
  buyer: string;
  gst: number;
  amount: number;
  quantity: number;
  paymentStatus: PaymentStatus;
  dueDate: string;
  totalAmount?: number;
}

export type UpdatePurchasePayload = Partial<CreatePurchasePayload>;

export interface PaginatedPurchaseResponse {
  data: PurchaseDto[];
  total: number;
  page: number;
  limit: number;
}

export const fetchPurchases = async (
  search?: string,
  fromDate?: string,
  toDate?: string,
  paymentStatus?: PaymentStatus,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedPurchaseResponse> => {
  const params: Record<string, string | number> = {};
  
  if (search) {
    params.search = search;
  }
  
  if (fromDate) {
    params.fromDate = fromDate;
  }
  
  if (toDate) {
    params.toDate = toDate;
  }
  
  if (paymentStatus) {
    params.paymentStatus = paymentStatus;
  }
  
  params.page = page;
  params.limit = limit;
  
  const { data } = await apiClient.get<PurchaseDto[] | PaginatedPurchaseResponse>(
    API.PURCHASE, 
    { params }
  );
  
  // Handle both paginated and non-paginated responses
  if (Array.isArray(data)) {
    return {
      data,
      total: data.length,
      page: 1,
      limit: data.length,
    };
  }
  
  return data as PaginatedPurchaseResponse;
};

export const createPurchase = async (
  payload: CreatePurchasePayload
): Promise<PurchaseDto> => {
  const { data } = await apiClient.post<PurchaseDto>(API.PURCHASE, payload);
  return data;
};

export const updatePurchase = async (
  id: string,
  payload: UpdatePurchasePayload
): Promise<PurchaseDto> => {
  const { data } = await apiClient.patch<PurchaseDto>(
    `${API.PURCHASE}/${id}`,
    payload
  );
  return data;
};

export const deletePurchase = async (id: string): Promise<void> => {
  await apiClient.delete(`${API.PURCHASE}/${id}`);
};

export const mapPaymentStatusToEnum = (payment: string): PaymentStatus => {
  const mapping: Record<string, PaymentStatus> = {
    Paid: PaymentStatus.PAID,
    Pending: PaymentStatus.PENDING,
    Partial: PaymentStatus.PARTIAL,
    Overdue: PaymentStatus.OVERDUE,
  };
  return mapping[payment] || PaymentStatus.PENDING;
};

export const mapPaymentStatusFromEnum = (
  paymentStatus: PaymentStatus
): string => {
  const mapping: Record<PaymentStatus, string> = {
    [PaymentStatus.PAID]: 'Paid',
    [PaymentStatus.PENDING]: 'Pending',
    [PaymentStatus.PARTIAL]: 'Partial',
    [PaymentStatus.OVERDUE]: 'Overdue',
  };
  return mapping[paymentStatus] || 'Pending';
};

export const getSuppliers = async (): Promise<string[]> => {
  const { data } = await apiClient.get<string[]>(`${API.PURCHASE}/suppliers/list`);
  return data;
};

export const getBuyers = async (): Promise<string[]> => {
  const { data } = await apiClient.get<string[]>(`${API.PURCHASE}/buyers/list`);
  return data;
};

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage =
      (typeof error.response?.data === 'string' && error.response.data) ||
      (error.response?.data?.message as string) ||
      (error.response?.data?.error as string);
    return responseMessage || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

