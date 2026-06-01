/** Data-table accessibility rules. */

import type { HTMLElement } from "node-html-parser";
import type { Issue } from "../types.js";
import { makeIssue, type Rule, type RuleContext } from "./context.js";

/** A table is "layout" (skip a11y checks) if it declares role=presentation/none. */
function isLayoutTable(table: HTMLElement): boolean {
  const role = (table.getAttribute("role") ?? "").toLowerCase();
  return role === "presentation" || role === "none";
}

export const tableHeaders: Rule = {
  id: "table-headers",
  category: "tables",
  severity: "warning",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    for (const table of ctx.doc.root.querySelectorAll("table")) {
      if (isLayoutTable(table)) continue;
      const rows = table.querySelectorAll("tr");
      if (rows.length === 0) continue;
      const ths = table.querySelectorAll("th");
      if (ths.length === 0) {
        issues.push(
          makeIssue(this, ctx, {
            el: table,
            message: "Data table has no <th> header cells",
            detail: "Without headers, screen readers can't associate cells with columns/rows.",
            fix: "Use <th> for header cells (add scope=\"col\"/\"row\").",
          }),
        );
        continue;
      }
      // th present but missing scope on a multi-dimensional table is a softer issue.
      const scoped = table.querySelectorAll("th[scope]");
      if (scoped.length === 0 && ths.length > 1) {
        issues.push(
          makeIssue(this, ctx, {
            el: table,
            message: "Table headers have no scope attribute",
            detail: "scope=col/row makes header associations explicit.",
            fix: 'Add scope="col" or scope="row" to each <th>.',
          }),
        );
      }
    }
    return issues;
  },
};

export const tableCaption: Rule = {
  id: "table-caption",
  category: "tables",
  severity: "info",
  run(ctx: RuleContext): Issue[] {
    const issues: Issue[] = [];
    for (const table of ctx.doc.root.querySelectorAll("table")) {
      if (isLayoutTable(table)) continue;
      const caption = table.querySelector("caption");
      const hasLabel =
        (table.getAttribute("aria-label") ?? "").trim() !== "" ||
        (table.getAttribute("aria-labelledby") ?? "").trim() !== "";
      if (!caption && !hasLabel) {
        issues.push(
          makeIssue(this, ctx, {
            el: table,
            message: "Data table has no <caption>",
            detail: "A caption gives the table an accessible name/summary.",
            fix: "Add a <caption> or aria-label describing the table.",
          }),
        );
      }
    }
    return issues;
  },
};
