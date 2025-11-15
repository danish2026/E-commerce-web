import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pressed: boolean;
  label: string;
}

export const Toggle = ({ pressed, label, className, ...props }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-label={label}
    aria-checked={pressed}
    className={clsx(
      'relative inline-flex h-6 w-12 items-center rounded-full transition bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
      pressed && 'bg-brand/90',
      className,
    )}
    {...props}
  >
    <span
      className={clsx(
        'inline-block h-5 w-5 translate-x-1 rounded-full bg-white transition',
        pressed && 'translate-x-6',
      )}
    />
  </button>
);

export default Toggle;

