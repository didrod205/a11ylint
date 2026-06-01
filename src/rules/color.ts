/** Color-contrast rule for inline styles (static-analyzable subset). */

import { contrastRatio, parseColor, parseInlineColors } from "../utils/color.js";
import type { Issue } from "../types.js";
import { makeIssue, type Rule, type RuleContext } from "./context.js";

/** Large text (>=24px, or >=18.66px bold) only needs 3:1; otherwise 4.5:1. */
function isLargeText(style: string): boolean {
  const sizeMatch = style.match(/font-size\s*:\s*([\d.]+)px/i);
  const bold = /font-weight\s*:\s*(bold|[6-9]00)/i.test(style);
  if (!sizeMatch) return false;
  const px = Number(sizeMatch[1]);
  return px >= 24 || (bold && px >= 18.66);
}

export const contrastInline: Rule = {
  id: "contrast-inline",
  category: "color",
  severity: "warning",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of ctx.doc.root.querySelectorAll("[style]")) {
      const style = el.getAttribute("style") ?? "";
      const { color, background } = parseInlineColors(style);
      if (!color || !background) continue; // need both to judge, statically
      const fg = parseColor(color);
      const bg = parseColor(background);
      if (!fg || !bg) continue;
      const ratio = contrastRatio(fg, bg);
      const threshold = isLargeText(style) ? 3 : 4.5;
      if (ratio < threshold) {
        issues.push(
          makeIssue(this, ctx, {
            el,
            message: `Low contrast ${ratio.toFixed(2)}:1 (needs ${threshold}:1)`,
            detail: `color ${color} on ${background}`,
            fix: "Increase the contrast between text and background.",
          }),
        );
      }
    }
    return issues;
  },
};
