import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { Bell, Moon, SunMedium, LogOut } from '../icons';
import { Avatar, Button, IconButton, Select, Toggle } from '../ui';

export const Topbar = () => {
  const { mode, toggleMode } = useThemeMode();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex flex-col gap-4 pb-6 mb-6 border-b border-surface-2/50">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted">Balance overview</p>
            <h1 className="text-3xl font-semibold text-text-primary">Global Finance</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
 
          <div className="flex items-center gap-2 rounded-full bg-surface-2/70 px-3 py-1.5">
            {mode === 'dark' ? <Moon size={16} /> : <SunMedium size={16} />}
            <Toggle pressed={mode === 'dark'} label="Toggle theme" onClick={toggleMode} />
          </div>
          <IconButton label="Notifications">
            <Bell size={18} />
          </IconButton>
          <Button variant="ghost" onClick={handleLogout} leadingIcon={<LogOut size={18} />}>
            Logout
          </Button>
          <Avatar name="Danish Admin" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;

