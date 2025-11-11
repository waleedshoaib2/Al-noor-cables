import { useLanguageStore } from '@/store/useLanguageStore';
import enTranslations from '@/locales/en.json';
import urTranslations from '@/locales/ur.json';

type RawMaterialKey = keyof typeof enTranslations.rawMaterial;
type ProcessedMaterialKey = keyof typeof enTranslations.processedMaterial;
type ProductKey = keyof typeof enTranslations.product;
type CustomerKey = keyof typeof enTranslations.customer;

type TranslationKey = RawMaterialKey | ProcessedMaterialKey | ProductKey | CustomerKey;
type TranslationSection = 'rawMaterial' | 'processedMaterial' | 'product' | 'customer';

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const translations = language === 'ur' ? urTranslations : enTranslations;

  const t = (key: TranslationKey, section: TranslationSection = 'rawMaterial'): string => {
    if (section === 'processedMaterial') {
      return translations.processedMaterial[key as ProcessedMaterialKey] || key;
    }
    if (section === 'product') {
      return translations.product[key as ProductKey] || key;
    }
    if (section === 'customer') {
      return translations.customer[key as CustomerKey] || key;
    }
    return translations.rawMaterial[key as RawMaterialKey] || key;
  };

  return { t, language };
}

