/** ARIA usage rules: valid roles/attributes, hidden focusable. */

import type { HTMLElement } from "node-html-parser";
import { VALID_ARIA_ATTRS, VALID_ROLES } from "../aria-data.js";
import type { Issue } from "../types.js";
import { makeIssue, type Rule, type RuleContext } from "./context.js";

const FOCUSABLE = "a[href],button,input,select,textarea,[tabindex]";

/** Is this element itself natively/explicitly focusable? */
function isFocusable(el: HTMLElement): boolean {
  const tag = el.tagName?.toLowerCase();
  if (el.hasAttribute("tabindex")) return true;
  if (tag === "button" || tag === "input" || tag === "select" || tag === "textarea") return true;
  if (tag === "a" && el.getAttribute("href") !== undefined) return true;
  return false;
}

export const ariaRoleValid: Rule = {
  id: "aria-role-valid",
  category: "aria",
  severity: "error",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of ctx.doc.root.querySelectorAll("[role]")) {
      const roles = (el.getAttribute("role") ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean);
      for (const role of roles) {
        if (!VALID_ROLES.has(role)) {
          issues.push(
            makeIssue(this, ctx, {
              el,
              message: `Invalid ARIA role "${role}"`,
              detail: "Unknown roles are ignored by assistive technology.",
              fix: "Use a valid WAI-ARIA role, or remove the attribute.",
            }),
          );
        }
      }
    }
    return issues;
  },
};

export const ariaAttrValid: Rule = {
  id: "aria-attr-valid",
  category: "aria",
  severity: "error",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of ctx.doc.root.querySelectorAll("*")) {
      for (const name of Object.keys(el.attributes)) {
        const lower = name.toLowerCase();
        if (lower.startsWith("aria-") && !VALID_ARIA_ATTRS.has(lower)) {
          issues.push(
            makeIssue(this, ctx, {
              el,
              message: `Unknown ARIA attribute "${lower}"`,
              detail: "Misspelled or non-existent aria-* attributes have no effect.",
              fix: "Check the attribute name against WAI-ARIA.",
            }),
          );
        }
      }
    }
    return issues;
  },
};

export const ariaHiddenFocus: Rule = {
  id: "aria-hidden-focus",
  category: "aria",
  severity: "error",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    for (const hidden of ctx.doc.root.querySelectorAll('[aria-hidden="true"]')) {
      // The element itself or a descendant being focusable is the problem.
      const focusable = isFocusable(hidden) ? hidden : hidden.querySelector(FOCUSABLE);
      if (focusable) {
        const negativeTab = focusable.getAttribute("tabindex") === "-1";
        if (!negativeTab) {
          issues.push(
            makeIssue(this, ctx, {
              el: hidden,
              message: "aria-hidden element contains focusable content",
              detail: "Hiding focusable elements from AT but leaving them in the tab order is confusing.",
              fix: "Remove aria-hidden, or make the content non-focusable (tabindex=-1).",
            }),
          );
        }
      }
    }
    return issues;
  },
};
