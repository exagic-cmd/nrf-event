"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import "@/styles/globals.css";
import LocalizedLink from "@/components/LocalizedLink";
import useUserStore from "@/store/useAuthStore";
import { getFullImageUrl } from "@/utils/imageService";
import {
  User,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  Home,
  Info,
  Compass,
  LoaderCircle,
} from "lucide-react";
import { useEventStore } from "@/store/useEventStore";
import { withEventPath } from "@/lib/eventRouting";
import { useEventRouteSlug } from "@/lib/EventRouteContext";

export default function Header({ enableRegisterCta = true }) {
 // const setLocale = useLanguageStore((state) => state.setLocale);
  const { token, logout, user } = useUserStore();
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter()
  const storedEvent = useEventStore((state) => state.event);
  const storedEventSlug = useEventStore((state) => state.eventSlug);
  const routeEventSlug = useEventRouteSlug();
  const showRegisterLink =
    enableRegisterCta && !routeEventSlug && router.pathname === "/";
  const event = storedEventSlug === routeEventSlug ? storedEvent : null;
  const eventLogo =
    event?.event?.logo ||
    event?.event?.logo_url ||
    event?.logo ||
    event?.logo_url;
  const hasRecommendations =
    Array.isArray(event?.event?.recommended_products) &&
    event.event.recommended_products.length > 0;
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registerNavigating, setRegisterNavigating] = useState(false);

  const userMenuRef = useRef(null);
  const hasRunUserCheckRef = useRef(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (hasRunUserCheckRef.current) return;
    hasRunUserCheckRef.current = true;

    const timer = setTimeout(() => {
      if (!user && router.pathname !== '/error') {
        (async () => {
          try {
            if (typeof $helpers?.getGevmeRedirectURL === "function") {
              const url = $helpers.getGevmeRedirectURL();
          //    if (url) window.location.assign(url);
            } else {
              console.error("helpers.getGevmeRedirectURL is not available");
            }
          } catch (err) {
            console.error("Failed to get redirect URL", err);
          }
        })();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, hydrated, router.pathname]);
  


   useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push(
      withEventPath("/", router.asPath, router.locale, router.defaultLocale)
    );
    setUserMenuOpen(false);
  };

  const navigation = [
    { href: "/", label: "Home", icon: Home },
    { href: "/#about", label: "About", icon: Info },
    ...(hasRecommendations
      ? [{ href: "/#recommendations", label: "Recommended", icon: Compass }]
      : []),
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setRegisterNavigating(false);
  }, [router.asPath]);

  const navigateToRegistration = async () => {
    const destination = withEventPath(
      "/event-partnership",
      routeEventSlug ? `/${encodeURIComponent(routeEventSlug)}` : router.asPath,
      router.locale,
      router.defaultLocale
    );
    setRegisterNavigating(true);
    setMobileMenuOpen(false);
    try {
      await router.push(destination);
    } catch (error) {
      setRegisterNavigating(false);
      console.error("Unable to open event registration:", error);
    }
  };

  const renderNavigation = (mobile = false) => (
    <nav
      aria-label="Main navigation"
      className={
        mobile
          ? "grid gap-1 border-t border-border/70 px-4 py-3 md:hidden"
          : "hidden items-center gap-1 md:flex"
      }
    >
      {navigation.map(({ href, label, icon: Icon }) => {
        const className = mobile
          ? "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground transition hover:bg-muted hover:text-primary"
          : "rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-primary lg:px-4";

        return href === "/" ? (
          <LocalizedLink
            key={href}
            href={href}
            className={className}
            onClick={() => setMobileMenuOpen(false)}
          >
            {mobile && <Icon aria-hidden="true" className="h-4 w-4" />}
            {label}
          </LocalizedLink>
        ) : (
          <LocalizedLink
            key={href}
            href={href}
            className={className}
            onClick={() => setMobileMenuOpen(false)}
          >
            {mobile && <Icon aria-hidden="true" className="h-4 w-4" />}
            {label}
          </LocalizedLink>
        );
      })}
      {showRegisterLink && (
        <LocalizedLink
          href="/event-partnership"
          onClick={(event) => {
            event.preventDefault();
            navigateToRegistration();
          }}
          className="flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 md:hidden"
        >
          {registerNavigating ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Loading</> : "Register"}
        </LocalizedLink>
      )}
    </nav>
  );

  const renderUserMenu = (isMobile = false) => (
    <div className="relative" ref={userMenuRef}>
      <button
        type="button"
        aria-label="Open account menu"
        aria-expanded={userMenuOpen}
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className="rounded-full p-2 text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <User className={`${isMobile ? "h-5 w-5 sm:h-6 sm:w-6" : "h-6 w-6"}`} />
      </button>
      {userMenuOpen && (
        <div
          className={`absolute right-0 top-12 z-50 flex flex-col space-y-3 rounded-xl border border-border bg-card px-4 py-3 text-foreground shadow-lg ${
            isMobile ? "w-44" : "w-48"
          }`}
        >
          <LocalizedLink href="/profile" className="flex items-center space-x-2 transition hover:text-primary">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </LocalizedLink>
          <LocalizedLink href="/order" className="flex items-center space-x-2 transition hover:text-primary">
            <ShoppingBag className="w-4 h-4" />
            <span>Booking</span>
          </LocalizedLink>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-left transition hover:text-primary"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <header className="fixed left-0 top-0 z-40 w-full border-b border-border/70 bg-background/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:h-[76px] sm:px-6 lg:px-8">
        <LocalizedLink href="/" className="mr-auto flex min-w-0 shrink-0 items-center">
          {eventLogo ? (
            <img
              src={getFullImageUrl(eventLogo)}
              alt={event?.event?.title || event?.event?.organizer || "Home"}
              className="h-14 w-auto max-w-[220px] object-contain sm:h-16 sm:max-w-[260px]"
            />
          ) : (
            <span className="text-lg font-semibold text-foreground sm:text-xl">Home</span>
          )}
        </LocalizedLink>

        {renderNavigation()}

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 md:ml-0">
          {showRegisterLink && (
            <LocalizedLink
              href="/event-partnership"
              onClick={(event) => {
                event.preventDefault();
                navigateToRegistration();
              }}
              className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:inline-flex"
            >
              {registerNavigating ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Loading</> : "Register"}
            </LocalizedLink>
          )}
          {token && renderUserMenu()}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
          >
            {mobileMenuOpen ? (
              <X aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-navigation" className="border-t border-border/70 bg-background/95 backdrop-blur-xl md:hidden">
          {renderNavigation(true)}
        </div>
      )}
    </header>
  );
}
