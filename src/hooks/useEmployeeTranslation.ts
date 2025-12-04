import { useLanguage } from '../context/LanguageContext';
import { employeeTranslations, EmployeeTranslationKey } from '../translations/employee';

export const useEmployeeTranslation = () => {
  const { language } = useLanguage();
  const t = employeeTranslations[language];

  const translate = (key: EmployeeTranslationKey, params?: Record<string, string | number>): string => {
    let translation = t[key] || employeeTranslations.en[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }
    
    return translation;
  };

  return { t, translate, language };
};

