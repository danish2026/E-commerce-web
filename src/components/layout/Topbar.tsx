import { useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useHeaderTranslation } from '../../hooks/useHeaderTranslation';
import { Bell, Moon, SunMedium, LogOut } from '../icons';
import { Avatar, Button, IconButton, Select, Toggle } from '../ui';

const getModuleName = (pathname: string, t: ReturnType<typeof useHeaderTranslation>['t']): string => {
  // Remove leading slash and split by '/'
  const segments = pathname.replace(/^\//, '').split('/').filter(Boolean);
  
  // If no segments or at root/dashboard
  if (segments.length === 0 || segments[0] === 'dashboard') {
    return t.dashboard;
  }
  
  // Get the first segment (main module)
  const mainModule = segments[0];
  
  // Map route segments to display names using translations
  const moduleMap: Record<string, string> = {
    'sales': t.sales,
    'purchase': t.purchase,
    'purchase-item': t.purchaseItem,
    'invoice': t.invoice,
    'dashboard': t.dashboard,
    'categories': t.categories,
    'product': t.product,
    'billing': t.billing,
    'settings': t.settings,
    'permissions': t.permissions,
    'employees': t.employees,
    'reporting': t.reporting,
  };
  
  // Check if we have a mapped name, otherwise format the route name
  return moduleMap[mainModule] || mainModule
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const Topbar = () => {
  const { mode, toggleMode } = useThemeMode();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useHeaderTranslation();

  const moduleName = getModuleName(location.pathname, t);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    // <header className="glass-header fixed flex flex-col gap-4 p-6 mb-6">
    <header className="glass-header border border-transparent hover:border-[rgb(31,154,138)] top-0 left-0 right-0 z-50 flex flex-col gap-4 p-6 mb-6">

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div>
            {/* <p className="text-xs uppercase tracking-[0.25em] text-muted">Balance overview</p> */}
            <h1 className="text-3xl font-semibold text-text-primary">{moduleName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full px-3 py-1.5 glass-panel border border-[var(--glass-border)]">
            {mode === 'dark' ? <Moon size={16} /> : <SunMedium size={16} />}
            <Toggle pressed={mode === 'dark'} label={t.toggleTheme} onClick={toggleMode} />
          </div>
          <div className="glass-panel border border-[var(--glass-border)] rounded-[22px]">
            <IconButton label={t.notifications} className="hover:bg-[var(--glass-bg-hover)] transition-colors">
              <Bell size={18} />
            </IconButton>
          </div>
          <div className="glass-panel border border-[var(--glass-border)] rounded-xl">
            <Button
              variant="ghost"
              onClick={handleLogout}
              leadingIcon={<LogOut size={18} />}
              className="hover:bg-[var(--glass-bg-hover)]  transition-colors"
            >
              {t.logout}
            </Button>
          </div>
          <div className="glass-panel border border-[var(--glass-border)] rounded-full p-1">
            <Avatar name="Super Admin" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

