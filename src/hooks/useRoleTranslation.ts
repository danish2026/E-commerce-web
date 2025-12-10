import { useLanguage } from '../context/LanguageContext';
import { roleTranslations, RoleTranslationKey } from '../translations/role';

export const useRoleTranslation = () => {
  const { language } = useLanguage();

  const t = (key: RoleTranslationKey, params?: Record<string, string | number>) => {
    let translation = roleTranslations[language][key] || roleTranslations.en[key];
    
    if (params) {
      for (const paramKey in params) {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      }
    }
    
    return translation;
  };

  return { 
    t: new Proxy({} as typeof roleTranslations.en, {
      get: (target, prop: RoleTranslationKey) => t(prop),
    }),
    translate: t,
    language 
  };
};

