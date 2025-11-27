import { useAuth } from '../context/AuthContext';

interface Permission {
  id: string;
  module: string;
  action: string;
  description?: string;
}

interface UsePermissionsResult {
  permissions: Permission[];
  loading: boolean;
  hasPermission: (module: string, action: string) => boolean;
  hasModuleAccess: (module: string) => boolean;
  canCreate: (module: string) => boolean;
  canView: (module: string) => boolean;
  canEdit: (module: string) => boolean;
  canDelete: (module: string) => boolean;
}

export const usePermissions = (): UsePermissionsResult => {
  const { role, permissions, loading } = useAuth();
  
  // Use permissions directly from auth context (fetched during login)
  // No need to fetch separately - they're already available
  // Loading is false since permissions are already loaded with user data

  const hasPermission = (module: string, action: string): boolean => {
    // Normalize role for comparison
    const normalizedRole = role ? String(role).toUpperCase().replace(/\s+/g, '_').trim() : '';
    
    // SUPER_ADMIN has all permissions
    if (normalizedRole === 'SUPER_ADMIN') {
      return true;
    }

    return (permissions || []).some(
      (p) => p.module.toLowerCase() === module.toLowerCase() && 
             p.action.toLowerCase() === action.toLowerCase()
    );
  };

  const hasModuleAccess = (module: string): boolean => {
    // Normalize role for comparison
    const normalizedRole = role ? String(role).toUpperCase().replace(/\s+/g, '_').trim() : '';
    
    // SUPER_ADMIN has access to all modules
    if (normalizedRole === 'SUPER_ADMIN') {
      return true;
    }

    return (permissions || []).some(
      (p) => p.module.toLowerCase() === module.toLowerCase()
    );
  };

  const canCreate = (module: string): boolean => {
    return hasPermission(module, 'create');
  };

  const canView = (module: string): boolean => {
    return hasPermission(module, 'view');
  };

  const canEdit = (module: string): boolean => {
    return hasPermission(module, 'edit');
  };

  const canDelete = (module: string): boolean => {
    return hasPermission(module, 'delete');
  };

  return {
    permissions: permissions || [],
    loading,
    hasPermission,
    hasModuleAccess,
    canCreate,
    canView,
    canEdit,
    canDelete,
  };
};

