import { create } from 'zustand';

type Language = 'en' | 'ur';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

// Load from localStorage
const loadLanguage = (): Language => {
  try {
    const stored = localStorage.getItem('language-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.language || 'en';
    }
  } catch (error) {
    console.error('Error loading language:', error);
  }
  return 'en';
};

// Save to localStorage
const saveLanguage = (lang: Language) => {
  try {
    localStorage.setItem('language-storage', JSON.stringify({ language: lang }));
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

const initialLanguage = loadLanguage();

export const useLanguageStore = create<LanguageState>((set) => ({
  language: initialLanguage,
  setLanguage: (lang) => {
    saveLanguage(lang);
    set({ language: lang });
  },
  toggleLanguage: () => {
    set((state) => {
      const newLang = state.language === 'en' ? 'ur' : 'en';
      saveLanguage(newLang);
      return { language: newLang };
    });
  },
}));

