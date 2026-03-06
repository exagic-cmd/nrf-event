  import ENV from  "@/lib/env";
  import { useEventStore } from "@/store/useEventStore";
  
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
    const ONE_HOUR = 60 * 60 * 1000;
    const store = useEventStore.getState();
    const { event, lastFetched, FetchEvent } = store;
    const isExpired = !lastFetched || Date.now() - lastFetched > ONE_HOUR;
    if (!isExpired && event?.event) {  return event; }
    // expired or empty -> fetch again
    await FetchEvent();
    return useEventStore.getState().event;
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
