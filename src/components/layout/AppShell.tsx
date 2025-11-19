import { ReactNode } from 'react';
import clsx from 'clsx';

interface AppShellProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  className?: string;
}

export const AppShell = ({ sidebar, header, children, className }: AppShellProps) => (
  <div className="min-h-screen bg-[var(--bg-secondary)] text-text-primary">
    <div className={clsx('flex min-h-screen gap-8 px-4 py-8 md:px-8', className)}>
      {sidebar}
      <div className="flex-1 flex flex-col">
        {header}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  </div>
);

export default AppShell;

