import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../theme/theme';
import { Bell, Moon, SunMedium, LogOut } from '../icons';
import { Avatar, Button, IconButton, Select, Toggle } from '../ui';

export const Topbar = () => {
  const [currency, setCurrency] = useState('USD');
  const { mode, toggleMode } = useThemeMode();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex flex-col gap-4 rounded-2xl bg-surface-1/70 p-4 shadow-card backdrop-blur">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted">Balance overview</p>
            <h1 className="text-3xl font-semibold text-text-primary">Global Finance</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Select
              aria-label="Select currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="pr-10"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </Select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted">⌄</span>
          </div>
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

