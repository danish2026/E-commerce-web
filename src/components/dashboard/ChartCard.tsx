import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, Badge } from '../ui';

interface ChartPoint {
  date: string;
  value: number;
  forecast?: number;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  change?: string;
  trend?: 'up' | 'down';
  data: ChartPoint[];
}

const TooltipContent = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as ChartPoint;
  return (
    <div className="rounded-2xl bg-surface-1 p-3 shadow-card">
      <p className="text-xs text-muted">{point.date}</p>
      <p className="text-base font-semibold text-text-primary">${point.value.toLocaleString()}</p>
    </div>
  );
};

export const ChartCard = ({ title, subtitle, change, trend = 'up', data }: ChartCardProps) => (
  <Card className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted">{subtitle}</p>
        <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
      </div>
      {change && <Badge tone={trend === 'up' ? 'success' : 'danger'}>{change}</Badge>}
    </div>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -18, right: 0 }}>
          <defs>
            <linearGradient id="cashflow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.45} />
              <stop offset="95%" stopColor="var(--brand)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted)', fontSize: 12 }}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip content={<TooltipContent />} cursor={{ stroke: 'var(--brand)', strokeDasharray: 4 }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--brand)"
            strokeWidth={2.5}
            fill="url(#cashflow)"
            activeDot={{ r: 5, fill: 'var(--brand)' }}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

export default ChartCard;

