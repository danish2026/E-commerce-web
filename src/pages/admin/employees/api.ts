import apiClient from '../../../api/apiClient';
import { API } from '../../../api/api';

export interface Employee {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  roleName?: string;
  permissionsRoleId?: string;
  permissionsRoleName?: string;
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
  role?: string;
  permissionsRoleId: string;
  permissionsRoleName: string;
}

export interface UpdateEmployeeDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  permissionsRoleId?: string;
  permissionsRoleName?: string;
  password?: string;
  isActive?: boolean;
}

export interface PaginatedEmployeeResponse {
  data: Employee[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

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
    return normalized;
  }
  
  // Try to match common variations and partial matches
  const roleMap: { [key: string]: string } = {
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
    return roleMap[normalized];
  }
  
  // Try partial matching
  if (normalized.includes('ADMIN') || normalized.includes('SUPER')) {
    return 'SUPER_ADMIN';
  }
  if (normalized.includes('MANAGER')) {
    return 'SALES_MANAGER';
  }
  if (normalized.includes('SALES') || normalized.includes('MAN')) {
    return 'SALES_MAN';
  }
  
  // Default fallback
  return 'SALES_MAN';
};

// Get all employees with pagination
export const fetchEmployees = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  fromDate?: string,
  toDate?: string
): Promise<PaginatedEmployeeResponse> => {
  const params: Record<string, string | number> = {
    page,
    pageSize: limit,
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
  
  const response = await apiClient.get('users', { params });
  
  // Handle both array and paginated response
  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      meta: {
        total: response.data.length,
        page: 1,
        limit: response.data.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
  
  // Transform to match PaginatedEmployeeResponse format
  if (response.data.meta) {
    const metaLimit = response.data.meta.limit || response.data.meta.pageSize || limit;
    return {
      data: response.data.data || [],
      meta: {
        page: response.data.meta.page || page,
        limit: metaLimit,
        total: response.data.meta.total || 0,
        totalPages: response.data.meta.totalPages || Math.ceil((response.data.meta.total || 0) / metaLimit),
        hasNext: response.data.meta.hasNext !== undefined ? response.data.meta.hasNext : (response.data.meta.page || page) < Math.ceil((response.data.meta.total || 0) / metaLimit),
        hasPrev: response.data.meta.hasPrev !== undefined ? response.data.meta.hasPrev : (response.data.meta.page || page) > 1,
      },
    };
  }
  
  return response.data;
};

// Get single employee by ID
export const fetchEmployeeById = async (id: string): Promise<Employee> => {
  const response = await apiClient.get(`users/${id}`);
  return response.data;
};

// Create an employee
export const createEmployee = async (employee: CreateEmployeeDto): Promise<Employee> => {
  const roleSource = employee.permissionsRoleName || employee.role || '';
  const roleEnumValue = mapRoleToEnum(roleSource);
  
  const response = await apiClient.post('users', {
    email: employee.email,
    password: employee.password,
    firstName: employee.firstName,
    lastName: employee.lastName,
    phone: employee.phone,
    role: roleEnumValue,
    permissionsRoleId: employee.permissionsRoleId,
    permissionsRoleName: employee.permissionsRoleName || roleSource,
  });
  return response.data;
};

// Update an employee
export const updateEmployee = async (id: string, employee: UpdateEmployeeDto): Promise<Employee> => {
  const payload: UpdateEmployeeDto = { ...employee };

  if (employee.permissionsRoleName && !employee.role) {
    payload.role = mapRoleToEnum(employee.permissionsRoleName);
  }

  const response = await apiClient.put(`users/${id}`, payload);
  return response.data;
};

// Delete an employee
export const deleteEmployee = async (id: string): Promise<void> => {
  await apiClient.delete(`users/${id}`);
};

// Get roles
export const getRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get('permissions/roles');
  return response.data;
};

// Helper function to get API error message
export const getApiErrorMessage = (error: any, defaultMessage: string): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return defaultMessage;
};

