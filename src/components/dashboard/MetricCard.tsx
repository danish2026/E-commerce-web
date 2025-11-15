import clsx from 'clsx';

import { TrendUpIcon, TrendDownIcon } from '../icons';
import { Card } from '../ui';

export interface MetricCardProps {
  title: string;
  value: string;
  currencySymbol?: string;
  trend?: {
    percent: string;
    dir: 'up' | 'down';
  };
}

export const MetricCard = ({ title, value, currencySymbol, trend }: MetricCardProps) => (
  <Card className="p-6">
    <div className="text-sm text-muted">{title}</div>
    <div className="mt-2 text-3xl font-semibold text-text-primary">
      {currencySymbol}
      {value}
    </div>
    {trend && (
      <div
        className={clsx(
          'mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
          trend.dir === 'up' ? 'bg-accent-1/10 text-accent-1' : 'bg-accent-2/10 text-accent-2',
        )}
      >
        {trend.dir === 'up' ? <TrendUpIcon className="h-4 w-4" /> : <TrendDownIcon className="h-4 w-4" />}
        <span>{trend.percent}</span>
      </div>
    )}
  </Card>
);

export default MetricCard;

