import { useLanguage } from '../context/LanguageContext';
import { categoryTranslations, CategoryTranslationKey } from '../translations/categories';

export const useCategoryTranslation = () => {
  const { language } = useLanguage();
  const t = categoryTranslations[language];

  const translate = (key: CategoryTranslationKey, params?: Record<string, string | number>): string => {
    let translation = t[key] || categoryTranslations.en[key] || key;
    
    // Replace placeholders like {count} or {name} with actual values
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }
    
    return translation;
  };

  return { t, translate, language };
};



