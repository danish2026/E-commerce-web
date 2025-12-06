import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguage } from '../../context/LanguageContext';
import { usePurchaseTranslation } from '../../hooks/usePurchaseTranslation';

const { Option } = Select;

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = usePurchaseTranslation();

  const handleLanguageChange = (value: 'en' | 'hi' | 'ar') => {
    setLanguage(value);
  };

  return (
    <Select
      value={language}
      onChange={handleLanguageChange}
      style={{ width: 150, height: '40px' }}
      prefixCls="ant-select"
      suffixIcon={<GlobalOutlined />}
    >
      <Option value="en">
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🇬🇧</span>
          <span>{t.english}</span>
        </span>
      </Option>
      <Option value="hi">
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🇮🇳</span>
          <span>{t.hindi}</span>
        </span>
      </Option>
      <Option value="ar">
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🇸🇦</span>
          <span>{t.arabic}</span>
        </span>
      </Option>
    </Select>
  );
};

export default LanguageSelector;



