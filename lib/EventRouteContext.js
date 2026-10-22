import { createContext, useContext } from "react";

export const EventRouteContext = createContext(null);

export function useEventRouteSlug() {
  return useContext(EventRouteContext);
}
