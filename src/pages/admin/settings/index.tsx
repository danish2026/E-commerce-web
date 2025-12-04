import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Toggle } from '../../../components/ui/Toggle';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Space, message } from 'antd';
import { SettingOutlined, SaveOutlined, ReloadOutlined, MoonOutlined, SunOutlined, BellOutlined, GlobalOutlined, EyeOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useThemeMode } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

interface AppSettings {
  // Theme
  theme: 'light' | 'dark';
  
  // General
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  orderNotifications: boolean;
  inventoryAlerts: boolean;
  
  // Display
  itemsPerPage: number;
  showImages: boolean;
  compactMode: boolean;
  
  // Data
  autoRefresh: boolean;
  refreshInterval: number;
  dataRetentionDays: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  language: 'en',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  currency: 'INR',
  emailNotifications: true,
  pushNotifications: true,
  orderNotifications: true,
  inventoryAlerts: true,
  itemsPerPage: 10,
  showImages: true,
  compactMode: false,
  autoRefresh: false,
  refreshInterval: 30,
  dataRetentionDays: 90,
};

const SETTINGS_STORAGE_KEY = 'app-settings';

const Setting = () => {
  const { mode, setMode, toggleMode } = useThemeMode();
  const { language, setLanguage } = useLanguage();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        // Sync theme with context
        if (parsed.theme && parsed.theme !== mode) {
          setMode(parsed.theme);
        }
        // Sync language with context
        if (parsed.language && ['en', 'hi', 'ar'].includes(parsed.language) && parsed.language !== language) {
          setLanguage(parsed.language as 'en' | 'hi' | 'ar');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        message.error('Failed to load saved settings');
      }
    } else {
      // Initialize with current theme and language
      setSettings({ ...DEFAULT_SETTINGS, theme: mode, language: language });
    }
  }, []);

  // Sync theme changes
  useEffect(() => {
    setSettings(prev => ({ ...prev, theme: mode }));
  }, [mode]);

  // Sync language changes
  useEffect(() => {
    setSettings(prev => ({ ...prev, language: language }));
  }, [language]);

  // Track changes
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setHasChanges(JSON.stringify(settings) !== JSON.stringify({ ...DEFAULT_SETTINGS, ...parsed }));
      } catch {
        setHasChanges(true);
      }
    } else {
      setHasChanges(JSON.stringify(settings) !== JSON.stringify(DEFAULT_SETTINGS));
    }
  }, [settings]);

  const handleSettingChange = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Special handling for theme
    if (key === 'theme' && value !== mode) {
      setMode(value as 'light' | 'dark');
    }
    
    // Special handling for language - change immediately when selected
    if (key === 'language' && ['en', 'hi', 'ar'].includes(value as string) && value !== language) {
      setLanguage(value as 'en' | 'hi' | 'ar');
    }
  };

  const handleSave = () => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      message.success('Settings saved successfully!');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Failed to save settings');
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setMode(DEFAULT_SETTINGS.theme);
    message.info('Settings reset to defaults');
  };

  const SettingSection = ({ 
    title, 
    icon, 
    children 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
  }) => (
    <Card className="mb-6">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </Card>
  );

  const SettingRow = ({ 
    label, 
    description, 
    children 
  }: { 
    label: string; 
    description?: string; 
    children: React.ReactNode;
  }) => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-3 border-b border-[var(--glass-border)] last:border-0">
      <div className="flex-1">
        <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
          {label}
        </div>
        {description && (
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </div>
        )}
      </div>
      <div className="md:w-48 flex justify-end">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-secondary p-7">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-surface-1 rounded-2xl shadow-card p-8 mb-6 border border-[var(--glass-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SettingOutlined style={{ fontSize: '28px', color: 'var(--brand)' }} />
              <div>
                <h1 className="text-3xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                  Settings
                </h1>
                <p className="text-sm mt-1 m-0" style={{ color: 'var(--text-secondary)' }}>
                  Manage your application preferences and configurations
                </p>
              </div>
            </div>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                style={{
                  height: '40px',
                }}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                disabled={!hasChanges}
                style={{
                  height: '40px',
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                  opacity: hasChanges ? 1 : 0.5,
                }}
              >
                Save Changes
              </Button>
            </Space>
          </div>
        </div>

        {/* Theme Settings */}
        <SettingSection
          title="Appearance"
          icon={<MoonOutlined style={{ fontSize: '20px', color: 'var(--brand)' }} />}
        >
          <SettingRow
            label="Theme"
            description="Choose between light and dark mode"
          >
            <div className="flex items-center gap-3">
              <SunOutlined style={{ color: mode === 'light' ? 'var(--brand)' : 'var(--text-secondary)' }} />
              <Toggle
                pressed={settings.theme === 'dark'}
                label="Toggle theme"
                onClick={() => {
                  const newTheme = settings.theme === 'light' ? 'dark' : 'light';
                  handleSettingChange('theme', newTheme);
                  toggleMode();
                }}
              />
              <MoonOutlined style={{ color: mode === 'dark' ? 'var(--brand)' : 'var(--text-secondary)' }} />
            </div>
          </SettingRow>
        </SettingSection>

        {/* General Settings */}
        <SettingSection
          title="General"
          icon={<GlobalOutlined style={{ fontSize: '20px', color: 'var(--brand)' }} />}
        >
          <SettingRow
            label="Language"
            description="Select your preferred language"
          >
            <Select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ar">Arabic</option>
            </Select>
          </SettingRow>

          <SettingRow
            label="Date Format"
            description="How dates are displayed"
          >
            <Select
              value={settings.dateFormat} 
              onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="DD-MM-YYYY">DD-MM-YYYY</option>
            </Select>
          </SettingRow>

          <SettingRow
            label="Time Format"
            description="12-hour or 24-hour clock"
          >
            <Select
              value={settings.timeFormat}
              onChange={(e) => handleSettingChange('timeFormat', e.target.value as '12h' | '24h')}
              style={{ width: '100%' }}
            >
              <option value="24h">24 Hour</option>
              <option value="12h">12 Hour</option>
            </Select>
          </SettingRow>

          <SettingRow
            label="Currency"
            description="Default currency for transactions"
          >
            <Select
              value={settings.currency}
              onChange={(e) => handleSettingChange('currency', e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </Select>
          </SettingRow>
        </SettingSection>

        {/* Notification Settings */}
        <SettingSection
          title="Notifications"
          icon={<BellOutlined style={{ fontSize: '20px', color: 'var(--brand)' }} />}
        >
          <SettingRow
            label="Email Notifications"
            description="Receive notifications via email"
          >
            <Toggle
              pressed={settings.emailNotifications}
              label="Email notifications"
              onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
            />
          </SettingRow>

          <SettingRow
            label="Push Notifications"
            description="Receive browser push notifications"
          >
            <Toggle
              pressed={settings.pushNotifications}
              label="Push notifications"
              onClick={() => handleSettingChange('pushNotifications', !settings.pushNotifications)}
            />
          </SettingRow>

          <SettingRow
            label="Order Notifications"
            description="Get notified about new orders"
          >
            <Toggle
              pressed={settings.orderNotifications}
              label="Order notifications"
              onClick={() => handleSettingChange('orderNotifications', !settings.orderNotifications)}
            />
          </SettingRow>

          <SettingRow
            label="Inventory Alerts"
            description="Alert when stock is low"
          >
            <Toggle
              pressed={settings.inventoryAlerts}
              label="Inventory alerts"
              onClick={() => handleSettingChange('inventoryAlerts', !settings.inventoryAlerts)}
            />
          </SettingRow>
        </SettingSection>

        {/* Display Settings */}
        <SettingSection
          title="Display"
          icon={<EyeOutlined style={{ fontSize: '20px', color: 'var(--brand)' }} />}
        >
          <SettingRow
            label="Items Per Page"
            description="Number of items shown in tables"
          >
            <Select
              value={settings.itemsPerPage.toString()}
              onChange={(e) => handleSettingChange('itemsPerPage', parseInt(e.target.value))}
              style={{ width: '100%' }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
          </SettingRow>

          <SettingRow
            label="Show Images"
            description="Display product images in lists"
          >
            <Toggle
              pressed={settings.showImages}
              label="Show images"
              onClick={() => handleSettingChange('showImages', !settings.showImages)}
            />
          </SettingRow>

          <SettingRow
            label="Compact Mode"
            description="Use a more compact layout"
          >
            <Toggle
              pressed={settings.compactMode}
              label="Compact mode"
              onClick={() => handleSettingChange('compactMode', !settings.compactMode)}
            />
          </SettingRow>
        </SettingSection>

        {/* Data Settings */}
        <SettingSection
          title="Data & Performance"
          icon={<DatabaseOutlined style={{ fontSize: '20px', color: 'var(--brand)' }} />}
        >
          <SettingRow
            label="Auto Refresh"
            description="Automatically refresh data"
          >
            <Toggle
              pressed={settings.autoRefresh}
              label="Auto refresh"
              onClick={() => handleSettingChange('autoRefresh', !settings.autoRefresh)}
            />
          </SettingRow>

          {settings.autoRefresh && (
            <SettingRow
              label="Refresh Interval (seconds)"
              description="How often to refresh data"
            >
              <Input
                type="number"
                min="10"
                max="300"
                value={settings.refreshInterval.toString()}
                onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value) || 30)}
                style={{ width: '100%' }}
              />
            </SettingRow>
          )}

          <SettingRow
            label="Data Retention (days)"
            description="How long to keep historical data"
          >
            <Input
              type="number"
              min="30"
              max="365"
              value={settings.dataRetentionDays.toString()}
              onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value) || 90)}
              style={{ width: '100%' }}
            />
          </SettingRow>
        </SettingSection>

        {/* Footer Note */}
        <div className="bg-surface-1 rounded-2xl shadow-card p-6 border border-[var(--glass-border)] text-center">
          <p className="text-sm m-0" style={{ color: 'var(--text-secondary)' }}>
            Settings are saved locally in your browser. Changes take effect immediately after saving.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Setting;
