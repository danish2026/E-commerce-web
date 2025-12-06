import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CheckCircleOutlined, CloseOutlined } from '@ant-design/icons';

import { AppShell, Sidebar, Topbar } from '../components/layout';

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for success message from navigation state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
      // Auto-hide message after 3 seconds
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <>
      {/* Success Modal Notification at Top Center */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] success-notification">
          <div className="bg-surface-1 rounded-2xl shadow-card border border-[var(--glass-border)] p-4 min-w-[300px] max-w-[600px] flex items-center gap-3 backdrop-blur-sm">
            <CheckCircleOutlined className="text-green-500 text-xl flex-shrink-0" />
            <p className="flex-1 text-text-primary font-medium">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="flex-shrink-0 text-muted hover:text-text-primary transition-colors p-1 rounded hover:bg-[var(--glass-bg-hover)]"
              aria-label="Close"
            >
              <CloseOutlined />
            </button>
          </div>
        </div>
      )}

      <AppShell
        sidebar={<Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((prev) => !prev)} />}
        header={<Topbar />}
      >
        <Outlet />
      </AppShell>
    </>
  );
};

export default MainLayout;

