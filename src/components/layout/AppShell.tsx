import { ReactNode } from 'react';
import clsx from 'clsx';

interface AppShellProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  className?: string;
}

export const AppShell = ({ sidebar, header, children, className }: AppShellProps) => (
  <div className="min-h-screen bg-[var(--bg-secondary)] text-text-primary relative">
    {/* Background gradient overlay for glassmorphism effect */}
    <div className="fixed inset-0 bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-primary)] to-[var(--bg-secondary)] opacity-50 pointer-events-none" />
    <div className={clsx('relative flex min-h-screen gap-8 px-4 py-8 md:px-8 z-10', className)}>
      {sidebar}
      <div className="flex-1 flex flex-col">
        {header}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  </div>
);

export default AppShell;

