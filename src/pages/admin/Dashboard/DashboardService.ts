import apiClient from '../../../api/apiClient';
import { API } from '../../../api/api';

export interface RevenueStats {
  total: number;
  monthly: number;
  today: number;
}

export interface OrderStats {
  total: number;
  monthly: number;
  today: number;
}

export interface MonthlyTrendItem {
  month: string;
  revenue: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string | null;
  grandTotal: number;
  createdAt: string;
}

export interface DashboardStats {
  revenue: RevenueStats;
  orders: OrderStats;
  recentOrders: RecentOrder[];
  monthlyTrend: MonthlyTrendItem[];
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await apiClient.get<DashboardStats>(`${API.ORDERS}/stats/dashboard`);
  return data;
};



