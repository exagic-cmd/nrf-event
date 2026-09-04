
export type ThemeMode = 'light' | 'dark';

export interface EventAppearance {
  theme: ThemeMode;
  primaryColor: string; // hex e.g. '#D3202D', '#FF6600'
}

// Default fallback — override with API data
export const eventAppearance: EventAppearance = {
  theme: 'light',
  primaryColor: '#a80d17ff',
};
