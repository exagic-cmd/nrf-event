import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { appWithTranslation } from 'next-i18next';
import useLanguageStore from '@/store/useLanguageStore';
import Header from '@/components/layout/Header';
import Script from 'next/script';
import App from 'next/app';
import '@/styles/globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import { eventAppearance } from '@/lib/theme.config';
import { useEventStore } from '@/store/useEventStore';

const GA_TRACKING_ID = 'G-5SQKF4Y54M';

import '@/lib/helpers'; // loads globally
function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { currentLocale, setLocale } = useLanguageStore();
const event = useEventStore((s) => s.event);
   const appearance = useMemo(() => {
    const themeMode = event?.event?.theme_mode === 'dark' ? 'dark' : event?.theme_mode === 'light' ? 'light' : eventAppearance.theme;
    const primaryColor = event?.event?.theme_color || eventAppearance.primaryColor;
    return { theme: themeMode, primaryColor };
  }, [event?.event?.theme_mode, event?.event?.theme_color]);

  // Sync language with router
  useEffect(() => {
    if (router.locale && router.locale !== currentLocale) {
      setLocale(router.locale);
    }
  }, [router.locale, currentLocale, setLocale]);

  // Track page views on route change for Google Analytics
  useEffect(() => {
    const handleRouteChange = (url) => {
      // This function will be called on route changes, sending page views to GA
      if (typeof window.gtag === 'function') {
        window.gtag('config', GA_TRACKING_ID, {
          page_path: url,
        });
      }
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script id="google-analytics-inline" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}');
        `}
      </Script>
      <ThemeProvider appearance={appearance}>
        <Header />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default appWithTranslation(MyApp);
