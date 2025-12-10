import apiClient from '../../../api/apiClient';
import { Role, RolePermission, Permission } from '../../../api/permissions';

// Re-export types for convenience
export type { Role, RolePermission, Permission };

// Get all roles
export const fetchRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get('permissions/roles');
  return response.data;
};

// Get single role by ID
export const fetchRoleById = async (id: string): Promise<Role> => {
  const response = await apiClient.get(`permissions/roles/${id}`);
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

// Update a role
export const updateRole = async (id: string, data: {
  name?: string;
  description?: string;
}): Promise<Role> => {
  const response = await apiClient.patch(`permissions/roles/${id}`, data);
  return response.data;
};

// Delete a role
export const deleteRole = async (id: string): Promise<void> => {
  await apiClient.delete(`permissions/roles/${id}`);
};

// Get all permissions for a role
export const fetchRolePermissionsByRole = async (roleId: string): Promise<RolePermission[]> => {
  const response = await apiClient.get(`permissions/role-permissions/role/${roleId}`);
  return response.data;
};

// Get all permissions
export const fetchAllPermissions = async (): Promise<Permission[]> => {
  const permissionsList: Permission[] = [];
  let currentPage = 1;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await apiClient.get('permissions', {
        params: { page: currentPage, limit },
      });
      if (Array.isArray(response.data)) {
        permissionsList.push(...response.data);
        hasMore = false;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        permissionsList.push(...response.data.data);
        hasMore = response.data.meta?.hasNext || false;
        currentPage++;
      } else {
        break;
      }
    } catch (error) {
      console.error(`Error fetching permissions page ${currentPage}:`, error);
      break;
    }
  }

  return permissionsList;
};

// Get all modules
export const fetchModules = async (): Promise<string[]> => {
  const response = await apiClient.get('permissions/modules');
  return response.data;
};

// Bulk update role permissions (replaces existing permissions)
export const bulkUpdateRolePermissions = async (
  roleId: string,
  permissionIds: string[]
): Promise<RolePermission[]> => {
  const response = await apiClient.patch(`permissions/role-permissions/role/${roleId}`, {
    permissionIds,
  });
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

