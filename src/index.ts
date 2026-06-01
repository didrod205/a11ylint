/**
 * a11ylint — static accessibility (a11y) linter for HTML. Checks WCAG-mapped
 * rules across images, forms, structure, controls, ARIA, language, tables and
 * inline color contrast — no headless browser, deterministic, fully local.
 *
 * This module is the programmatic API; see `cli.ts` for the command line.
 */

import { DEFAULT_CONFIG } from "./config.js";
import { parseDocument } from "./parse.js";
import { RULES_REGISTRY } from "./rules/index.js";
import { gradeFor, overallScore, scoreCategory } from "./score.js";
import { levelMeetsMin } from "./wcag.js";
import { CATEGORIES, type A11ylintConfig, type Issue, type PageReport, type Report } from "./types.js";

export * from "./types.js";
export { DEFAULT_CONFIG, loadConfig } from "./config.js";
export { parseDocument, accessibleName } from "./parse.js";
export { RULES_REGISTRY } from "./rules/index.js";
export { gradeFor } from "./score.js";
export { WCAG } from "./wcag.js";
export { contrastRatio, parseColor } from "./utils/color.js";
export { toJSON } from "./report/json.js";
export { toMarkdown } from "./report/markdown.js";

export interface AnalyzeInput {
  source: string;
  html: string;
}

/** Analyze a single HTML document and produce its accessibility report. */
export function analyze(input: AnalyzeInput, config: A11ylintConfig = DEFAULT_CONFIG): PageReport {
  const doc = parseDocument(input.html);
  const ctx = { source: input.source, doc, config };

  const issues: Issue[] = [];
  for (const rule of RULES_REGISTRY) {
    if (config.disableRules.includes(rule.id)) continue;
    if (config.disableCategories.includes(rule.category)) continue;
    for (const issue of rule.run(ctx)) {
      // Filter by WCAG level: keep issues without a WCAG ref, or those meeting minLevel.
      if (issue.wcag && !levelMeetsMin(issue.wcag.level, config.minLevel)) continue;
      issues.push(issue);
    }
  }

  const categories = CATEGORIES.filter((c) => !config.disableCategories.includes(c))
    .map((c) => scoreCategory(issues, c))
    .filter((cs) => issues.some((i) => i.category === cs.category));

  const score = overallScore(categories, config);
  const counts = { error: 0, warning: 0, info: 0 };
  for (const i of issues) counts[i.severity]++;

  return {
    source: input.source,
    title: doc.title,
    score,
    grade: gradeFor(score),
    counts,
    categories,
    issues,
  };
}

export interface BuildOptions {
  version?: string;
  now?: Date;
}

/** Assemble a multi-page report. */
export function buildReport(pages: PageReport[], options: BuildOptions = {}): Report {
  const score = pages.length
    ? Math.round(pages.reduce((s, p) => s + p.score, 0) / pages.length)
    : 100;
  const errors = pages.reduce((s, p) => s + p.counts.error, 0);
  const warnings = pages.reduce((s, p) => s + p.counts.warning, 0);
  const infos = pages.reduce((s, p) => s + p.counts.info, 0);

  return {
    tool: "a11ylint",
    version: options.version ?? "0.0.0",
    generatedAt: (options.now ?? new Date()).toISOString(),
    summary: {
      pages: pages.length,
      score,
      grade: gradeFor(score),
      errors,
      warnings,
      infos,
    },
    pages,
  };
}
