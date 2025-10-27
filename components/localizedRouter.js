// utils/localizedRouter.js
import { useRouter } from 'next/router';
import useLanguageStore from '@/store/useLanguageStore';

export function useLocalizedRouter() {
  const router = useRouter();
  const { currentLocale } = useLanguageStore();

  const localizedPush = (url, as, options) => {
    return router.push(url, as, { ...options, locale: currentLocale });
  };

  const localizedReplace = (url, as, options) => {
    return router.replace(url, as, { ...options, locale: currentLocale });
  };

  return { ...router, localizedPush, localizedReplace };
}
