import { Route, Routes } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Auth/Login';
import { Dashboard } from '../pages/admin/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import ModuleProtectedRoute from './ModuleProtectedRoute';
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
import BillingForm from '../pages/admin/billing/form';
import BillingView from '../pages/admin/billing/view';
import Product from '../pages/admin/product';
import ProductForm from '../pages/admin/product/form';
import ProductView from '../pages/admin/product/view';
import Categories from '../pages/admin/categories';
import Permissions from '../pages/admin/permissions';
import PermissionForm from '../pages/admin/permissions/form';
import PermissionView from '../pages/admin/permissions/view';
import Employees from '../pages/admin/employees';
import EmployeeForm from '../pages/admin/employees/form';
import EmployeeView from '../pages/admin/employees/view';
import Reporting from '../pages/admin/reporting';

const AppRoutes = () => {
  const salesManagerRoles = [Role.SUPER_ADMIN, Role.SALES_MANAGER];

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          {/* Dashboard - SUPER_ADMIN & SALES_MANAGER */}
          <Route
            element={<RoleProtectedRoute allowedRoles={salesManagerRoles} />}
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>

          {/* Sales routes - permission based */}
          <Route element={<ModuleProtectedRoute modules={['sales']} />}>
            <Route path="sales" element={<Sales />} />
            <Route path="sales/form" element={<SalesForm />} />
            <Route path="sales/view" element={<SalesView />} />
          </Route>

          {/* Product Management routes - permission based */}
          <Route element={<ModuleProtectedRoute modules={['products']} />}>
            <Route path="product" element={<Product />} />
            <Route path="product/form" element={<ProductForm />} />
            <Route path="product/view" element={<ProductView />} />
          </Route>
          <Route element={<ModuleProtectedRoute modules={['categories']} />}>
            <Route path="categories" element={<Categories />} />
          </Route>

          {/* Purchase routes - permission based */}
          <Route element={<ModuleProtectedRoute modules={['purchase']} />}>
            <Route path="purchase" element={<Purchase />} />
            <Route path="purchase/form" element={<FormComponent />} />
            <Route path="purchase/view" element={<View />} />
          </Route>
          <Route element={<ModuleProtectedRoute modules={['purchase-item']} />}>
            <Route path="purchase-item" element={<PurcheseItem />} />
            <Route path="purchase-item/form" element={<PurchaseItemForm />} />
            <Route path="purchase-item/view" element={<PurchaseItemView />} />
          </Route>
          <Route element={<ModuleProtectedRoute modules={['invoice']} />}>
            <Route path="invoice" element={<Invoice />} />
            <Route path="invoice/form" element={<InvoiceForm />} />
            <Route path="invoice/view" element={<InvoiceView />} />
          </Route>

          {/* Settings - permission based */}
          <Route element={<ModuleProtectedRoute modules={['settings']} />}>
            <Route path="settings" element={<Setting />} />
          </Route>

          {/* Permissions - permission based */}
          <Route element={<ModuleProtectedRoute modules={['permissions']} />}>
            <Route path="permissions" element={<Permissions />} />
            <Route path="permissions/form" element={<PermissionForm />} />
            <Route path="permissions/view" element={<PermissionView />} />
          </Route>

          {/* Employees - permission based */}
          <Route element={<ModuleProtectedRoute modules={['employees']} />}>
            <Route path="employees" element={<Employees />} />
            <Route path="employees/form" element={<EmployeeForm />} />
            <Route path="employees/view" element={<EmployeeView />} />
          </Route>

          {/* Billing - permission based */}
          <Route element={<ModuleProtectedRoute modules={['billing']} />}>
            <Route path="billing" element={<Billing />} />
            <Route path="billing/form" element={<BillingForm />} />
            <Route path="billing/view" element={<BillingView />} />
            <Route path="reporting" element={<Reporting />} />
          </Route>

          {/* User Management - SUPER_ADMIN only */}
          {/* TODO: Create Users page component */}
          {/* <Route
            element={<RoleProtectedRoute allowedRoles={superAdminOnly} />}
          >
            <Route path="users" element={<Users />} />
          </Route> */}

          {/* Catch-all routes */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;

