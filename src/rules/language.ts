/** Language & metadata rules: html lang, title, viewport, duplicate ids. */

import type { HTMLElement } from "node-html-parser";
import type { Issue } from "../types.js";
import { makeIssue, type Rule, type RuleContext } from "./context.js";

const LANG_RE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

export const htmlLang: Rule = {
  id: "html-lang",
  category: "language",
  severity: "error",
  run(ctx: RuleContext): Issue[] {
    const html = ctx.doc.root.querySelector("html");
    if (!html) return []; // fragment, not a full page
    const lang = html.getAttribute("lang");
    if (!lang || lang.trim() === "") {
      return [
        makeIssue(this, ctx, {
          el: html,
          message: "<html> has no lang attribute",
          detail: "Screen readers use lang to choose pronunciation.",
          fix: 'Add a language, e.g. <html lang="en">.',
        }),
      ];
    }
    if (!LANG_RE.test(lang.trim())) {
      return [
        makeIssue(this, ctx, {
          el: html,
          message: `Invalid lang value "${lang}"`,
          fix: 'Use a valid BCP 47 tag, e.g. "en" or "pt-BR".',
        }),
      ];
    }
    return [];
  },
};

export const pageTitle: Rule = {
  id: "page-title",
  category: "language",
  severity: "error",
  run(ctx: RuleContext): Issue[] {
    const head = ctx.doc.root.querySelector("head");
    const html = ctx.doc.root.querySelector("html");
    if (!head && !html) return []; // fragment
    const title = ctx.doc.root.querySelector("title");
    if (!title || title.textContent.trim() === "") {
      return [
        makeIssue(this, ctx, {
          message: title ? "<title> is empty" : "Page has no <title>",
          detail: "The title is the first thing announced and shown in tabs/history.",
          fix: "Add a concise, descriptive <title>.",
        }),
      ];
    }
    return [];
  },
};

export const metaViewportScalable: Rule = {
  id: "meta-viewport-scalable",
  category: "language",
  severity: "warning",
  run(ctx: RuleContext): Issue[] {
    const metas = ctx.doc.root.querySelectorAll('meta[name="viewport"]');
    for (const meta of metas) {
      const content = (meta.getAttribute("content") ?? "").toLowerCase();
      if (/user-scalable\s*=\s*no/.test(content) || /maximum-scale\s*=\s*1(\.0)?\b/.test(content)) {
        return [
          makeIssue(this, ctx, {
            el: meta,
            message: "Viewport disables zoom (user-scalable=no / maximum-scale=1)",
            detail: "Blocking zoom prevents low-vision users from enlarging text.",
            fix: "Remove user-scalable=no and maximum-scale restrictions.",
          }),
        ];
      }
    }
    return [];
  },
};

export const duplicateId: Rule = {
  id: "duplicate-id",
  category: "language",
  severity: "warning",
  run(ctx: RuleContext): Issue[] {
    const seen = new Map<string, HTMLElement>();
    const issues: Issue[] = [];
    for (const el of ctx.doc.root.querySelectorAll("[id]")) {
      const id = el.getAttribute("id");
      if (!id) continue;
      if (seen.has(id)) {
        issues.push(
          makeIssue(this, ctx, {
            el,
            message: `Duplicate id "${id}"`,
            detail: "Duplicate ids break label/aria references and scripting.",
            fix: "Make every id unique.",
          }),
        );
      } else {
        seen.set(id, el);
      }
    }
    return issues;
  },
};
