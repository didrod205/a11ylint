/** Deterministic WCAG color-contrast math for inline styles. */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

const NAMED: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  gray: "#808080",
  grey: "#808080",
  silver: "#c0c0c0",
  yellow: "#ffff00",
  navy: "#000080",
  lightgray: "#d3d3d3",
  lightgrey: "#d3d3d3",
  dimgray: "#696969",
  dimgrey: "#696969",
};

/** Parse a CSS color (hex, rgb(), or a few named colors). Null if unsupported. */
export function parseColor(input: string): Rgb | null {
  let s = input.trim().toLowerCase();
  const named = NAMED[s];
  if (named) s = named;

  if (s.startsWith("#")) {
    const hex = s.slice(1);
    if (hex.length === 3) {
      const r = hex[0]!;
      const g = hex[1]!;
      const b = hex[2]!;
      return {
        r: parseInt(r + r, 16),
        g: parseInt(g + g, 16),
        b: parseInt(b + b, 16),
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
    return null;
  }

  const m = s.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (m) {
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
  }
  return null;
}

function channel(c: number): number {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance per WCAG. */
export function luminance({ r, g, b }: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio between two colors (1–21). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = luminance(a);
  const lb = luminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Extract `color` and `background-color` from an inline style string. */
export function parseInlineColors(style: string): { color?: string; background?: string } {
  const out: { color?: string; background?: string } = {};
  for (const decl of style.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim().toLowerCase();
    const value = decl.slice(idx + 1).trim();
    if (prop === "color") out.color = value;
    else if (prop === "background-color" || prop === "background") out.background = value;
  }
  return out;
}
