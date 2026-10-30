import { useEffect, useMemo, useState } from 'react';
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
import Loader2Svg from '@/components/common/Loader2Svg';

const GA_TRACKING_ID = 'G-5SQKF4Y54M';
const DEFAULT_EVENT_ID = 6;

import '@/lib/helpers'; // loads globally
function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [routeLoading, setRouteLoading] = useState(false);
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
  const pathSegments = String(router.asPath || '').split(/[?#]/, 1)[0].split('/').filter(Boolean);
  const partnershipIndex = pathSegments.findIndex((segment) => segment === 'event-partnership');
  const slugBeforePartnership = partnershipIndex > 0
    ? decodeURIComponent(pathSegments[partnershipIndex - 1])
    : null;
  const partnershipEventSlug = isEventPartnershipPage
    ? (slugBeforePartnership || pageProps.routeEventSlug || routeEventSlug ||
      (typeof router.query.slug === 'string' ? router.query.slug : null))
    : null;
  const usesDefaultEventTheme =
    !routeEventSlug && (router.pathname === '/' || isEventPartnershipPage);
  const activeEventSlug = partnershipEventSlug || routeEventSlug;
  const reusesDefaultEvent = Boolean(
    isEventPartnershipPage && !activeEventSlug && eventSlug === null &&
    status === 'ready' &&
    String(event?.event?.id ?? event?.id) === String(DEFAULT_EVENT_ID)
  );
  const eventMatchesRoute = Boolean(
    (activeEventSlug && eventSlug === activeEventSlug && status === 'ready' && event) ||
    reusesDefaultEvent ||
    (usesDefaultEventTheme &&
      eventSlug === null &&
      status === 'ready' &&
      String(event?.event?.id ?? event?.id) === String(DEFAULT_EVENT_ID))
  );
  const partnershipNeedsEvent = isEventPartnershipPage && Boolean(activeEventSlug || usesDefaultEventTheme);
  const partnershipLoading = partnershipNeedsEvent && !eventMatchesRoute &&
    !['error', 'expired', 'not-found'].includes(status);
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
    if (activeEventSlug && eventSlug === activeEventSlug && status === 'loading') {
      return;
    }
    if (activeEventSlug && eventSlug !== activeEventSlug) {
      FetchEvent(activeEventSlug);
    } else if (activeEventSlug && eventSlug === activeEventSlug && status === 'ready') {
      // Keep the event data available to the registration page after it loads.
    } else if (usesDefaultEventTheme) {
      FetchEventById(DEFAULT_EVENT_ID);
    } else if (isEventPartnershipPage && reusesDefaultEvent) {
      // Reuse the default event fetched on the home page.
    } else {
      clearEvent();
    }
  }, [router.isReady, router.asPath, router.pathname, activeEventSlug, eventSlug, status, reusesDefaultEvent, isEventPartnershipPage, usesDefaultEventTheme, FetchEvent, FetchEventById, clearEvent]);

  useEffect(() => {
    const onStart = (url) => {
      if (url.includes('/event-partnership')) setRouteLoading(true);
    };
    const onComplete = () => setRouteLoading(false);
    router.events.on('routeChangeStart', onStart);
    router.events.on('routeChangeComplete', onComplete);
    router.events.on('routeChangeError', onComplete);
    return () => {
      router.events.off('routeChangeStart', onStart);
      router.events.off('routeChangeComplete', onComplete);
      router.events.off('routeChangeError', onComplete);
    };
  }, [router.events]);

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
        <EventRouteContext.Provider value={activeEventSlug}>
          {showAppHeader && <Header />}
          {!isEventPartnershipPage && (activeEventSlug || isDefaultEventRoute) && (
            <EventPreloader
              key={`${activeEventSlug || 'default-event'}`}
              theme={eventMatchesRoute && event ? {
                mode: event?.event?.theme_mode || event?.theme_mode,
                primary: event?.event?.theme_color || event?.theme_color,
              } : undefined}
              isReady={
                eventMatchesRoute ||
                status === 'error' ||
                status === 'expired' ||
                status === 'not-found'
              }
              minDuration={700}
            />
          )}
          {(routeLoading || partnershipLoading) && (
            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[10000]" role="status" aria-live="polite" aria-label="Loading event registration">
              <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-center bg-background/70">
                <Loader2Svg height="72px" size={32} />
              </div>
            </div>
          )}
          {(activeEventSlug || isDefaultEventRoute) && !eventMatchesRoute && !isEventPartnershipPage ? (
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
                      activeEventSlug
                        ? FetchEvent(activeEventSlug)
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
