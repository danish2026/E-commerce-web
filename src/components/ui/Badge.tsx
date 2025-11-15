import clsx from 'clsx';

type BadgeTone = 'success' | 'danger' | 'muted' | 'brand';

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
}

const toneMap: Record<BadgeTone, string> = {
  success: 'text-accent-1 bg-accent-1/10',
  danger: 'text-accent-2 bg-accent-2/10',
  muted: 'text-muted bg-surface-2',
  brand: 'text-white bg-brand/90',
};

export const Badge = ({ tone = 'muted', children }: BadgeProps) => (
  <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', toneMap[tone])}>
    {children}
  </span>
);

export default Badge;

