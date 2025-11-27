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

// Map role name from permissions module to Role enum value
const mapRoleToEnum = (roleName: string): string => {
  if (!roleName) {
    console.warn('No role name provided, defaulting to SALES_MAN');
    return 'SALES_MAN';
  }
  
  // Normalize the role name: trim, uppercase and replace spaces with underscores
  const normalized = roleName.trim().toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_');
  
  // Valid enum values
  const validRoles = ['SUPER_ADMIN', 'SALES_MANAGER', 'SALES_MAN'];
  
  // Check if normalized value matches a valid enum exactly
  if (validRoles.includes(normalized)) {
    console.log(`Role mapping: "${roleName}" -> "${normalized}"`);
    return normalized;
  }
  
  // Try to match common variations and partial matches
  const roleMap: { [key: string]: string } = {
    // Exact matches
    'SUPER_ADMIN': 'SUPER_ADMIN',
    'SALES_MANAGER': 'SALES_MANAGER',
    'SALES_MAN': 'SALES_MAN',
    // Variations
    'ADMIN': 'SUPER_ADMIN',
    'SUPERADMIN': 'SUPER_ADMIN',
    'SUPER ADMIN': 'SUPER_ADMIN',
    'MANAGER': 'SALES_MANAGER',
    'SALESMANAGER': 'SALES_MANAGER',
    'SALES MANAGER': 'SALES_MANAGER',
    'SALESMAN': 'SALES_MAN',
    'SALES MAN': 'SALES_MAN',
    'SALES': 'SALES_MAN',
  };
  
  // Check direct mapping
  if (roleMap[normalized]) {
    console.log(`Role mapping: "${roleName}" -> "${roleMap[normalized]}" (via mapping)`);
    return roleMap[normalized];
  }
  
  // Try partial matching
  if (normalized.includes('ADMIN') || normalized.includes('SUPER')) {
    console.log(`Role mapping: "${roleName}" -> "SUPER_ADMIN" (partial match)`);
    return 'SUPER_ADMIN';
  }
  if (normalized.includes('MANAGER')) {
    console.log(`Role mapping: "${roleName}" -> "SALES_MANAGER" (partial match)`);
    return 'SALES_MANAGER';
  }
  if (normalized.includes('SALES') || normalized.includes('MAN')) {
    console.log(`Role mapping: "${roleName}" -> "SALES_MAN" (partial match)`);
    return 'SALES_MAN';
  }
  
  // Default fallback
  console.warn(`Role mapping: "${roleName}" -> "SALES_MAN" (default fallback)`);
  return 'SALES_MAN';
};

export const createEmployee = async (data: CreateEmployeeDto): Promise<EmployeeDto> => {
  const roleEnumValue = mapRoleToEnum(data.role);
  
  const response = await apiClient.post('users', {
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    role: roleEnumValue, // Use the mapped enum value
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

