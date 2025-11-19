import { Navigate, Route, Routes } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Auth/Login';
import { Dashboard } from '../pages/admin/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import Purchase from '../pages/admin/purchase';
import FormComponent from '../pages/admin/purchase/form';
import View from '../pages/admin/purchase/view';
import Invoice from '../pages/admin/invoice';


const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="purchase/form" element={<FormComponent />} />
        <Route path="purchase/view" element={<View />} />
        <Route path="purchase" element={<Purchase />} />
        <Route path="invoice" element={<Invoice />} />
      </Route>
    </Route>
  </Routes>
);

export default AppRoutes;

