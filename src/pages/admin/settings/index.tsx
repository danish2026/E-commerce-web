import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Toggle } from '../../../components/ui/Toggle';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Space, message } from 'antd';
import { SettingOutlined, SaveOutlined, ReloadOutlined, MoonOutlined, SunOutlined, BellOutlined, GlobalOutlined, EyeOutlined, DatabaseOutlined } from '@ant-design/icons';
import LanguageSelector from '../../../components/purchase/LanguageSelector';
import { useThemeMode } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useSettingsTranslation } from '../../../hooks/useSettingsTranslation';

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
  const { t } = useSettingsTranslation();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Always use current language from context, not from saved settings
        // This ensures the dropdown shows the current language when you navigate back
        setSettings({ ...DEFAULT_SETTINGS, ...parsed, language: language });
        // Sync theme with context
        if (parsed.theme && parsed.theme !== mode) {
          setMode(parsed.theme);
        }
        // Don't sync language from saved settings - always use current context language
      } catch (error) {
        console.error('Error loading settings:', error);
        message.error(t.failedToLoadSettings);
      }
    } else {
      // Initialize with current theme and language
      setSettings({ ...DEFAULT_SETTINGS, theme: mode, language: language });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Sync theme changes
  useEffect(() => {
    setSettings(prev => ({ ...prev, theme: mode }));
  }, [mode]);

  useEffect(() => {
    setSettings(prev => ({ ...prev, language: language }));
  }, []); // Only run on mount

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
    
    if (key === 'theme' && value !== mode) {
      setMode(value as 'light' | 'dark');
    }
    
    if (key === 'language' && ['en', 'hi', 'ar'].includes(value as string) && value !== language) {
      setLanguage(value as 'en' | 'hi' | 'ar');
    }
  };

  const handleSave = () => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      message.success(t.settingsSaved);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error(t.failedToSaveSettings);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setMode(DEFAULT_SETTINGS.theme);
    message.info(t.settingsReset);
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
                  {t.settings}
                </h1>
                <p className="text-sm mt-1 m-0" style={{ color: 'var(--text-secondary)' }}>
                  {t.settingsDescription}
                </p>
              </div>
            </div>
            <Space>
              {/* <LanguageSelector /> */}
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                style={{
                  height: '40px',
                }}
              >
                {t.reset}
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
                {t.saveChanges}
              </Button>
            </Space>
          </div>
        </div>

        {/* Theme Settings */}
        <SettingSection
          title={t.appearance}
          icon={<MoonOutlined style={{ fontSize: '20px', color: 'var(--brand)' }} />}
        >
          <SettingRow
            label={t.theme}
            description={t.themeDescription}
          >
            <div className="flex items-center gap-3">
              <SunOutlined style={{ color: mode === 'light' ? 'var(--brand)' : 'var(--text-secondary)' }} />
              <Toggle
                pressed={settings.theme === 'dark'}
                label={t.toggleTheme}
                onClick={() => {
                  const newTheme = settings.theme === 'light' ? 'dark' : 'light';
                  handleSettingChange('theme', newTheme);
                }}
              />
              <MoonOutlined style={{ color: mode === 'dark' ? 'var(--brand)' : 'var(--text-secondary)' }} />
            </div>
          </SettingRow>
        </SettingSection>

        {/* General Settings */}
        <SettingSection
          title={t.general}
          icon={<GlobalOutlined style={{ fontSize: '20px', color: 'var(--brand)' }} />}
        >
          <SettingRow
            label={t.language}
            description={t.languageDescription}
          >
            <Select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="en">{t.english}</option>
              <option value="hi">{t.hindi}</option>
              <option value="ar">{t.arabic}</option>
            </Select>
          </SettingRow>

          <SettingRow
            label={t.dateFormat}
            description={t.dateFormatDescription}
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
            label={t.timeFormat}
            description={t.timeFormatDescription}
          >
            <Select
              value={settings.timeFormat}
              onChange={(e) => handleSettingChange('timeFormat', e.target.value as '12h' | '24h')}
              style={{ width: '100%' }}
            >
              <option value="24h">{t.hour24}</option>
              <option value="12h">{t.hour12}</option>
            </Select>
          </SettingRow>

          <SettingRow
            label={t.currency}
            description={t.currencyDescription}
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
          title={t.notifications}
          icon={<BellOutlined style={{ fontSize: '20px', color: 'var(--brand)' }} />}
        >
          <SettingRow
            label={t.emailNotifications}
            description={t.emailNotificationsDescription}
          >
            <Toggle
              pressed={settings.emailNotifications}
              label={t.emailNotificationsLabel}
              onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
            />
          </SettingRow>

          <SettingRow
            label={t.pushNotifications}
            description={t.pushNotificationsDescription}
          >
            <Toggle
              pressed={settings.pushNotifications}
              label={t.pushNotificationsLabel}
              onClick={() => handleSettingChange('pushNotifications', !settings.pushNotifications)}
            />
          </SettingRow>

          <SettingRow
            label={t.orderNotifications}
            description={t.orderNotificationsDescription}
          >
            <Toggle
              pressed={settings.orderNotifications}
              label={t.orderNotificationsLabel}
              onClick={() => handleSettingChange('orderNotifications', !settings.orderNotifications)}
            />
          </SettingRow>

          <SettingRow
            label={t.inventoryAlerts}
            description={t.inventoryAlertsDescription}
          >
            <Toggle
              pressed={settings.inventoryAlerts}
              label={t.inventoryAlertsLabel}
              onClick={() => handleSettingChange('inventoryAlerts', !settings.inventoryAlerts)}
            />
          </SettingRow>
        </SettingSection>

        {/* Display Settings */}
        <SettingSection
          title={t.display}
          icon={<EyeOutlined style={{ fontSize: '20px', color: 'var(--brand)' }} />}
        >
          <SettingRow
            label={t.itemsPerPage}
            description={t.itemsPerPageDescription}
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
            label={t.showImages}
            description={t.showImagesDescription}
          >
            <Toggle
              pressed={settings.showImages}
              label={t.showImagesLabel}
              onClick={() => handleSettingChange('showImages', !settings.showImages)}
            />
          </SettingRow>

          <SettingRow
            label={t.compactMode}
            description={t.compactModeDescription}
          >
            <Toggle
              pressed={settings.compactMode}
              label={t.compactModeLabel}
              onClick={() => handleSettingChange('compactMode', !settings.compactMode)}
            />
          </SettingRow>
        </SettingSection>

        {/* Data Settings */}
        <SettingSection
          title={t.dataPerformance}
          icon={<DatabaseOutlined style={{ fontSize: '20px', color: 'var(--brand)' }} />}
        >
          <SettingRow
            label={t.autoRefresh}
            description={t.autoRefreshDescription}
          >
            <Toggle
              pressed={settings.autoRefresh}
              label={t.autoRefreshLabel}
              onClick={() => handleSettingChange('autoRefresh', !settings.autoRefresh)}
            />
          </SettingRow>

          {settings.autoRefresh && (
            <SettingRow
              label={t.refreshInterval}
              description={t.refreshIntervalDescription}
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
            label={t.dataRetention}
            description={t.dataRetentionDescription}
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
            {t.settingsNote}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Setting;
