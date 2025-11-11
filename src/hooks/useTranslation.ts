import { useLanguageStore } from '@/store/useLanguageStore';
import enTranslations from '@/locales/en.json';
import urTranslations from '@/locales/ur.json';

type RawMaterialKey = keyof typeof enTranslations.rawMaterial;
type ProcessedMaterialKey = keyof typeof enTranslations.processedMaterial;

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const translations = language === 'ur' ? urTranslations : enTranslations;

  const t = (key: RawMaterialKey | ProcessedMaterialKey, section: 'rawMaterial' | 'processedMaterial' = 'rawMaterial'): string => {
    if (section === 'processedMaterial') {
      return translations.processedMaterial[key as ProcessedMaterialKey] || key;
    }
    return translations.rawMaterial[key as RawMaterialKey] || key;
  };

  return { t, language };
}

