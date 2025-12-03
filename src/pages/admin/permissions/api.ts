import apiClient from '../../../api/apiClient';
import { Permission, Role, RolePermission } from '../../../api/permissions';

// Re-export types for convenience
export type { Permission, Role, RolePermission };

// Get all permissions with optional pagination and filtering
export const fetchPermissions = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  module?: string,
  action?: string
): Promise<{ data: Permission[]; meta: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } }> => {
  const params: Record<string, string | number> = {
    page,
    limit,
  };
  
  if (search) {
    params.search = search;
  }
  
  if (module) {
    params.module = module;
  }
  
  if (action) {
    params.action = action;
  }
  
  try {
    const response = await apiClient.get('permissions', { params });
    
    // Handle both array and paginated response (for backward compatibility)
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
    
    // Transform to match expected format
    if (response.data.meta) {
      return {
        data: response.data.data || [],
        meta: {
          page: response.data.meta.page || page,
          limit: response.data.meta.limit || limit,
          total: response.data.meta.total || 0,
          totalPages: response.data.meta.totalPages || Math.ceil((response.data.meta.total || 0) / (response.data.meta.limit || limit)),
          hasNext: response.data.meta.hasNext !== undefined ? response.data.meta.hasNext : (response.data.meta.page || page) < Math.ceil((response.data.meta.total || 0) / (response.data.meta.limit || limit)),
          hasPrev: response.data.meta.hasPrev !== undefined ? response.data.meta.hasPrev : (response.data.meta.page || page) > 1,
        },
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
};

// Get single permission by ID
export const fetchPermissionById = async (id: string): Promise<Permission> => {
  const response = await apiClient.get(`permissions/${id}`);
  return response.data;
};

// Create a permission
export const createPermission = async (data: {
  module: string;
  action: string;
  description?: string;
}): Promise<Permission> => {
  const response = await apiClient.post('permissions', data);
  return response.data;
};

// Bulk create permissions
export const bulkCreatePermissions = async (data: {
  module: string;
  actions: string[];
}): Promise<Permission[]> => {
  const response = await apiClient.post('permissions/bulk', data);
  return response.data;
};

// Update a permission
export const updatePermission = async (id: string, data: {
  module?: string;
  action?: string;
  description?: string;
}): Promise<Permission> => {
  const response = await apiClient.patch(`permissions/${id}`, data);
  return response.data;
};

// Delete a permission
export const deletePermission = async (id: string): Promise<void> => {
  await apiClient.delete(`permissions/${id}`);
};

// Get all roles
export const fetchRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get('permissions/roles');
  return response.data;
};

// Get all modules
export const fetchModules = async (): Promise<string[]> => {
  const response = await apiClient.get('permissions/modules');
  return response.data;
};

// Create a role
export const createRole = async (data: {
  name: string;
  description?: string;
}): Promise<Role> => {
  const response = await apiClient.post('permissions/roles', data);
  return response.data;
};

// Create role permission
export const createRolePermission = async (data: {
  roleId: string;
  permissionIds: string[];
}): Promise<RolePermission[]> => {
  const response = await apiClient.post('permissions/role-permissions', data);
  return response.data;
};

