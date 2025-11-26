import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { ChevronLeft, ChevronRight, Home, CreditCard, Receipt, Users, BarChart2, Settings, Shield } from '../icons';
import { Button } from '../ui';
import { List, Package } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

type MenuItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
  module?: string;
};

type MenuSection = {
  label?: string;
  items: MenuItem[];
};

// Get all menu sections for SUPER_ADMIN
const getMenuSections = (): MenuSection[] => {
  return [
    {
      label: 'Dashboard',
      items: [
        { label: 'Dashboard', to: '/dashboard', icon: Home },
      ],
    },
    {
      label: 'Sales',
      items: [
        { label: 'Sales', to: '/sales', icon: BarChart2, module: 'sales' },
      ],
    },
    {
      label: 'Purchase',
      items: [
        { label: 'Purchase', to: '/purchase', icon: Users, module: 'purchase' },
        { label: 'Purchase Item', to: '/purchase-item', icon: CreditCard, module: 'purchase-item' },
        { label: 'Invoice', to: '/invoice', icon: Receipt, module: 'invoice' },
      ],
    },
    {
      label: 'Product Management',
      items: [
        { label: 'Categories', to: '/categories', icon: List, module: 'categories' },
        { label: 'Product', to: '/product', icon: Package, module: 'product' },
      ],
    },
    {
      items: [
        { label: 'Billing', to: '/billing', icon: CreditCard, module: 'billing' },
      ],
    },
    {
      label: 'Others',
      items: [
        { label: 'Settings', to: '/settings', icon: Settings, module: 'settings' },
        { label: 'Permissions', to: '/permissions', icon: Shield, module: 'permissions' },
        { label: 'Employees', to: '/employees', icon: Users, module: 'employees' },
      ],
    },
  ];
};

export const Sidebar = ({ collapsed, onToggleCollapse }: SidebarProps) => {
  const { hasModuleAccess, loading: permissionsLoading } = usePermissions();
  const sections = getMenuSections();

  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.module) {
          return true;
        }
        return hasModuleAccess(item.module);
      }),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={clsx(
        'glass-sidebar sticky top-8 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300',
        collapsed ? 'w-[5rem] p-2' : 'w-64 p-6',
      )}
      aria-label="Primary navigation"
    >
      <div className={clsx(
        'flex items-center pb-6 border-b border-[var(--glass-border)]',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div>
            <p className="text-lg font-semibold text-text-primary">E-Comerce</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          aria-label="Toggle sidebar"
          onClick={onToggleCollapse}
          className="rounded-xl p-2 text-text-primary hover:bg-[var(--glass-bg)] border border-transparent hover:border-[var(--glass-border)] transition-all duration-200"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <nav className="mt-6 space-y-6">
        {filteredSections.length === 0 && !permissionsLoading && (
          <p className="text-sm text-text-secondary px-2">
            You do not have access to any modules. Please contact your administrator.
          </p>
        )}
        {filteredSections.map((section, sectionIndex) => (
          <div key={section.label || `section-${sectionIndex}`}>
            {!collapsed && section.label && (
              <p className="mb-3 text-xs font-semibold uppercase text-muted tracking-wider px-2">
                {section.label}
              </p>
            )}
            <ul className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        clsx(
                          'glass-nav-item flex items-center rounded-xl py-2.5 text-sm font-medium text-text-secondary relative z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--glass-border)]',
                          collapsed ? 'justify-center px-2 gap-0' : 'justify-start px-4 gap-3',
                          isActive
                            ? 'active text-brand'
                            : 'hover:text-text-primary',
                        )
                      }
                      title={collapsed ? item.label : undefined}
                      tabIndex={0}
                    >
                      <Icon size={20} aria-hidden className="relative z-10 flex-shrink-0" />
                      {!collapsed && <span className="relative z-10">{item.label}</span>}
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
};

export default Sidebar;

