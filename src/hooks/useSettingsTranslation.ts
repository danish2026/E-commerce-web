import { useLanguage } from '../context/LanguageContext';
import { settingsTranslations, SettingsTranslationKey } from '../translations/settings';

export const useSettingsTranslation = () => {
  const { language } = useLanguage();

  const t = (key: SettingsTranslationKey, params?: Record<string, string | number>) => {
    let translation = settingsTranslations[language][key] || settingsTranslations.en[key];
    
    if (params) {
      for (const paramKey in params) {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      }
    }
    
    return translation;
  };

  return { 
    t: new Proxy({} as typeof settingsTranslations.en, {
      get: (target, prop: SettingsTranslationKey) => t(prop),
    }),
    translate: t,
    language 
  };
};



