import { useLanguage } from '../context/LanguageContext';
import { reportingTranslations, ReportingTranslationKey } from '../translations/reporting';

export const useReportingTranslation = () => {
  const { language } = useLanguage();
  const t = reportingTranslations[language];

  const translate = (key: ReportingTranslationKey, params?: Record<string, string | number>): string => {
    let translation = t[key] || reportingTranslations.en[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }
    
    return translation;
  };

  return { t, translate, language };
};



