// Small color utilities used by the theme system

export function hexToRgb(hex: string) {
  let sanitized = hex.replace('#', '').trim();
  if (sanitized.length === 8) {
    sanitized = sanitized.substring(0, 6); // Ignore alpha channel for HSL conversion
  }
  const bigint = parseInt(sanitized, 16);
  if (sanitized.length === 3) {
    const r = (bigint >> 8) & 0xf;
    const g = (bigint >> 4) & 0xf;
    const b = bigint & 0xf;
    return [r * 17, g * 17, b * 17];
  }
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hexToHslString(hex: string) {
  try {
    const [r, g, b] = hexToRgb(hex);
    const [h, s, l] = rgbToHsl(r, g, b);
    return `${h} ${s}% ${l}%`;
  } catch (err) {
    // fallback to a visible orange
    return `24 90% 50%`;
  }
}

export function adjustLightness(hslStr: string, deltaPercent: number) {
  // hslStr expected like: "h s% l%"
  const parts = hslStr.split(' ').map((p) => p.trim());
  if (parts.length !== 3) return hslStr;
  const h = parts[0];
  const s = parts[1];
  let l = parseInt(parts[2].replace('%', ''), 10);
  l = Math.max(0, Math.min(100, l + deltaPercent));
  return `${h} ${s} ${l}%`;
}

export function pickOnPrimary(hslStr: string) {
  // choose white or black based on lightness
  const parts = hslStr.split(' ');
  if (parts.length !== 3) return '0 0% 98%';
  const l = parseInt(parts[2].replace('%', ''), 10);
  // if lightness is high, pick dark text
  if (l > 55) return '0 0% 9%';
  return '0 0% 98%';
}
