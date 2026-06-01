/** Parse HTML into a queryable document model with line-number lookup. */

import { parse, type HTMLElement } from "node-html-parser";

export interface ParsedDocument {
  root: HTMLElement;
  raw: string;
  title: string | null;
  lang: string | null;
  /** Compute the 1-based line number for an element by locating its open tag. */
  lineOf(el: HTMLElement): number | undefined;
}

export function parseDocument(html: string): ParsedDocument {
  const raw = stripBom(html);
  const root = parse(raw, {
    comment: false,
    voidTag: { closingSlash: true },
    blockTextElements: { script: true, style: true, pre: true, textarea: true },
  });

  // Precompute line offsets for fast lookups.
  const lineStarts: number[] = [0];
  for (let i = 0; i < raw.length; i++) {
    if (raw.charCodeAt(i) === 10) lineStarts.push(i + 1);
  }
  const lineFromIndex = (index: number): number => {
    // Binary search the greatest lineStart <= index.
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid]! <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };

  const htmlEl = root.querySelector("html");
  const titleEl = root.querySelector("title");

  return {
    root,
    raw,
    title: titleEl ? titleEl.textContent.trim() : null,
    lang: htmlEl ? attr(htmlEl, "lang") : null,
    lineOf: (el: HTMLElement): number | undefined => {
      const idx = (el as unknown as { range?: [number, number] }).range?.[0];
      if (typeof idx === "number") return lineFromIndex(idx);
      // Fallback: search for the element's outer HTML start.
      const outer = el.outerHTML;
      if (!outer) return undefined;
      const pos = raw.indexOf(outer.slice(0, Math.min(40, outer.length)));
      return pos === -1 ? undefined : lineFromIndex(pos);
    },
  };
}

export function attr(el: HTMLElement, name: string): string | null {
  const v = el.getAttribute(name);
  return v === undefined ? null : v;
}

/** Accessible name approximation for an element (text + aria-label + alt + title). */
export function accessibleName(el: HTMLElement): string {
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();
  const labelledby = el.getAttribute("aria-labelledby");
  if (labelledby && labelledby.trim()) return labelledby.trim(); // presence counts as a name
  const title = el.getAttribute("title");
  const text = el.textContent.replace(/\s+/g, " ").trim();
  if (text) return text;
  // alt text of nested images contributes to the name.
  const img = el.querySelector("img[alt]");
  const alt = img?.getAttribute("alt")?.trim();
  if (alt) return alt;
  if (title && title.trim()) return title.trim();
  return "";
}

/** Short, single-line snippet of an element's opening tag for reports. */
export function snippetOf(el: HTMLElement): string {
  const outer = el.outerHTML ?? "";
  const open = outer.slice(0, outer.indexOf(">") + 1) || outer;
  const collapsed = open.replace(/\s+/g, " ").trim();
  return collapsed.length > 80 ? `${collapsed.slice(0, 80)}…` : collapsed;
}

export function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}
