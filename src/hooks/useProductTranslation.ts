import { useLanguage } from '../context/LanguageContext';
import { productTranslations, ProductTranslationKey } from '../translations/product';

export const useProductTranslation = () => {
  const { language } = useLanguage();
  const t = productTranslations[language];

  const translate = (key: ProductTranslationKey, params?: Record<string, string | number>): string => {
    let translation = t[key] || productTranslations.en[key] || key;
    
    // Replace placeholders like {count} with actual values
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }
    
    return translation;
  };

  return { t, translate, language };
};

