// import { forwardRef, InputHTMLAttributes } from 'react';
// import clsx from 'clsx';

// export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
//   { className, ...props },
//   ref,
// ) {
//   return (
   
// <input
//   ref={ref}
//   className={clsx(
//     'w-full rounded-xl border border-surface-4 bg-surface-2 px-4 py-2.5 text-sm text-text-primary placeholder:text-muted',
//     'hover:border-brand focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40',
//     className
//   )}
//   {...props}
// />
//   );
// });

// export default Input;

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { RefreshCcw } from 'lucide-react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  onRefresh?: () => void;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, onRefresh, icon, iconPosition = 'left', ...props },
  ref,
) {
    const hasLeftIcon = Boolean(icon && iconPosition === 'left');
    const hasRightIcon = Boolean(icon && iconPosition === 'right');
    const needsRightPadding = hasRightIcon || Boolean(onRefresh);
    const needsExtraRightPadding = hasRightIcon && Boolean(onRefresh);

    return (
      <div className="relative w-full">
        {hasLeftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-muted">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full rounded-xl border border-surface-4 bg-surface-2 px-4 py-2.5 text-sm text-text-primary placeholder:text-muted',
            'hover:border-brand focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40',
            hasLeftIcon && 'pl-10',
            needsRightPadding && 'pr-12',
            needsExtraRightPadding && 'pr-16',
            className
          )}
          {...props}
        />
        {(hasRightIcon || onRefresh) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {hasRightIcon && (
              <span className="pointer-events-none flex items-center text-muted">
                {icon}
              </span>
            )}
            {onRefresh && (
              <RefreshCcw
                className="h-5 w-5 cursor-pointer text-muted hover:text-brand"
                onClick={onRefresh}
              />
            )}
          </div>
        )}
      </div>
    );
  },
);

export default Input;


