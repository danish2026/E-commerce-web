import axios from 'axios';
import apiClient from '../../../api/apiClient';
import { API } from '../../../api/api';

export interface ProductDto {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  brand?: string | null;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  gstPercentage: number;
  expiryDate?: string | null;
  hsnCode?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  categoryId: string;
  brand?: string | null;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  gstPercentage: number;
  expiryDate?: string | null;
  hsnCode?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedProductResponse {
  data: ProductDto[];
  meta: PaginationMeta;
}

export interface CategoryDto {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const fetchProducts = async (
  search?: string,
  fromDate?: string,
  toDate?: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedProductResponse> => {
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
  
  const { data } = await apiClient.get<PaginatedProductResponse | ProductDto[]>(
    API.PRODUCT, 
    { params }
  );
  
  // Handle legacy array responses (should not happen with new API)
  if (Array.isArray(data)) {
    return {
      data,
      meta: {
        page: 1,
        limit: data.length,
        total: data.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
  
  // Ensure the response has the expected structure
  if (data && 'data' in data && 'meta' in data) {
    return data;
  }
  
  // Fallback (should not happen)
  return data as PaginatedProductResponse;
};

export const createProduct = async (
  payload: CreateProductPayload
): Promise<ProductDto> => {
  const { data } = await apiClient.post<ProductDto>(API.PRODUCT, payload);
  return data;
};

export const updateProduct = async (
  id: string,
  payload: UpdateProductPayload
): Promise<ProductDto> => {
  const { data } = await apiClient.patch<ProductDto>(
    `${API.PRODUCT}/${id}`,
    payload
  );
  return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error('Product ID is required');
  }
  
  const url = `${API.PRODUCT}/${id}`;
  console.log('Delete request URL:', url);
  console.log('Base URL:', API.BASEURL);
  console.log('Full URL will be:', `${API.BASEURL}${url}`);
  
  try {
    await apiClient.delete(url);
    console.log('Delete request successful');
  } catch (error) {
    console.error('Delete request failed:', error);
    throw error;
  }
};

export const fetchCategories = async (): Promise<CategoryDto[]> => {
  const { data } = await apiClient.get<CategoryDto[]>(API.CATEGORY);
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




