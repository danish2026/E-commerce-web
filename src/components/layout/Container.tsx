import { ReactNode } from 'react';
import clsx from 'clsx';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export const Container = ({ children, className, maxWidth = 'full' }: ContainerProps) => (
  <div className={clsx('w-full mx-auto', maxWidthClasses[maxWidth], className)}>
    {children}
  </div>
);

export default Container;

