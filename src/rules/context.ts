/** Shared rule context, types, and helpers. */

import type { HTMLElement } from "node-html-parser";
import type { ParsedDocument } from "../parse.js";
import { snippetOf } from "../parse.js";
import { WCAG } from "../wcag.js";
import type { A11ylintConfig, Category, Issue, RuleId, Severity } from "../types.js";

export interface RuleContext {
  source: string;
  doc: ParsedDocument;
  config: A11ylintConfig;
}

export interface Rule {
  id: RuleId;
  category: Category;
  severity: Severity;
  run(ctx: RuleContext): Issue[];
}

export function severityOf(rule: Rule, config: A11ylintConfig): Severity {
  return config.ruleSeverity[rule.id] ?? rule.severity;
}

export interface IssueFields {
  message: string;
  el?: HTMLElement;
  line?: number;
  snippet?: string;
  detail?: string;
  fix?: string;
}

/** Build an Issue, deriving line/snippet from an element when provided. */
export function makeIssue(rule: Rule, ctx: RuleContext, fields: IssueFields): Issue {
  const issue: Issue = {
    rule: rule.id,
    severity: severityOf(rule, ctx.config),
    category: rule.category,
    message: fields.message,
  };
  const line = fields.line ?? (fields.el ? ctx.doc.lineOf(fields.el) : undefined);
  if (line !== undefined) issue.line = line;
  const snippet = fields.snippet ?? (fields.el ? snippetOf(fields.el) : undefined);
  if (snippet !== undefined) issue.snippet = snippet;
  if (fields.detail !== undefined) issue.detail = fields.detail;
  if (fields.fix !== undefined) issue.fix = fields.fix;
  const wcag = WCAG[rule.id];
  if (wcag) issue.wcag = wcag;
  return issue;
}
