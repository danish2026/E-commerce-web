import axios from 'axios';
import apiClient from '../../../api/apiClient';
import { API } from '../../../api/api';

export interface PurchaseItemDto {
  id: string;
  item: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePurchaseItemPayload {
  item: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
}

export type UpdatePurchaseItemPayload = Partial<CreatePurchaseItemPayload>;

export interface PaginatedPurchaseItemResponse {
  data: PurchaseItemDto[];
  total: number;
  page: number;
  limit: number;
}

export const fetchPurchaseItems = async (
  search?: string,
  fromDate?: string,
  toDate?: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedPurchaseItemResponse> => {
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
  
  params.page = page;
  params.limit = limit;
  
  const { data } = await apiClient.get<PurchaseItemDto[] | PaginatedPurchaseItemResponse>(
    API.PURCHASE_ITEM, 
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
  
  return data as PaginatedPurchaseItemResponse;
};

export const createPurchaseItem = async (
  payload: CreatePurchaseItemPayload
): Promise<PurchaseItemDto> => {
  const { data } = await apiClient.post<PurchaseItemDto>(API.PURCHASE_ITEM, payload);
  return data;
};

export const updatePurchaseItem = async (
  id: string,
  payload: UpdatePurchaseItemPayload
): Promise<PurchaseItemDto> => {
  const { data } = await apiClient.put<PurchaseItemDto>(
    `${API.PURCHASE_ITEM}/${id}`,
    payload
  );
  return data;
};

export const deletePurchaseItem = async (id: string): Promise<void> => {
  await apiClient.delete(`${API.PURCHASE_ITEM}/${id}`);
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

