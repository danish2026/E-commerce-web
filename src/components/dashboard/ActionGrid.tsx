import { ReactNode } from 'react';

interface ActionItem {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

interface ActionGridProps {
  items: ActionItem[];
}

export const ActionGrid = ({ items }: ActionGridProps) => (
  <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
    {items.map((item) => (
      <button
        key={item.label}
        type="button"
        onClick={item.onClick}
        className="flex flex-col items-center gap-2 rounded-3xl bg-surface-2/80 px-3 py-4 text-sm font-medium text-text-secondary transition hover:-translate-y-0.5 hover:bg-surface-1 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        aria-label={item.label}
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand">{item.icon}</span>
        {item.label}
      </button>
    ))}
  </div>
);

export default ActionGrid;

