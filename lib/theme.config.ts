// ─── Single Source of Truth for Event Appearance ────────────────────
// Update these values from your API response.
// ThemeProvider reads this and applies CSS variables site-wide.

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
