import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../common/enums/role.enum';

type RoleProtectedRouteProps = {
  allowedRoles: Array<Role | string>;
};

const normalizeRoleValue = (value?: Role | string | null): string =>
  value ? value.toString().toUpperCase().replace(/\s+/g, '_').trim() : '';

/**
 * RoleProtectedRoute Component
 * Protects routes based on user roles
 * 
 * @param allowedRoles - Array of roles that can access this route
 * 
 * Usage:
 * <Route element={<RoleProtectedRoute allowedRoles={[Role.SUPER_ADMIN]} />}>
 *   <Route path="protected" element={<ProtectedPage />} />
 * </Route>
 */
const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { isAuthenticated, role, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role (handle both enum and string)
  if (!role) {
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[RoleProtectedRoute] No role found, redirecting to dashboard');
    }
    return <Navigate to="/dashboard" replace />;
  }

  const roleStr = normalizeRoleValue(role);
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('[RoleProtectedRoute] Role check:', {
      userRole: role,
      normalizedRole: roleStr,
      allowedRoles: allowedRoles,
      normalizedAllowedRoles: allowedRoles.map(normalizeRoleValue),
    });
  }

  const hasAccess = roleStr !== '' && allowedRoles.some((allowedRole) => {
    const allowedRoleStr = normalizeRoleValue(allowedRole);
    const matches = allowedRoleStr === roleStr;
    
    if (process.env.NODE_ENV === 'development' && matches) {
      console.log('[RoleProtectedRoute] Role match found:', {
        userRole: roleStr,
        allowedRole: allowedRoleStr,
      });
    }
    
    return matches;
  });

  if (!hasAccess) {
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[RoleProtectedRoute] Access denied:', {
        userRole: roleStr,
        allowedRoles: allowedRoles.map(normalizeRoleValue),
        redirectingTo: '/dashboard',
      });
    }
    
    // If user is authenticated but doesn't have access, redirect to dashboard
    // (which is accessible to both SUPER_ADMIN and SALES_MANAGER)
    // Only redirect to login if truly not authenticated (handled above)
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has required role
  return <Outlet />;
};

export default RoleProtectedRoute;

