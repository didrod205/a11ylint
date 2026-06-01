/** WCAG 2.1 success-criterion references for each rule (declarative table). */

import type { RuleId, WcagRef } from "./types.js";

export const WCAG: Partial<Record<RuleId, WcagRef>> = {
  "img-alt": { criterion: "1.1.1", level: "A", name: "Non-text Content" },
  "img-redundant-alt": { criterion: "1.1.1", level: "A", name: "Non-text Content" },
  "input-label": { criterion: "3.3.2", level: "A", name: "Labels or Instructions" },
  "label-empty": { criterion: "3.3.2", level: "A", name: "Labels or Instructions" },
  "button-name": { criterion: "4.1.2", level: "A", name: "Name, Role, Value" },
  "link-name": { criterion: "2.4.4", level: "A", name: "Link Purpose (In Context)" },
  "link-href": { criterion: "4.1.2", level: "A", name: "Name, Role, Value" },
  "heading-order": { criterion: "1.3.1", level: "A", name: "Info and Relationships" },
  "heading-empty": { criterion: "2.4.6", level: "AA", name: "Headings and Labels" },
  "page-has-h1": { criterion: "1.3.1", level: "A", name: "Info and Relationships" },
  "landmark-main": { criterion: "1.3.1", level: "A", name: "Info and Relationships" },
  "html-lang": { criterion: "3.1.1", level: "A", name: "Language of Page" },
  "page-title": { criterion: "2.4.2", level: "A", name: "Page Titled" },
  "duplicate-id": { criterion: "4.1.1", level: "A", name: "Parsing" },
  "aria-role-valid": { criterion: "4.1.2", level: "A", name: "Name, Role, Value" },
  "aria-attr-valid": { criterion: "4.1.2", level: "A", name: "Name, Role, Value" },
  "aria-hidden-focus": { criterion: "4.1.2", level: "A", name: "Name, Role, Value" },
  "table-headers": { criterion: "1.3.1", level: "A", name: "Info and Relationships" },
  "table-caption": { criterion: "1.3.1", level: "A", name: "Info and Relationships" },
  "contrast-inline": { criterion: "1.4.3", level: "AA", name: "Contrast (Minimum)" },
  "positive-tabindex": { criterion: "2.4.3", level: "A", name: "Focus Order" },
  "meta-viewport-scalable": { criterion: "1.4.4", level: "AA", name: "Resize Text" },
  "list-structure": { criterion: "1.3.1", level: "A", name: "Info and Relationships" },
};

const LEVEL_ORDER: Record<"A" | "AA" | "AAA", number> = { A: 1, AA: 2, AAA: 3 };

/**
 * Should an issue at WCAG `level` be reported when targeting conformance
 * `target`? Conformance is cumulative: targeting AA requires satisfying A **and**
 * AA criteria, so both are reported; AAA additionally reports AAA issues.
 * (target "A" → A only; "AA" → A + AA; "AAA" → A + AA + AAA.)
 */
export function levelMeetsMin(level: "A" | "AA" | "AAA", target: "A" | "AA" | "AAA"): boolean {
  return LEVEL_ORDER[level] <= LEVEL_ORDER[target];
}
