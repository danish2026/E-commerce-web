import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../common/enums/role.enum';

type RoleProtectedRouteProps = {
  allowedRoles: Role[];
};

/**
 * RoleProtectedRoute Component
 * Protects routes based on user roles
 * 
 * @param allowedRoles - Array of roles that can access this route
 * 
 * Usage:
 * <Route element={<RoleProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.SALES_MANAGER]} />}>
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

  // Check if user has required role
  if (!role || !allowedRoles.includes(role as Role)) {
    // Redirect to sales page (accessible to all authenticated users)
    return <Navigate to="/sales" replace />;
  }

  // User is authenticated and has required role
  return <Outlet />;
};

export default RoleProtectedRoute;

