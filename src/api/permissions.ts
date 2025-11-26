import apiClient from './apiClient';
import { API } from './api';

export interface Permission {
  id: string;
  module: string;
  action: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  role?: Role;
  permission?: Permission;
  createdAt: string;
  updatedAt: string;
}

export const getPermissions = async (): Promise<Permission[]> => {
  const response = await apiClient.get(`permissions`);
  return response.data;
};

export const getRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get(`permissions/roles`);
  return response.data;
};

export const getRolePermissions = async (): Promise<RolePermission[]> => {
  const response = await apiClient.get(`permissions/role-permissions`);
  return response.data;
};

export const getModules = async (): Promise<string[]> => {
  const response = await apiClient.get(`permissions/modules`);
  return response.data;
};

export const createPermission = async (data: {
  module: string;
  action: string;
  description?: string;
}): Promise<Permission> => {
  const response = await apiClient.post(`permissions`, data);
  return response.data;
};

export const bulkCreatePermissions = async (data: {
  module: string;
  actions: string[];
}): Promise<Permission[]> => {
  const response = await apiClient.post(`permissions/bulk`, data);
  return response.data;
};

export const createRole = async (data: {
  name: string;
  description?: string;
}): Promise<Role> => {
  const response = await apiClient.post(`permissions/roles`, data);
  return response.data;
};

export const createRolePermission = async (data: {
  roleId: string;
  permissionIds: string[];
}): Promise<RolePermission[]> => {
  const response = await apiClient.post(`permissions/role-permissions`, data);
  return response.data;
};

export const getRolePermissionsByRole = async (roleId: string) => {
  const response = await apiClient.get(`permissions/role-permissions/role/${roleId}`);
  return response.data;
};

export const getRoleByName = async (roleName: string): Promise<Role | null> => {
  const roles = await getRoles();
  return roles.find(r => r.name === roleName || r.name === roleName.toUpperCase()) || null;
};

