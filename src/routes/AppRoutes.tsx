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
import InvoiceForm from '../pages/admin/invoice/form';
import InvoiceView from '../pages/admin/invoice/view';
import PurcheseItem from '../pages/admin/purchaseItem';
import PurchaseItemForm from '../pages/admin/purchaseItem/form';
import PurchaseItemView from '../pages/admin/purchaseItem/view';
import NotFound from '../pages/admin/notFound';
import Sales from '../pages/admin/sales';
import SalesForm from '../pages/admin/sales/form';
import SalesView from '../pages/admin/sales/view';
import { Role } from '../common/enums/role.enum';
import Setting from '../pages/admin/settings';
import Billing from '../pages/admin/billing';
import Product from '../pages/admin/product';
import ProductForm from '../pages/admin/product/form';
import ProductView from '../pages/admin/product/view';
import Categories from '../pages/admin/categories';

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
          <Route path="sales/form" element={<SalesForm />} />
          <Route path="sales/view" element={<SalesView />} />
          <Route path="product" element={<Product />} />
          <Route path="product/form" element={<ProductForm />} />
          <Route path="product/view" element={<ProductView />} />
          <Route path="categories" element={<Categories />} />
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
          <Route path="invoice/form" element={<InvoiceForm />} />
          <Route path="invoice/view" element={<InvoiceView />} />
          <Route path="settings" element={<Setting />} />
          <Route path="billing" element={<Billing />} />
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

