import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRolePermissionsByRole, getRoles } from '../api/permissions';
import { Role } from '../store/slices/rolePermissionSlice';

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
  const { user, role } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        
        // Normalize role for comparison
        const normalizedRole = role ? String(role).toUpperCase().replace(/\s+/g, '_').trim() : '';
        
        // If user is SUPER_ADMIN, grant all permissions
        if (normalizedRole === 'SUPER_ADMIN') {
          // For SUPER_ADMIN, we'll return all permissions or an empty array
          // The hasPermission function will handle SUPER_ADMIN specially
          setPermissions([]);
          setLoading(false);
          return;
        }

        // Get user's role name - check user object first, then role from context
        // The user object from API might have roleName field
        let userRoleName: string | null = null;
        
        // Try to get roleName from user object (from API response)
        if (user && (user as any).roleName) {
          userRoleName = (user as any).roleName;
        } else if (role && normalizedRole !== 'SUPER_ADMIN') {
          // Use role from context if it's not SUPER_ADMIN
          userRoleName = String(role);
        }
        
        if (!userRoleName) {
          setPermissions([]);
          setLoading(false);
          return;
        }

        // Get all roles to find the role ID
        const roles = await getRoles();
        const userRole = roles.find(r => {
          const roleName = r.name.toUpperCase();
          const searchName = userRoleName!.toUpperCase();
          return roleName === searchName;
        });
        
        if (!userRole) {
          console.warn(`Role not found: ${userRoleName}`);
          setPermissions([]);
          setLoading(false);
          return;
        }

        // Get permissions for this role
        const rolePermissionsData = await getRolePermissionsByRole(userRole.id);
        const rolePermissions = rolePermissionsData.permissions || [];
        
        setPermissions(rolePermissions);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user, role]);

  const hasPermission = (module: string, action: string): boolean => {
    // Normalize role for comparison
    const normalizedRole = role ? String(role).toUpperCase().replace(/\s+/g, '_').trim() : '';
    
    // SUPER_ADMIN has all permissions
    if (normalizedRole === 'SUPER_ADMIN') {
      return true;
    }

    return permissions.some(
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

    return permissions.some(
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
    permissions,
    loading,
    hasPermission,
    hasModuleAccess,
    canCreate,
    canView,
    canEdit,
    canDelete,
  };
};

