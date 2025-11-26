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
import { fetchDashboardStats, DashboardStats, RecentOrder } from './DashboardService';

const Dashboard = () => {
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
        message.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Transform monthly trend data for ChartCard
  const cashflowData = stats?.monthlyTrend.map(item => ({
    date: item.month,
    value: item.revenue,
  })) || [];

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
    provider: order.customerName || 'Guest Customer',
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
      title: 'Total Revenue',
      value: formatCurrency(stats.revenue.total),
      currencySymbol: '₹',
      trend: { percent: `${((stats.revenue.monthly / stats.revenue.total) * 100).toFixed(1)}%`, dir: 'up' as const },
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats.revenue.monthly),
      currencySymbol: '₹',
      trend: { percent: `${((stats.revenue.today / stats.revenue.monthly) * 100).toFixed(1)}%`, dir: 'up' as const },
    },
    {
      title: 'Total Orders',
      value: stats.orders.total.toString(),
      currencySymbol: '',
      trend: { percent: `${((stats.orders.monthly / stats.orders.total) * 100).toFixed(1)}%`, dir: 'up' as const },
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
          title="Revenue Trend"
          subtitle="Last 12 months"
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
            <p className="text-sm text-muted">Quick actions</p>
            <h3 className="text-xl font-semibold text-text-primary">Money ops</h3>
          </div>
          <ActionGrid items={quickActions} />
        </Card>
        <ActivityList items={activityItems} filterRange="Recent Orders" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DataTable
            caption="Order Statistics"
            columns={[
              { key: 'provider', header: 'Metric', align: 'left' },
              { key: 'status', header: 'Value', align: 'left' },
              { key: 'volume', header: 'Period', align: 'right' },
            ]}
            data={[
              { id: '1', provider: 'Today\'s Revenue', status: `₹${formatCurrency(stats?.revenue.today || 0)}`, volume: 'Today' },
              { id: '2', provider: 'Today\'s Orders', status: (stats?.orders.today || 0).toString(), volume: 'Today' },
              { id: '3', provider: 'Monthly Revenue', status: `₹${formatCurrency(stats?.revenue.monthly || 0)}`, volume: 'This Month' },
              { id: '4', provider: 'Monthly Orders', status: (stats?.orders.monthly || 0).toString(), volume: 'This Month' },
            ]}
          />
        </div>
        <FooterSmallCTAs />
      </section>
    </div>
  );
};

export default Dashboard;

