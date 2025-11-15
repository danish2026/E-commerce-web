import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => (
  <section
    className={clsx('rounded-3xl bg-surface-1/90 p-6 shadow-card backdrop-blur-md', className)}
  >
    {children}
  </section>
);

export default Card;

