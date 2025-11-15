import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: 'solid' | 'ghost';
  size?: 'sm' | 'md';
};

const sizes = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
};

const variants = {
  solid: 'bg-surface-2 text-text-primary hover:bg-surface-1 shadow-card',
  ghost: 'bg-transparent text-text-primary hover:bg-surface-2/70',
};

export const IconButton = ({ className, label, variant = 'solid', size = 'md', ...props }: IconButtonProps) => (
  <button
    type="button"
    aria-label={label}
    className={clsx(
      'inline-flex items-center justify-center rounded-full transition focus-visible:outline focus-visible:outline-brand focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40',
      sizes[size],
      variants[variant],
      className,
    )}
    {...props}
  />
);

export default IconButton;

