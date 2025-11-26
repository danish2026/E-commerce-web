import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as permissionApi from '../../api/permissions';

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

interface RolePermissionState {
  permissions: Permission[];
  roles: Role[];
  rolePermissions: RolePermission[];
  modules: string[];
  loading: boolean;
  error: string | null;
}

const initialState: RolePermissionState = {
  permissions: [],
  roles: [],
  rolePermissions: [],
  modules: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchPermissions = createAsyncThunk(
  'rolePermission/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      return await permissionApi.getPermissions();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch permissions');
    }
  }
);

export const fetchRoles = createAsyncThunk(
  'rolePermission/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      return await permissionApi.getRoles();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch roles');
    }
  }
);

export const fetchRolePermissions = createAsyncThunk(
  'rolePermission/fetchRolePermissions',
  async (_, { rejectWithValue }) => {
    try {
      return await permissionApi.getRolePermissions();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch role permissions');
    }
  }
);

export const fetchModules = createAsyncThunk(
  'rolePermission/fetchModules',
  async (_, { rejectWithValue }) => {
    try {
      return await permissionApi.getModules();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch modules');
    }
  }
);

export const createPermission = createAsyncThunk(
  'rolePermission/createPermission',
  async (data: { module: string; action: string; description?: string }, { rejectWithValue }) => {
    try {
      return await permissionApi.createPermission(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create permission');
    }
  }
);

export const bulkCreatePermissions = createAsyncThunk(
  'rolePermission/bulkCreatePermissions',
  async (data: { module: string; actions: string[] }, { rejectWithValue }) => {
    try {
      return await permissionApi.bulkCreatePermissions(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create permissions');
    }
  }
);

export const createRole = createAsyncThunk(
  'rolePermission/createRole',
  async (data: { name: string; description?: string }, { rejectWithValue }) => {
    try {
      return await permissionApi.createRole(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create role');
    }
  }
);

export const createRolePermission = createAsyncThunk(
  'rolePermission/createRolePermission',
  async (data: { roleId: string; permissionIds: string[] }, { rejectWithValue }) => {
    try {
      return await permissionApi.createRolePermission(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create role permission');
    }
  }
);

const rolePermissionSlice = createSlice({
  name: 'rolePermission',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch permissions
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch role permissions
      .addCase(fetchRolePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.rolePermissions = action.payload;
      })
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch modules
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create permission
      .addCase(createPermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPermission.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions.push(action.payload);
      })
      .addCase(createPermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Bulk create permissions
      .addCase(bulkCreatePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkCreatePermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = [...state.permissions, ...action.payload];
      })
      .addCase(bulkCreatePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create role
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create role permission
      .addCase(createRolePermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRolePermission.fulfilled, (state, action) => {
        state.loading = false;
        // Refresh role permissions
      })
      .addCase(createRolePermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = rolePermissionSlice.actions;
export default rolePermissionSlice.reducer;

