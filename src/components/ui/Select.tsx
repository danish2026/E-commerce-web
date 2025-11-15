import { forwardRef, SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={clsx(
        'w-full appearance-none rounded-xl border border-transparent bg-surface-2 px-4 py-2.5 text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export default Select;

