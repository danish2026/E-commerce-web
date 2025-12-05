import { useLanguage } from '../context/LanguageContext';
import { headerTranslations, HeaderTranslationKey } from '../translations/header';

export const useHeaderTranslation = () => {
  const { language } = useLanguage();

  const t = (key: HeaderTranslationKey, params?: Record<string, string | number>) => {
    let translation = headerTranslations[language][key] || headerTranslations.en[key];
    
    if (params) {
      for (const paramKey in params) {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      }
    }
    
    return translation;
  };

  return { 
    t: new Proxy({} as typeof headerTranslations.en, {
      get: (target, prop: HeaderTranslationKey) => t(prop),
    }),
    translate: t,
    language 
  };
};


