import { Route, Routes } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Auth/Login';
import { Dashboard } from '../pages/admin/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import Purchase from '../pages/admin/purchase';
import FormComponent from '../pages/admin/purchase/form';
import View from '../pages/admin/purchase/view';
import Invoice from '../pages/admin/invoice';
import PurcheseItem from '../pages/admin/purchaseItem';
import PurchaseItemForm from '../pages/admin/purchaseItem/form';
import PurchaseItemView from '../pages/admin/purchaseItem/view';
import NotFound from '../pages/admin/notFound';
import Sales from '../pages/admin/sales';
import { Role } from '../common/enums/role.enum';

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<MainLayout />}>
        {/* Dashboard - SUPER_ADMIN only */}
        <Route
          element={<RoleProtectedRoute allowedRoles={[Role.SUPER_ADMIN]} />}
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>

        {/* Sales - All roles can access */}
        <Route
          element={<RoleProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.SALES_MANAGER, Role.SALES_MAN]} />}
        >
          <Route path="sales" element={<Sales />} />
        </Route>

        {/* Purchase routes - SUPER_ADMIN and SALES_MANAGER only */}
        <Route
          element={<RoleProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.SALES_MANAGER]} />}
        >
          <Route path="purchase" element={<Purchase />} />
          <Route path="purchase/form" element={<FormComponent />} />
          <Route path="purchase/view" element={<View />} />
          <Route path="purchase-item" element={<PurcheseItem />} />
          <Route path="purchase-item/form" element={<PurchaseItemForm />} />
          <Route path="purchase-item/view" element={<PurchaseItemView />} />
          <Route path="invoice" element={<Invoice />} />
        </Route>

        {/* User Management - SUPER_ADMIN only */}
        {/* TODO: Create Users page component */}
        {/* <Route
          element={<RoleProtectedRoute allowedRoles={[Role.SUPER_ADMIN]} />}
        >
          <Route path="users" element={<Users />} />
        </Route> */}

        {/* Catch-all routes */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Route>
  </Routes>
);

export default AppRoutes;

