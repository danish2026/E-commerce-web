// import { forwardRef, SelectHTMLAttributes } from 'react';
// import clsx from 'clsx';

// export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
//   { className, children, ...props },
//   ref,
// ) {
//   return (
//     <select
//       ref={ref}
//       className={clsx(
//         'w-full appearance-none rounded-xl border border-transparent bg-surface-2 px-4 py-2.5 text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40',
//         className,
//       )}
//       {...props}
//     >
//       {children}
//     </select>
//   );
// });

// export default Select;

import { forwardRef, SelectHTMLAttributes } from 'react';
import clsx from 'clsx';
import { ChevronDown } from "lucide-react";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={clsx(
            // Antd Styled Select
            'w-full rounded-lg border border-surface-4 bg-surface-1 px-4 py-2.5 text-sm text-text-primary',
            'hover:border-brand transition-all',
            'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30',
            'appearance-none pr-10',
            className
          )}
          {...props}
        >
          {children}
        </select>

        {/* Antd Style Dropdown Arrow */}
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none w-4 h-4"
        />
      </div>
    );
  }
);

export default Select;

