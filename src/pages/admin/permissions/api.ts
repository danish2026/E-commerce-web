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

// Get all roles with optional pagination
export const fetchRoles = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ data: Role[]; meta: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } }> => {
  const params: Record<string, string | number> = {
    page,
    limit,
  };
  
  if (search) {
    params.search = search;
  }
  
  try {
    const response = await apiClient.get('permissions/roles', { params });
    
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
    console.error('Error fetching roles:', error);
    throw error;
  }
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

// Delete a role
export const deleteRole = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error('Role ID is required');
  }
  
  const url = `permissions/roles/${id}`;
  console.log('========== DELETE ROLE API CALL ==========');
  console.log('Delete role request URL:', url);
  console.log('Role ID:', id);
  
  try {
    const response = await apiClient.delete(url);
    console.log('Delete role request successful');
    console.log('Response status:', response?.status);
    console.log('Response data:', response?.data);
    console.log('==========================================');
    return;
  } catch (error: any) {
    console.error('========== DELETE ROLE ERROR ==========');
    console.error('Delete role request failed');
    console.error('Error object:', error);
    console.error('Error message:', error?.message);
    console.error('Error response:', error?.response);
    console.error('Error response status:', error?.response?.status);
    console.error('Error response data:', error?.response?.data);
    console.error('Error response headers:', error?.response?.headers);
    console.error('Request URL:', error?.config?.url);
    console.error('Request method:', error?.config?.method);
    console.error('==========================================');
    throw error;
  }
};

// Create role permission
export const createRolePermission = async (data: {
  roleId: string;
  permissionIds: string[];
}): Promise<RolePermission[]> => {
  const response = await apiClient.post('permissions/role-permissions', data);
  return response.data;
};

// Get role permissions by role ID with optional pagination
export const fetchRolePermissionsByRole = async (
  roleId: string,
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ data: RolePermission[]; meta: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } }> => {
  const params: Record<string, string | number> = {
    page,
    limit,
  };
  
  if (search) {
    params.search = search;
  }
  
  try {
    const response = await apiClient.get(`permissions/role-permissions/role/${roleId}`, { params });
    
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
    console.error('Error fetching role permissions:', error);
    throw error;
  }
};

// Delete role permission
export const deleteRolePermission = async (data: {
  roleId: string;
  permissionIds: string[];
}): Promise<void> => {
  await apiClient.request({
    url: 'permissions/role-permissions',
    method: 'DELETE',
    data,
  });
};

// Delete a single role permission using explicit route params (more reliable across proxies)
export const deleteRolePermissionByRoleAndPermission = async (
  roleId: string,
  permissionId: string,
): Promise<void> => {
  await apiClient.delete(`permissions/role-permissions/role/${roleId}/permission/${permissionId}`);
};

// Fetch all role-permission mappings
export const fetchRolePermissions = async (): Promise<RolePermission[]> => {
  const response = await apiClient.get('permissions/role-permissions');
  return response.data;
};
