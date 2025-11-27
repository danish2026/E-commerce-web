export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface Permission {
  id: string;
  module: string;
  action: string;
  description?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    permissionsRoleId?: string;
    permissionsRoleName?: string;
  };
  permissions?: Permission[];
}

export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

