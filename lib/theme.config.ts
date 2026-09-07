import { useEventStore } from '@/store/useEventStore';

export type ThemeMode = 'light' | 'dark';

export interface EventAppearance {
  theme: ThemeMode;
  primaryColor: string; }

export const eventAppearance: EventAppearance = {
  theme: 'light',           // event.theme_mode
  primaryColor: '#a80d17ff', // event.theme_color
};
export function getEventAppearance(): EventAppearance {
   const event = useEventStore.getState().event;

  const theme: ThemeMode =
    event?.theme_mode === 'dark' ? 'dark'
    : event?.theme_mode === 'light' ? 'light'
    : eventAppearance.theme;

  const primaryColor = event?.theme_color || eventAppearance.primaryColor;

  return { theme, primaryColor };
}

