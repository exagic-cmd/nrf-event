  import ENV from  "@/lib/env";
  import { useEventStore } from "@/store/useEventStore";
  
  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString();
  }

  function greet(name) {
    return `Hi ${name}`;
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
    const store = useEventStore.getState();

    // If event already fetched → return it
    if (store.event?.length > 0) {
      return store.event;
    }

    // Otherwise fetch and return
    await store.FetchEvent();
    return useEventStore.getState().event;
  }
// ✅ All helpers grouped in one neat place
const helpers = {
  formatDate,
  greet,getEnv,
  getVisitorId,
  getEventData
};

// ✅ Expose globally
globalThis.$helpers = helpers;

export default helpers;
