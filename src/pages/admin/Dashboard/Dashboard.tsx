import { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import dayjs from 'dayjs';

import {
  ActionGrid,
  ActivityList,
  BalancePanel,
  CardPreview,
  ChartCard,
  FooterSmallCTAs,
  MetricCard,
} from '../../../components/dashboard';
import { Card, DataTable } from '../../../components/ui';
import {
  actionItems,
  balancePanel,
  merchants,
} from '../../../data/dashboard';
import { useDashboardTranslation } from '../../../hooks/useDashboardTranslation';
import { DashboardStats, fetchDashboardStats, MonthlyTrendItem, RecentOrder } from './DashboardService';
// import { fetchDashboardStats, DashboardStats, RecentOrder, MonthlyTrendItem } from './DashboardService';

const Dashboard = () => {
  const { t } = useDashboardTranslation();
  const [currency, setCurrency] = useState(balancePanel.currency);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const quickActions = actionItems.map(({ icon: Icon, label }) => ({
    label,
    icon: <Icon size={20} />,
  }));

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        message.error(t.failedToLoad);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const calcPercent = (part: number, whole: number) => {
    if (!whole) return '0.0%';
    const percent = (part / whole) * 100;
    if (!Number.isFinite(percent)) return '0.0%';
    return `${percent.toFixed(1)}%`;
  };

  // Transform monthly trend data for ChartCard
  const cashflowData = (stats?.monthlyTrend ?? []).map((item: MonthlyTrendItem) => ({
    date: item.month,
    value: item.revenue,
  }));

  // Calculate trend percentage (comparing last month to previous month)
  const calculateTrend = () => {
    if (!stats?.monthlyTrend || stats.monthlyTrend.length < 2) return { percent: '0%', dir: 'up' as const };
    const lastMonth = stats.monthlyTrend[stats.monthlyTrend.length - 1]?.revenue || 0;
    const prevMonth = stats.monthlyTrend[stats.monthlyTrend.length - 2]?.revenue || 0;
    if (prevMonth === 0) return { percent: '0%', dir: 'up' as const };
    const change = ((lastMonth - prevMonth) / prevMonth) * 100;
    return {
      percent: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      dir: change >= 0 ? 'up' as const : 'down' as const,
    };
  };

  const trend = calculateTrend();

  // Transform recent orders for ActivityList
  const activityItems = stats?.recentOrders.map((order: RecentOrder) => ({
    id: order.id,
    provider: order.customerName || t.guestCustomer,
    account: order.orderNumber,
    date: dayjs(order.createdAt).format('DD MMM · HH:mm'),
    amount: `₹${order.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    type: 'in' as const,
  })) || [];

  // Format revenue for display
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const metrics = stats ? [
    {
      title: t.totalRevenue,
      value: formatCurrency(stats.revenue.total),
      currencySymbol: '₹',
      trend: { percent: calcPercent(stats.revenue.monthly, stats.revenue.total), dir: 'up' as const },
    },
    {
      title: t.monthlyRevenue,
      value: formatCurrency(stats.revenue.monthly),
      currencySymbol: '₹',
      trend: { percent: calcPercent(stats.revenue.today, stats.revenue.monthly), dir: 'up' as const },
    },
    {
      title: t.totalOrders,
      value: stats.orders.total.toString(),
      currencySymbol: '',
      trend: { percent: calcPercent(stats.orders.monthly, stats.orders.total), dir: 'up' as const },
    },
  ] : [];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} currencySymbol={metric.currencySymbol} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <ChartCard
          title={t.revenueTrend}
          subtitle={t.last12Months}
          change={trend.percent}
          trend={trend.dir}
          data={cashflowData}
        />
        <div className="space-y-4">
          <BalancePanel
            balance={stats ? formatCurrency(stats.revenue.total) : '0.00'}
            currency={currency}
            currencies={balancePanel.currencies}
            onCurrencyChange={setCurrency}
          />
          <CardPreview holderName="Super Admin" maskedNumber="5321 •••• •••• 3019" expiry="08 / 28" brand="SS" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-6">
          <div>
            <p className="text-sm text-muted">{t.quickActions}</p>
            <h3 className="text-xl font-semibold text-text-primary">{t.moneyOps}</h3>
          </div>
          <ActionGrid items={quickActions} />
        </Card>
        <ActivityList items={activityItems} filterRange={t.recentOrders} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DataTable
            caption={t.orderStatistics}
            columns={[
              { key: 'provider', header: t.metric, align: 'left' },
              { key: 'status', header: t.value, align: 'left' },
              { key: 'volume', header: t.period, align: 'right' },
            ]}
            data={[
              { id: '1', provider: t.todaysRevenue, status: `₹${formatCurrency(stats?.revenue.today || 0)}`, volume: t.today },
              { id: '2', provider: t.todaysOrders, status: (stats?.orders.today || 0).toString(), volume: t.today },
              { id: '3', provider: t.monthlyRevenueLabel, status: `₹${formatCurrency(stats?.revenue.monthly || 0)}`, volume: t.thisMonth },
              { id: '4', provider: t.monthlyOrders, status: (stats?.orders.monthly || 0).toString(), volume: t.thisMonth },
            ]}
          />
        </div>
        <FooterSmallCTAs />
      </section>
    </div>
  );
};

export default Dashboard;

