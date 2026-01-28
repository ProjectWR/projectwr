/**
 * Converts an HSLA string (format: "h, s%, l%, a%") to a Hexa string (format: "#rrggbbaa").
 */
export const hslaToHexa = (hslaStr) => {
  if (!hslaStr || typeof hslaStr !== "string") return hslaStr;
  if (hslaStr.startsWith("#")) return hslaStr; // Already hex

  const parts = hslaStr.split(",").map((p) => p.trim().replace("%", ""));
  if (parts.length < 3) return hslaStr; // Not a valid HSLA string for our purposes

  let h = parseFloat(parts[0]) % 360;
  if (h < 0) h += 360;
  let s = parseFloat(parts[1]) / 100;
  let l = parseFloat(parts[2]) / 100;
  let a = parts[3] !== undefined ? parseFloat(parts[3]) / 100 : 1;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h <= 360) {
    r = c;
    g = 0;
    b = x;
  }

  const r255 = Math.round((r + m) * 255);
  const g255 = Math.round((g + m) * 255);
  const b255 = Math.round((b + m) * 255);
  const a255 = Math.round(a * 255);

  const toHex = (n) => n.toString(16).padStart(2, "0");

  return `#${toHex(r255)}${toHex(g255)}${toHex(b255)}${toHex(a255)}`;
};

/**
 * Converts a Hexa string (format: "#rrggbbaa" or "#rrggbb") to an HSLA string (format: "h, s%, l%, a%").
 */
export const hexaToHsla = (hex) => {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return hex;

  let r = 0,
    g = 0,
    b = 0,
    a = 1;

  if (hex.length === 7 || hex.length === 4) {
    // #RGB or #RRGGBB
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
  } else if (hex.length === 9 || hex.length === 5) {
    // #RGBA or #RRGGBBAA
    if (hex.length === 5) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
      a = parseInt(hex[4] + hex[4], 16) / 255;
    } else {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
      a = parseInt(hex.slice(7, 9), 16) / 255;
    }
  } else {
    return hex;
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
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

  return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${Math.round(a * 100)}%`;
};
