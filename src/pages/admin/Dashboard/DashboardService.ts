import dayjs from 'dayjs';
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

interface ProductSummary {
  id: string;
  name?: string;
  sku?: string;
}

interface OrderItemResponse {
  id: string;
  totalAmount: number;
  discount?: number | null;
  customerName?: string | null;
  createdAt: string;
  product?: ProductSummary | null;
}

interface DashboardApiResponse {
  todayRevenue: number;
  todayOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  totalRevenue: number;
  totalOrders: number;
  orderItems: OrderItemResponse[];
}

const buildRecentOrders = (orderItems: OrderItemResponse[]): RecentOrder[] =>
  [...orderItems]
    .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
    .slice(0, 10)
    .map((item) => {
      const totalAmount = Number(item.totalAmount ?? 0);
      const discount = Number(item.discount ?? 0);
      const grandTotal = totalAmount - discount;
      const orderNumber = item.product?.sku ?? `ORD-${item.id.slice(0, 6).toUpperCase()}`;

      return {
        id: item.id,
        orderNumber,
        customerName: item.customerName ?? item.product?.name ?? 'Guest Customer',
        grandTotal,
        createdAt: item.createdAt,
      };
    });

const buildMonthlyTrend = (orderItems: OrderItemResponse[]): MonthlyTrendItem[] => {
  const monthlyMap = new Map<string, { label: string; revenue: number }>();

  orderItems.forEach((item) => {
    if (!item.createdAt) {
      return;
    }
    const date = dayjs(item.createdAt);
    const key = date.format('YYYY-MM');
    const label = date.format('MMM YYYY');
    const current = monthlyMap.get(key)?.revenue ?? 0;
    const revenue = Number(item.totalAmount ?? 0) - Number(item.discount ?? 0);
    monthlyMap.set(key, { label, revenue: current + revenue });
  });

  return Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => ({
      month: value.label,
      revenue: Number(value.revenue.toFixed(2)),
    }));
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await apiClient.get<DashboardApiResponse>(API.DASHBOARD);

  const orderItems = data.orderItems ?? [];

  return {
    revenue: {
      total: Number(data.totalRevenue ?? 0),
      monthly: Number(data.monthlyRevenue ?? 0),
      today: Number(data.todayRevenue ?? 0),
    },
    orders: {
      total: Number(data.totalOrders ?? 0),
      monthly: Number(data.monthlyOrders ?? 0),
      today: Number(data.todayOrders ?? 0),
    },
    recentOrders: buildRecentOrders(orderItems),
    monthlyTrend: buildMonthlyTrend(orderItems),
  };
};

