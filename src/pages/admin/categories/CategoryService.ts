import axios from 'axios';
import apiClient from '../../../api/apiClient';
import { API } from '../../../api/api';

export interface CategoryDto {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string | null;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export interface PaginatedCategoryResponse {
  data: CategoryDto[];
  total: number;
  page: number;
  limit: number;
}

export const fetchCategories = async (
  search?: string,
  fromDate?: string,
  toDate?: string
): Promise<CategoryDto[]> => {
  const params: Record<string, string> = {};
  
  if (search) {
    params.search = search;
  }
  
  if (fromDate) {
    params.fromDate = fromDate;
  }
  
  if (toDate) {
    params.toDate = toDate;
  }
  
  const { data } = await apiClient.get<CategoryDto[]>(
    API.CATEGORIES, 
    { params }
  );
  
  return data;
};

export const createCategory = async (
  payload: CreateCategoryPayload
): Promise<CategoryDto> => {
  const { data } = await apiClient.post<CategoryDto>(API.CATEGORIES, payload);
  return data;
};

export const updateCategory = async (
  id: string,
  payload: UpdateCategoryPayload
): Promise<CategoryDto> => {
  const { data } = await apiClient.patch<CategoryDto>(
    `${API.CATEGORIES}/${id}`,
    payload
  );
  return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error('Category ID is required');
  }
  
  const url = `${API.CATEGORIES}/${id}`;
  await apiClient.delete(url);
};

export const getCategoryById = async (id: string): Promise<CategoryDto> => {
  if (!id) {
    throw new Error('Category ID is required');
  }
  
  const { data } = await apiClient.get<CategoryDto>(`${API.CATEGORIES}/${id}`);
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

