/** Form & label accessibility rules. */

import type { HTMLElement } from "node-html-parser";
import type { Issue } from "../types.js";
import { makeIssue, type Rule, type RuleContext } from "./context.js";

const LABELABLE = ["input", "select", "textarea"];
const NO_LABEL_TYPES = new Set(["hidden", "submit", "reset", "button", "image"]);

function hasAssociatedLabel(el: HTMLElement, ctx: RuleContext): boolean {
  // aria-label / aria-labelledby
  if ((el.getAttribute("aria-label") ?? "").trim()) return true;
  if ((el.getAttribute("aria-labelledby") ?? "").trim()) return true;
  if ((el.getAttribute("title") ?? "").trim()) return true;
  // <label for="id">
  const id = el.getAttribute("id");
  if (id) {
    const escaped = id.replace(/"/g, '\\"');
    const lbl = ctx.doc.root.querySelector(`label[for="${escaped}"]`);
    if (lbl && lbl.textContent.trim()) return true;
  }
  // wrapping <label>
  let p: HTMLElement | null = el.parentNode as HTMLElement | null;
  while (p) {
    if (p.tagName && p.tagName.toLowerCase() === "label") {
      return p.textContent.trim().length > 0;
    }
    p = p.parentNode as HTMLElement | null;
  }
  return false;
}

export const inputLabel: Rule = {
  id: "input-label",
  category: "forms",
  severity: "error",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    for (const el of ctx.doc.root.querySelectorAll(LABELABLE.join(","))) {
      const tag = el.tagName.toLowerCase();
      const type = (el.getAttribute("type") ?? "").toLowerCase();
      if (tag === "input" && NO_LABEL_TYPES.has(type)) continue;
      if (el.getAttribute("aria-hidden") === "true") continue;
      if (!hasAssociatedLabel(el, ctx)) {
        issues.push(
          makeIssue(this, ctx, {
            el,
            message: `Form control <${tag}${type ? ` type="${type}"` : ""}> has no associated label`,
            detail: "Users of assistive tech won't know what to enter.",
            fix: 'Add <label for="…">, wrap it in a <label>, or use aria-label.',
          }),
        );
      }
    }
    return issues;
  },
};

export const labelEmpty: Rule = {
  id: "label-empty",
  category: "forms",
  severity: "warning",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    for (const label of ctx.doc.root.querySelectorAll("label")) {
      if (label.textContent.trim() === "" && !(label.getAttribute("aria-label") ?? "").trim()) {
        issues.push(
          makeIssue(this, ctx, {
            el: label,
            message: "<label> is empty",
            fix: "Give the label visible text describing the control.",
          }),
        );
      }
    }
    return issues;
  },
};
