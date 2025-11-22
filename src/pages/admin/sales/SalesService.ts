import axios from 'axios';
import apiClient from '../../../api/apiClient';
import { API } from '../../../api/api';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
}

export interface SalesDto {
  id: string;
  customer: string;
  seller: string;
  gst: number;
  amount: number;
  quantity: number;
  paymentStatus: PaymentStatus;
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSalesPayload {
  customer: string;
  seller: string;
  gst: number;
  amount: number;
  quantity: number;
  paymentStatus: PaymentStatus;
  dueDate: string;
}

export type UpdateSalesPayload = Partial<CreateSalesPayload>;

export interface PaginatedSalesResponse {
  data: SalesDto[];
  total: number;
  page: number;
  limit: number;
}

export const fetchSales = async (
  search?: string,
  fromDate?: string,
  toDate?: string,
  paymentStatus?: PaymentStatus,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedSalesResponse> => {
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
  
  const { data } = await apiClient.get<SalesDto[] | PaginatedSalesResponse>(
    API.SALES, 
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
  
  return data as PaginatedSalesResponse;
};

export const createSales = async (
  payload: CreateSalesPayload
): Promise<SalesDto> => {
  const { data } = await apiClient.post<SalesDto>(API.SALES, payload);
  return data;
};

export const updateSales = async (
  id: string,
  payload: UpdateSalesPayload
): Promise<SalesDto> => {
  const { data } = await apiClient.patch<SalesDto>(
    `${API.SALES}/${id}`,
    payload
  );
  return data;
};

export const deleteSales = async (id: string): Promise<void> => {
  await apiClient.delete(`${API.SALES}/${id}`);
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



