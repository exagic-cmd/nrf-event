import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { appWithTranslation } from 'next-i18next';
import useLanguageStore from '@/store/useLanguageStore';
import Header from '@/components/layout/Header';
import Script from 'next/script';
import App from 'next/app';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { currentLocale, setLocale } = useLanguageStore();

  // Sync language with router
  useEffect(() => {
    if (router.locale && router.locale !== currentLocale) {
      setLocale(router.locale);
    }
  }, [router.locale, currentLocale, setLocale]);

  // SPA pageview tracking via GTM dataLayer
  useEffect(() => {
    const handleRouteChange = (url) => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'pageview',
        page: url,
      });
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  return (
    <>
      

      <Header />
      <Component {...pageProps} />
    </>
  );
}
MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default appWithTranslation(MyApp);
