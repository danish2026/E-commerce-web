import { useLanguage } from '../context/LanguageContext';
import { purchaseTranslations, PurchaseTranslationKey } from '../translations/purchase';

export const usePurchaseTranslation = () => {
  const { language } = useLanguage();
  const t = purchaseTranslations[language];

  const translate = (key: PurchaseTranslationKey, params?: Record<string, string | number>): string => {
    let translation = t[key] || purchaseTranslations.en[key] || key;
    
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


