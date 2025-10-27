// store/useLanguageStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const languageMap = {
  en: 1,
  es: 6,
  ja: 5,
};

const useLanguageStore = create(
  persist(
    (set) => ({
      currentLocale: 'en',
      languageId: languageMap['en'],
      setLocale: (locale) =>
        set(() => {
          const newLangId = languageMap[locale] || 1;
          return {
            currentLocale: locale,
            languageId: newLangId,
          };
        }),
    }),
    { name: 'language-store' } // LocalStorage key
  )
);

export default useLanguageStore;
