/** Interactive control rules: buttons, links, tabindex. */

import { accessibleName } from "../parse.js";
import type { Issue } from "../types.js";
import { makeIssue, type Rule, type RuleContext } from "./context.js";

export const buttonName: Rule = {
  id: "button-name",
  category: "controls",
  severity: "error",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    const buttons = [
      ...ctx.doc.root.querySelectorAll("button"),
      ...ctx.doc.root.querySelectorAll('[role="button"]'),
    ];
    for (const btn of buttons) {
      if (btn.getAttribute("aria-hidden") === "true") continue;
      // <input type=button/submit> uses value; handled by its own value attr.
      if (accessibleName(btn) === "" && !(btn.getAttribute("value") ?? "").trim()) {
        issues.push(
          makeIssue(this, ctx, {
            el: btn,
            message: "Button has no accessible name",
            detail: "Icon-only buttons need a label for screen readers.",
            fix: "Add visible text, aria-label, or a titled child.",
          }),
        );
      }
    }
    return issues;
  },
};

export const linkName: Rule = {
  id: "link-name",
  category: "controls",
  severity: "error",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    for (const a of ctx.doc.root.querySelectorAll("a")) {
      if (a.getAttribute("href") === undefined) continue; // not a link
      if (a.getAttribute("aria-hidden") === "true") continue;
      if (accessibleName(a) === "") {
        issues.push(
          makeIssue(this, ctx, {
            el: a,
            message: "Link has no accessible text",
            detail: "Empty links (e.g. icon-only) are unusable with a screen reader.",
            fix: "Add link text or aria-label.",
          }),
        );
      }
    }
    return issues;
  },
};

export const linkHref: Rule = {
  id: "link-href",
  category: "controls",
  severity: "warning",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    for (const a of ctx.doc.root.querySelectorAll("a")) {
      const href = a.getAttribute("href");
      const role = (a.getAttribute("role") ?? "").toLowerCase();
      if (href === undefined && role !== "button" && !a.hasAttribute("tabindex")) {
        // <a> without href is not focusable/operable as a link.
        if (a.textContent.trim() !== "") {
          issues.push(
            makeIssue(this, ctx, {
              el: a,
              message: "<a> has no href (not keyboard-focusable as a link)",
              fix: "Add an href, or use a <button> for actions.",
            }),
          );
        }
      }
    }
    return issues;
  },
};

export const positiveTabindex: Rule = {
  id: "positive-tabindex",
  category: "controls",
  severity: "warning",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of ctx.doc.root.querySelectorAll("[tabindex]")) {
      const ti = Number(el.getAttribute("tabindex"));
      if (Number.isFinite(ti) && ti > 0) {
        issues.push(
          makeIssue(this, ctx, {
            el,
            message: `Positive tabindex (${ti}) overrides natural focus order`,
            detail: "Positive tabindex values are an anti-pattern and hard to maintain.",
            fix: "Use tabindex=0 (or restructure the DOM) instead of positive values.",
          }),
        );
      }
    }
    return issues;
  },
};
