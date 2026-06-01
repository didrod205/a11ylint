/** Image & media accessibility rules. */

import type { Issue } from "../types.js";
import { makeIssue, type Rule, type RuleContext } from "./context.js";

const REDUNDANT_ALT = /\b(image|photo|picture|graphic|logo|icon)\b/i;

export const imgAlt: Rule = {
  id: "img-alt",
  category: "images",
  severity: "error",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    for (const img of ctx.doc.root.querySelectorAll("img")) {
      const alt = img.getAttribute("alt");
      const role = (img.getAttribute("role") ?? "").toLowerCase();
      const ariaHidden = img.getAttribute("aria-hidden") === "true";
      if (role === "presentation" || role === "none" || ariaHidden) continue;
      if (alt === undefined) {
        issues.push(
          makeIssue(this, ctx, {
            el: img,
            message: "Image is missing an alt attribute",
            detail: "Screen readers will announce the file name or nothing.",
            fix: 'Add alt text, or alt="" with role="presentation" if decorative.',
          }),
        );
      }
    }
    return issues;
  },
};

export const imgRedundantAlt: Rule = {
  id: "img-redundant-alt",
  category: "images",
  severity: "info",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    for (const img of ctx.doc.root.querySelectorAll("img")) {
      const alt = img.getAttribute("alt");
      if (alt && REDUNDANT_ALT.test(alt)) {
        issues.push(
          makeIssue(this, ctx, {
            el: img,
            message: `Alt text contains a redundant word ("${alt}")`,
            detail: 'Screen readers already announce images as "image".',
            fix: 'Describe the content, not the medium (drop "image of", "photo of"…).',
          }),
        );
      }
    }
    return issues;
  },
};
