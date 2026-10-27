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
import { getEventSlugFromRouter } from '@/lib/eventRouting';
import { EventRouteContext } from '@/lib/EventRouteContext';
import EventPreloader from '@/components/layout/EventPreloader';

const GA_TRACKING_ID = 'G-5SQKF4Y54M';
const DEFAULT_EVENT_ID = 6;

import '@/lib/helpers'; // loads globally
function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const isEventPartnershipPage = router.pathname === '/event-partnership';
  const { currentLocale, setLocale } = useLanguageStore();
  const {
    event,
    eventSlug,
    status,
    error,
    FetchEvent,
    FetchEventById,
    clearEvent,
  } = useEventStore();
  const routeEventSlug =
    Object.prototype.hasOwnProperty.call(pageProps, 'routeEventSlug')
      ? pageProps.routeEventSlug
      : getEventSlugFromRouter(router);
  const usesDefaultEventTheme =
    !routeEventSlug &&
    (router.pathname === '/' || isEventPartnershipPage);
  const eventMatchesRoute = Boolean(
    (routeEventSlug && eventSlug === routeEventSlug && status === 'ready' && event) ||
    (usesDefaultEventTheme &&
      eventSlug === null &&
      status === 'ready' &&
      String(event?.event?.id ?? event?.id) === String(DEFAULT_EVENT_ID))
  );
  const isDefaultEventRoute = !routeEventSlug && router.pathname === '/';
  const showAppHeader = !isEventPartnershipPage && !(isDefaultEventRoute && eventMatchesRoute);
   const appearance = useMemo(() => {
    const activeEvent = eventMatchesRoute ? event : null;
    const themeMode = activeEvent?.event?.theme_mode === 'dark' ? 'dark' : activeEvent?.theme_mode === 'light' ? 'light' : eventAppearance.theme;
    const primaryColor = activeEvent?.event?.theme_color || eventAppearance.primaryColor;
    return { theme: themeMode, primaryColor };
  }, [event, eventMatchesRoute]);

  useEffect(() => {
    if (!router.isReady) return;
    if (routeEventSlug) {
      FetchEvent(routeEventSlug);
    } else if (usesDefaultEventTheme) {
      FetchEventById(DEFAULT_EVENT_ID);
    } else {
      clearEvent();
    }
  }, [router.isReady, router.asPath, router.pathname, routeEventSlug, usesDefaultEventTheme, FetchEvent, FetchEventById, clearEvent]);

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
        <EventRouteContext.Provider value={routeEventSlug}>
          {showAppHeader && <Header />}
          {(routeEventSlug || isDefaultEventRoute) && (
            <EventPreloader
              key={`${routeEventSlug || 'default-event'}-${status}`}
              isReady={
                eventMatchesRoute ||
                status === 'error' ||
                status === 'expired' ||
                status === 'not-found'
              }
            />
          )}
          {(routeEventSlug || isDefaultEventRoute) && !eventMatchesRoute ? (
          <main className="flex min-h-[70vh] items-center justify-center bg-background px-5 py-16 text-center text-foreground">
            <div className="max-w-xl">
              {status === 'expired' || status === 'not-found' ? (
                <>
                  <h1 className="text-3xl font-semibold">
                    {status === 'expired' ? 'Event unavailable' : 'Event not found'}
                  </h1>
                  <p className="mt-3 text-muted-foreground">
                    {error || 'This event is no longer available.'}
                  </p>
                </>
              ) : status === 'error' ? (
                <>
                  <h1 className="text-3xl font-semibold">Unable to load event</h1>
                  <p className="mt-3 text-muted-foreground">
                    {error || 'Please check your connection and try again.'}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      routeEventSlug
                        ? FetchEvent(routeEventSlug)
                        : FetchEventById(DEFAULT_EVENT_ID)
                    }
                    className="mt-6 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground"
                  >
                    Try again
                  </button>
                </>
              ) : null}
            </div>
          </main>
        ) : (
          <Component {...pageProps} />
          )}
        </EventRouteContext.Provider>
      </ThemeProvider>
    </>
  );
}
MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default appWithTranslation(MyApp);
