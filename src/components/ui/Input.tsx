import { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={clsx(
        'w-full rounded-xl border border-transparent bg-surface-2 px-4 py-2.5 text-sm text-text-primary placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40',
        className,
      )}
      {...props}
    />
  );
});

export default Input;

