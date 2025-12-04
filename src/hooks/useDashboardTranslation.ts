import { useLanguage } from '../context/LanguageContext';
import { dashbordTranslations, DashbordTranslationKey } from '../translations/dashbord';

export const useDashboardTranslation = () => {
  const { language } = useLanguage();

  const t = (key: DashbordTranslationKey, params?: Record<string, string | number>) => {
    let translation = dashbordTranslations[language][key] || dashbordTranslations.en[key];
    
    if (params) {
      for (const paramKey in params) {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      }
    }
    
    return translation;
  };

  return { 
    t: new Proxy({} as typeof dashbordTranslations.en, {
      get: (target, prop: DashbordTranslationKey) => t(prop),
    }),
    translate: t,
    language 
  };
};

