// utils/localizedRouter.js
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import useLanguageStore from '@/store/useLanguageStore';
import { withEventPath } from '@/lib/eventRouting';

export function useLocalizedRouter() {
  const router = useRouter();
  const { currentLocale } = useLanguageStore();

  const prefixPath = useCallback(
    (url) => withEventPath(url, router.asPath, router.locale, router.defaultLocale),
    [router.asPath, router.locale, router.defaultLocale]
  );
  const localizedPush = useCallback(
    (url, as, options) =>
      router.push(prefixPath(url), as ? prefixPath(as) : as, {
        ...options,
        locale: currentLocale,
      }),
    [currentLocale, prefixPath, router.push]
  );
  const localizedReplace = useCallback(
    (url, as, options) =>
      router.replace(prefixPath(url), as ? prefixPath(as) : as, {
        ...options,
        locale: currentLocale,
      }),
    [currentLocale, prefixPath, router.replace]
  );

  return { ...router, localizedPush, localizedReplace };
}
