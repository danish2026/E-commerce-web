import dayjs from 'dayjs';
import apiClient from '../../../api/apiClient';
import { API } from '../../../api/api';

export interface ReportingData {
  revenue: number;
  orders: number;
  dateRangeRevenue?: number;
  dateRangeOrders?: number;
  orderItems: OrderItemResponse[];
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
  dateRangeRevenue?: number;
  dateRangeOrders?: number;
  orderItems: OrderItemResponse[];
}

export type ReportFilter = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

const getWeeklyDateRange = (): { startDate: string; endDate: string } => {
  const endDate = dayjs().endOf('day');
  const startDate = endDate.subtract(6, 'days').startOf('day');
  return {
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD'),
  };
};


const getMonthlyDateRange = (): { startDate: string; endDate: string } => {
  const startDate = dayjs().startOf('month');
  const endDate = dayjs().endOf('month');
  return {
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD'),
  };
};

const getYearlyDateRange = (): { startDate: string; endDate: string } => {
  const startDate = dayjs().startOf('year');
  const endDate = dayjs().endOf('year');
  return {
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD'),
  };
};

export const fetchReportingData = async (
  filter: ReportFilter,
  startDate?: string,
  endDate?: string
): Promise<ReportingData> => {
  let data: DashboardApiResponse;
  let dateRange: { startDate: string; endDate: string };

  if (startDate && endDate) {
    dateRange = { startDate, endDate };
  } else {
    switch (filter) {
      case 'Daily':
        const today = dayjs().format('YYYY-MM-DD');
        dateRange = { startDate: today, endDate: today };
        break;
      case 'Weekly':
        dateRange = getWeeklyDateRange();
        break;
      case 'Monthly':
        dateRange = getMonthlyDateRange();
        break;
      case 'Yearly':
        dateRange = getYearlyDateRange();
        break;
      default:
        throw new Error(`Unknown filter type: ${filter}`);
    }
  }

  const response = await apiClient.get<DashboardApiResponse>(
    `${API.DASHBOARD}/date-range`,
    {
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    }
  );
  data = response.data;

  return {
    revenue: data.dateRangeRevenue ?? data.todayRevenue ?? data.monthlyRevenue ?? 0,
    orders: data.dateRangeOrders ?? data.todayOrders ?? data.monthlyOrders ?? 0,
    dateRangeRevenue: data.dateRangeRevenue,
    dateRangeOrders: data.dateRangeOrders,
    orderItems: data.orderItems ?? [],
  };
};

export const getApiErrorMessage = (error: any, defaultMessage: string): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return defaultMessage;
};

