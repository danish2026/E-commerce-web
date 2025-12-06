import clsx from 'clsx';

import { Card, Badge } from '../ui';

export interface ActivityItem {
  id: string;
  provider: string;
  account: string;
  date: string;
  amount: string;
  type: 'in' | 'out';
}

interface ActivityListProps {
  items: ActivityItem[];
  filterRange?: string;
  className?: string;
}

export const ActivityList = ({ items, filterRange, className }: ActivityListProps) => (
  <Card className={clsx("space-y-4", className)}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted">Recent activity</p>
        <h3 className="text-xl font-semibold text-text-primary">Transactions</h3>
      </div>
      {filterRange && <Badge tone="muted">{filterRange}</Badge>}
    </div>
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2/70 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{item.provider}</p>
            <p className="text-xs text-muted">{item.account}</p>
          </div>
          <div className="text-right">
            <p
              className={clsx(
                'text-sm font-semibold',
                item.type === 'in' ? 'text-accent-1' : 'text-accent-2',
              )}
            >
              {item.amount}
            </p>
            <p className="text-xs text-muted">{item.date}</p>
          </div>
        </li>
      ))}
    </ul>
  </Card>
);

export default ActivityList;

