import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:opacity-90',
  secondary: 'bg-surface-2 text-text-primary hover:bg-surface-1',
  ghost: 'bg-transparent text-text-primary hover:bg-surface-2/60',
  outline:
    'border border-white/10 text-text-primary hover:border-white/30 hover:bg-surface-2/40 dark:border-white/20',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    leadingIcon,
    trailingIcon,
    icon,
    iconPosition = 'left',
    children,
    ...props
  },
  ref,
) {
  const computedLeadingIcon = leadingIcon ?? (icon && iconPosition === 'left' ? icon : undefined);
  const computedTrailingIcon = trailingIcon ?? (icon && iconPosition === 'right' ? icon : undefined);

  return (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center gap-2 text-[14px] rounded-[8px] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {computedLeadingIcon && <span className="flex items-center">{computedLeadingIcon}</span>}
      {children && <span>{children}</span>}
      {computedTrailingIcon && <span className="flex items-center">{computedTrailingIcon}</span>}
    </button>
  );
});

export default Button;

