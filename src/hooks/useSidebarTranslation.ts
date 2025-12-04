import { useLanguage } from '../context/LanguageContext';
import { sidebarTranslations, SidebarTranslationKey } from '../translations/sidebar';

export const useSidebarTranslation = () => {
  const { language } = useLanguage();

  const t = (key: SidebarTranslationKey, params?: Record<string, string | number>) => {
    let translation = sidebarTranslations[language][key] || sidebarTranslations.en[key];
    
    if (params) {
      for (const paramKey in params) {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      }
    }
    
    return translation;
  };

  return { 
    t: new Proxy({} as typeof sidebarTranslations.en, {
      get: (target, prop: SidebarTranslationKey) => t(prop),
    }),
    translate: t,
    language 
  };
};

