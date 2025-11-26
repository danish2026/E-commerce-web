import apiClient from '../../../api/apiClient';
import { API } from '../../../api/api';

export interface EmployeeDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  roleName?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmployeeDto {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
}

export interface UpdateEmployeeDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  roleName?: string;
  password?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export const getEmployees = async (
  search?: string,
  fromDate?: string,
  toDate?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<EmployeeDto>> => {
  const params: any = {};
  
  if (search) params.search = search;
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  if (page) params.page = page;
  if (pageSize) params.pageSize = pageSize;

  const response = await apiClient.get('users', { params });
  
  // Handle both array and paginated response
  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      meta: {
        total: response.data.length,
        page: 1,
        pageSize: response.data.length,
      },
    };
  }
  
  return response.data;
};

export const getEmployeeById = async (id: string): Promise<EmployeeDto> => {
  const response = await apiClient.get(`users/${id}`);
  return response.data;
};

export const createEmployee = async (data: CreateEmployeeDto): Promise<EmployeeDto> => {
  const response = await apiClient.post('users', {
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    role: 'SUPER_ADMIN', // Default enum value
    roleName: data.role, // Store the role name from permissions module
  });
  return response.data;
};

export const updateEmployee = async (id: string, data: UpdateEmployeeDto): Promise<EmployeeDto> => {
  const response = await apiClient.put(`users/${id}`, data);
  return response.data;
};

export const deleteEmployee = async (id: string): Promise<void> => {
  await apiClient.delete(`users/${id}`);
};

export const getRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get('permissions/roles');
  return response.data;
};

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getApiErrorMessage = (error: any, defaultMessage: string): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return defaultMessage;
};

