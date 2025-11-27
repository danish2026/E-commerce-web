 import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

type ModuleProtectedRouteProps = {
  modules: string[];
  fallbackPath?: string;
};

const ModuleProtectedRoute = ({
  modules,
  fallbackPath = '/dashboard',
}: ModuleProtectedRouteProps) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { hasModuleAccess, loading: permissionsLoading } = usePermissions();

  const isLoading = authLoading || permissionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allowed =
    modules.length === 0 ||
    modules.some((module) => hasModuleAccess(module));

  if (!allowed) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

export default ModuleProtectedRoute;

