import { hexToHslString, adjustLightness, pickOnPrimary } from './colorUtils';
import type { ThemeMode, EventAppearance } from './theme.config';

export function createTheme(appearance: EventAppearance) {
  const safeTheme: ThemeMode = appearance?.theme === 'dark' ? 'dark' : 'light';
  const primaryHex = appearance?.primaryColor || '#F97316';
  const primaryHsl = hexToHslString(primaryHex);
  const primaryHover = adjustLightness(primaryHsl, safeTheme === 'light' ? -8 : 8);
  const primaryForeground = pickOnPrimary(primaryHsl);

  const lightTokens = {
    '--background': '0 0% 100%',
    '--foreground': '0 0% 3.9%',
    '--card': '0 0% 98%',
    '--card-foreground': '0 0% 3.9%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '0 0% 3.9%',
    '--secondary': '0 0% 96.1%',
    '--secondary-foreground': '0 0% 9%',


    '--muted': '0 0% 96.1%',
    '--muted-foreground': '0 0% 45.1%',
    '--border': '0 0% 89.8%',
    '--input': '0 0% 89.8%',
    '--ring': '0 0% 3.9%',
    '--destructive': '0 84.2% 60.2%',
    '--destructive-foreground': '0 0% 98%',
    '--surface': '0 0% 100%',
    '--surface-muted': '0 0% 96%',
    '--surface-strong': '0 0% 90%',
    '--surface-foreground': '0 0% 3.9%',
    '--surface-muted-foreground': '0 0% 45%',
  } as Record<string, string>;

  const darkTokens = {
    '--background': '0 0% 3.9%',
    '--foreground': '0 0% 98%',
    '--card': '0 0% 3.9%',
    '--card-foreground': '0 0% 98%',
    '--popover': '0 0% 3.9%',
    '--popover-foreground': '0 0% 98%',
    '--secondary': '0 0% 14.9%',
    '--secondary-foreground': '0 0% 98%',
    '--secondary-brand': '38 50% 57%',

    '--muted': '0 0% 14.9%',
    '--muted-foreground': '0 0% 63.9%',
    '--border': '0 0% 14.9%',
    '--input': '0 0% 14.9%',
    '--ring': '0 0% 83.1%',
    '--destructive': '0 62.8% 30.6%',
    '--destructive-foreground': '0 0% 98%',
    '--surface': '0 0% 7%',
    '--surface-muted': '0 0% 11%',
    '--surface-strong': '0 0% 18%',
    '--surface-foreground': '0 0% 98%',
    '--surface-muted-foreground': '0 0% 64%',
  } as Record<string, string>;

  // Base tokens depending on theme
  const baseTokens = safeTheme === 'light' ? lightTokens : darkTokens;

  // Primary tokens derived from primary color
  const primaryTokens: Record<string, string> = {
    '--primary': primaryHsl,
    '--primary-foreground': primaryForeground,
    '--primary-hover': primaryHover,
  };

  // Merge all tokens into one map of CSS variable -> value
  const final: Record<string, string> = {
    ...baseTokens,
    ...primaryTokens,
  };

  return {
    mode: safeTheme,
    vars: final,
  };
}
