import { useLanguage } from '../context/LanguageContext';
import { billingTranslations, BillingTranslationKey } from '../translations/billing';

export const useBillingTranslation = () => {
  const { language } = useLanguage();
  const t = billingTranslations[language];

  const translate = (key: BillingTranslationKey, params?: Record<string, string | number>): string => {
    let translation = t[key] || billingTranslations.en[key] || key;
    
    // Replace placeholders like {count}, {name}, {date}, {stock} with actual values
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }
    
    return translation;
  };

  return { t, translate, language };
};

 