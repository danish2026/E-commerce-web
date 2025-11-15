import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { ChevronLeft, ChevronRight, Home, CreditCard, Receipt, Users, BarChart2, Bell, Settings } from '../icons';
import { Button } from '../ui';

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

const sections = [
  {
    label: 'Dashboard',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: Home },

    ],
  },
  {
    label: 'Purchase',
    items: [
      { label: 'Purchase', to: '/purchase', icon: Users },
    ],
  },
  {
    label: 'Others',
    items: [
      { label: 'Settings', to: '/settings', icon: Settings },
      { label: 'Support', to: '/support', icon: Bell },
    ],
  },
];

export const Sidebar = ({ collapsed, onToggleCollapse }: SidebarProps) => (
  <aside
    className={clsx(
      'sticky top-6 h-[calc(100vh-3rem)] rounded-3xl bg-surface-1/80 p-4 shadow-card backdrop-blur-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-brand/40',
      collapsed ? 'w-[5rem]' : 'w-64',
    )}
    aria-label="Primary navigation"
  >
    <div className="flex items-center justify-between">
      {!collapsed && (
        <div>
          {/* <p className="text-xs uppercase tracking-[0.3em] text-muted">bliss</p> */}
          <p className="text-lg font-semibold text-text-primary">E-Comerce</p>
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        aria-label="Toggle sidebar"
        onClick={onToggleCollapse}
        className="rounded-2xl p-0 text-text-primary"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </Button>
    </div>

    <nav className="mt-6 space-y-6">
      {sections.map((section) => (
        <div key={section.label}>
          {!collapsed && <p className="mb-2 text-xs font-semibold uppercase text-muted">{section.label}</p>}
          <ul className="space-y-1" role="list">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-text-secondary focus-visible:outline focus-visible:outline-brand',
                        collapsed ? 'justify-center' : 'justify-start',
                        isActive ? 'bg-brand/15 text-brand' : 'hover:bg-brand/10 hover:text-brand',
                      )
                    }
                    title={collapsed ? item.label : undefined}
                    tabIndex={0}
                  >
                    <Icon size={20} aria-hidden />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  </aside>
);

export default Sidebar;

