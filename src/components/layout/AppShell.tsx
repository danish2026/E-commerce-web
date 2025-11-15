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
    <div className={clsx('flex min-h-screen gap-6 px-3 py-6 md:px-6', className)}>
      {sidebar}
      <div className="flex-1 rounded-3xl bg-[var(--bg-primary)]/80 p-4 shadow-card backdrop-blur-xl lg:p-6">
        {header}
        <main className="mt-6 space-y-6">{children}</main>
      </div>
    </div>
  </div>
);

export default AppShell;

