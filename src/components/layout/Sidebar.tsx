import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { ChevronLeft, ChevronRight, Home, CreditCard, Receipt, Users, BarChart2, Bell, Settings } from '../icons';
import { Button } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../common/enums/role.enum';

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

type MenuItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
  roles?: Role[]; // If not specified, all authenticated users can see it
};

type MenuSection = {
  label?: string;
  items: MenuItem[];
};

const getMenuSections = (userRole: Role | string | null): MenuSection[] => {
  const baseSections: MenuSection[] = [
    {
      label: 'Dashboard',
      items: [
        { label: 'Dashboard', to: '/dashboard', icon: Home },
      ],
    },
  ];

  // Purchase section - Only for SUPER_ADMIN and SALES_MANAGER
  if (userRole === Role.SUPER_ADMIN || userRole === Role.SALES_MANAGER) {
    baseSections.push({
      items: [
        { label: 'Purchase', to: '/purchase', icon: Users, roles: [Role.SUPER_ADMIN, Role.SALES_MANAGER] },
        { label: 'Invoice', to: '/invoice', icon: Receipt, roles: [Role.SUPER_ADMIN, Role.SALES_MANAGER] },
        { label: 'Purchase Item', to: '/purchase-item', icon: CreditCard, roles: [Role.SUPER_ADMIN, Role.SALES_MANAGER] },
      ],
    });
  }

  // Sales section - All roles can access
  baseSections.push({
    items: [
      { label: 'Sales', to: '/sales', icon: BarChart2 },
    ],
  });

  // User Management - Only for SUPER_ADMIN
  if (userRole === Role.SUPER_ADMIN) {
    baseSections.push({
      label: 'Administration',
      items: [
        // TODO: Uncomment when Users page is created
        // { label: 'Users', to: '/users', icon: Users, roles: [Role.SUPER_ADMIN] },
      ],
    });
  }

  // Others section - All authenticated users
  baseSections.push({
    label: 'Others',
    items: [
      { label: 'Settings', to: '/settings', icon: Settings },
      { label: 'Support', to: '/support', icon: Bell },
    ],
  });

  return baseSections;
};

export const Sidebar = ({ collapsed, onToggleCollapse }: SidebarProps) => {
  const { role } = useAuth();
  const sections = getMenuSections(role);

  // Filter menu items based on user role
  const filteredSections = sections.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      // If no roles specified, show to all authenticated users
      if (!item.roles) {
        return true;
      }
      // Otherwise, check if user role is in allowed roles
      return role && item.roles.includes(role as Role);
    }),
  })).filter((section) => section.items.length > 0); // Remove empty sections

  return (
    <aside
      className={clsx(
        'glass-sidebar sticky top-8 h-[calc(100vh-4rem)] p-6 transition-all duration-300',
        collapsed ? 'w-[5rem]' : 'w-64',
      )}
      aria-label="Primary navigation"
    >
      <div className="flex items-center justify-between pb-6 border-b border-[var(--glass-border)]">
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
          className="rounded-xl p-2 text-text-primary hover:bg-[var(--glass-bg)] border border-transparent hover:border-[var(--glass-border)] transition-all duration-200"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <nav className="mt-6 space-y-6">
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
                          'glass-nav-item flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary relative z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--glass-border)]',
                          collapsed ? 'justify-center px-2' : 'justify-start',
                          isActive
                            ? 'active text-brand'
                            : 'hover:text-text-primary',
                        )
                      }
                      title={collapsed ? item.label : undefined}
                      tabIndex={0}
                    >
                      <Icon size={20} aria-hidden className="relative z-10" />
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

