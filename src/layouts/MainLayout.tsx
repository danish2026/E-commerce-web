import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { AppShell, Sidebar, Topbar } from '../components/layout';

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AppShell
      sidebar={<Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((prev) => !prev)} />}
      header={<Topbar />}
    >
      <Outlet />
    </AppShell>
  );
};

export default MainLayout;

