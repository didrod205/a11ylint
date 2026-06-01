/** Document structure rules: headings, landmarks, lists. */

import type { Issue } from "../types.js";
import { makeIssue, type Rule, type RuleContext } from "./context.js";

export const headingOrder: Rule = {
  id: "heading-order",
  category: "structure",
  severity: "warning",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    const headings = ctx.doc.root.querySelectorAll("h1,h2,h3,h4,h5,h6");
    let prev = 0;
    for (const h of headings) {
      const level = Number(h.tagName.slice(1));
      if (prev !== 0 && level > prev + 1) {
        issues.push(
          makeIssue(this, ctx, {
            el: h,
            message: `Heading level jumps from h${prev} to h${level}`,
            detail: "Skipping levels breaks the document outline for screen readers.",
            fix: `Use an h${prev + 1} here, or restructure the headings.`,
          }),
        );
      }
      prev = level;
    }
    return issues;
  },
};

export const headingEmpty: Rule = {
  id: "heading-empty",
  category: "structure",
  severity: "error",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    for (const h of ctx.doc.root.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
      if (h.textContent.trim() === "" && !(h.getAttribute("aria-label") ?? "").trim()) {
        issues.push(
          makeIssue(this, ctx, {
            el: h,
            message: `Empty <${h.tagName.toLowerCase()}> heading`,
            fix: "Remove the empty heading or give it text.",
          }),
        );
      }
    }
    return issues;
  },
};

export const pageHasH1: Rule = {
  id: "page-has-h1",
  category: "structure",
  severity: "warning",
  run(ctx: RuleContext): Issue[] {
    // Only meaningful for full documents.
    if (!ctx.doc.root.querySelector("body") && !ctx.doc.root.querySelector("html")) return [];
    const h1s = ctx.doc.root.querySelectorAll("h1");
    if (h1s.length === 0) {
      return [
        makeIssue(this, ctx, {
          message: "Page has no <h1>",
          detail: "An h1 communicates the main topic of the page.",
          fix: "Add a single, descriptive <h1>.",
        }),
      ];
    }
    if (h1s.length > 1) {
      return [
        makeIssue(this, ctx, {
          el: h1s[1],
          message: `Page has ${h1s.length} <h1> elements`,
          detail: "Multiple h1s can confuse the page outline.",
          fix: "Prefer a single <h1>; demote the rest.",
        }),
      ];
    }
    return [];
  },
};

export const landmarkMain: Rule = {
  id: "landmark-main",
  category: "structure",
  severity: "warning",
  run(ctx: RuleContext): Issue[] {
    if (!ctx.doc.root.querySelector("body")) return [];
    const main =
      ctx.doc.root.querySelector("main") ?? ctx.doc.root.querySelector('[role="main"]');
    if (!main) {
      return [
        makeIssue(this, ctx, {
          message: "Page has no <main> landmark",
          detail: "A main landmark lets users skip directly to primary content.",
          fix: "Wrap the primary content in <main>.",
        }),
      ];
    }
    return [];
  },
};

export const listStructure: Rule = {
  id: "list-structure",
  category: "structure",
  severity: "warning",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    for (const list of ctx.doc.root.querySelectorAll("ul,ol")) {
      for (const child of list.childNodes) {
        // node-html-parser: nodeType 1 === element
        const tag = (child as { tagName?: string }).tagName?.toLowerCase();
        if (tag && tag !== "li" && tag !== "script" && tag !== "template") {
          issues.push(
            makeIssue(this, ctx, {
              el: list,
              message: `<${list.tagName.toLowerCase()}> has a direct <${tag}> child (only <li> is allowed)`,
              fix: "Move non-<li> content inside an <li>.",
            }),
          );
          break;
        }
      }
    }
    return issues;
  },
};
