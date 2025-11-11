import { useLanguageStore } from '@/store/useLanguageStore';
import enTranslations from '@/locales/en.json';
import urTranslations from '@/locales/ur.json';

type TranslationKey = keyof typeof enTranslations.rawMaterial;

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const translations = language === 'ur' ? urTranslations : enTranslations;

  const t = (key: TranslationKey): string => {
    return translations.rawMaterial[key] || key;
  };

  return { t, language };
}

