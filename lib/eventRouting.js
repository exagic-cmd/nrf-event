const NON_EVENT_ROUTES = new Set([
  "accommodation",
  "agentAI",
  "affiliateProgram",
  "api",
  "chat",
  "checkout",
  "contactUs",
  "courses",
  "custom-booking",
  "day-tours",
  "error",
  "event-partnership",
  "hotel",
  "landmark",
  "listings",
  "location-detail",
  "login",
  "order",
  "payment-failed",
  "payment-process",
  "payment-success",
  "profile",
  "resume-payment",
  "review",
  "rh",
  "shuttle",
  "stripe",
  "tour",
].map((route) => route.toLowerCase()));

export function getEventSlugFromPath(asPath, locale, defaultLocale) {
  const pathname = String(asPath || "/").split(/[?#]/, 1)[0];
  const segments = pathname.split("/").filter(Boolean);
  const localePrefix = locale && segments[0] === locale;
  const routeSegments = localePrefix ? segments.slice(1) : segments;
  const partnershipIndex = routeSegments.findIndex(
    (segment) => segment.toLowerCase() === "event-partnership"
  );
  const firstSegment = partnershipIndex > 0
    ? routeSegments[partnershipIndex - 1]
    : routeSegments[0];

  if (!firstSegment || NON_EVENT_ROUTES.has(firstSegment.toLowerCase())) return null;

  try {
    return decodeURIComponent(firstSegment);
  } catch {
    return firstSegment;
  }
}

// Next.js may expose "/" as asPath during the server render of a dynamic
// route, then replace it with the browser URL before hydration. The dynamic
// route params are present on both renders, so use them as a stable fallback.
export function getEventSlugFromRouter(router) {
  const pathSlug = getEventSlugFromPath(
    router?.asPath,
    router?.locale,
    router?.defaultLocale
  );
  if (pathSlug) return pathSlug;

  const querySlug = router?.query?.slug;
  if (typeof querySlug === "string") {
    return getEventSlugFromPath(`/${querySlug}`, router?.locale, router?.defaultLocale);
  }
  return null;
}

export function withEventPath(href, asPath, locale, defaultLocale) {
  const slug = getEventSlugFromPath(asPath, locale, defaultLocale);
  if (!slug) return href;

  if (typeof href === "object" && href !== null) {
    const pathname = withEventPath(
      href.pathname || "/",
      asPath,
      locale,
      defaultLocale
    );
    return { ...href, pathname };
  }

  if (typeof href !== "string" || !href.startsWith("/") || href.startsWith("//")) {
    return href;
  }

  const [pathAndQuery, hash] = href.split("#", 2);
  const [pathname, query] = pathAndQuery.split("?", 2);
  const normalizedPath = pathname || "/";

  if (
    normalizedPath === `/${slug}` ||
    normalizedPath.startsWith(`/${slug}/`)
  ) {
    return href;
  }

  const prefixedPath =
    normalizedPath === "/" ? `/${slug}` : `/${slug}${normalizedPath}`;
  return `${prefixedPath}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}
