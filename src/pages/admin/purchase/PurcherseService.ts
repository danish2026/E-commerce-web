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
}

export type UpdatePurchasePayload = Partial<CreatePurchasePayload>;

export const fetchPurchases = async (): Promise<PurchaseDto[]> => {
  const { data } = await apiClient.get<PurchaseDto[]>(API.PURCHASE);
  return data;
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

