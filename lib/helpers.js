  import ENV from  "@/lib/env";
  import { useEventStore } from "@/store/useEventStore";
  import { getEventSlugFromPath } from "@/lib/eventRouting";
  
  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString();
  }

  function getApiAbsoluteURL(url = "") {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // e.g. https://domain.com

  if (!baseUrl) return url; // fallback if env not set

  // ensure /api is appended once
  const apiBaseUrl = baseUrl.endsWith("/api")
    ? baseUrl
    : `${baseUrl.replace(/\/$/, "")}/api`;

  return url
    ? `${apiBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`
    : apiBaseUrl;
}

  function getVisitorId(){
    let VisitorId = localStorage.getItem('event_visitor_id');
    if (!VisitorId) {
      VisitorId = 'V' + Math.floor(1000 + Math.random() * 9999999);
      localStorage.setItem('event_visitor_id', VisitorId);
    }
    return VisitorId;
  }
  function getEnv(key) {
    return (ENV[key]) || null;
  }
  async function getEventData() {
    if (typeof window === "undefined") return null;

    const locale = window.location.pathname.match(/^\/(en|es|ja)(?:\/|$)/)?.[1];
    const slug = getEventSlugFromPath(window.location.pathname, locale, "en");
    if (!slug) return null;

    const store = useEventStore.getState();
    if (store.eventSlug === slug && store.status === "ready") return store.event;

    await store.FetchEvent(slug);
    const updatedStore = useEventStore.getState();
    return updatedStore.eventSlug === slug ? updatedStore.event : null;
  }
  function getGevmeRedirectURL(){
    const host = getEnv('GEVME_API_HOST');
    const client_id = getEnv('GEVME_CLIENT_ID');
    const redirect_uri = getEnv('GEVME_REDIRECT_URI');
    
    return `${host}oauth/authorize?response_type=code&client_id=${encodeURIComponent(client_id)}&scope=root&redirect_uri=${encodeURIComponent(redirect_uri)}&state=123`;
  }



// ✅ All helpers grouped in one neat place
const helpers = {
  formatDate,
  getEnv,
  getVisitorId,
  getEventData,
  getGevmeRedirectURL,
  getApiAbsoluteURL,
};

// ✅ Expose globally
globalThis.$helpers = helpers;

export default helpers;
