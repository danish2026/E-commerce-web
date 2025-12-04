import { useLanguage } from '../context/LanguageContext';
import { permissionTranslations, PermissionTranslationKey } from '../translations/permission';

export const usePermissionTranslation = () => {
  const { language } = useLanguage();

  const t = (key: PermissionTranslationKey, params?: Record<string, string | number>) => {
    let translation = permissionTranslations[language][key] || permissionTranslations.en[key];
    
    if (params) {
      for (const paramKey in params) {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      }
    }
    
    return translation;
  };

  return { 
    t: new Proxy({} as typeof permissionTranslations.en, {
      get: (target, prop: PermissionTranslationKey) => t(prop),
    }),
    translate: t,
    language 
  };
};

