/** Core types for a11ylint. */

export type Severity = "error" | "warning" | "info";

export type Category =
  | "images"
  | "forms"
  | "structure"
  | "controls"
  | "aria"
  | "language"
  | "tables"
  | "color";

export const CATEGORIES: Category[] = [
  "images",
  "forms",
  "structure",
  "controls",
  "aria",
  "language",
  "tables",
  "color",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  images: "Images & media",
  forms: "Forms & labels",
  structure: "Document structure",
  controls: "Interactive controls",
  aria: "ARIA usage",
  language: "Language & metadata",
  tables: "Data tables",
  color: "Color & contrast",
};

export type RuleId =
  | "img-alt"
  | "img-redundant-alt"
  | "input-label"
  | "label-empty"
  | "button-name"
  | "link-name"
  | "link-href"
  | "heading-order"
  | "heading-empty"
  | "page-has-h1"
  | "landmark-main"
  | "html-lang"
  | "page-title"
  | "duplicate-id"
  | "aria-role-valid"
  | "aria-attr-valid"
  | "aria-hidden-focus"
  | "table-headers"
  | "table-caption"
  | "contrast-inline"
  | "positive-tabindex"
  | "meta-viewport-scalable"
  | "list-structure";

/** A WCAG success criterion reference. */
export interface WcagRef {
  criterion: string;
  level: "A" | "AA" | "AAA";
  name: string;
}

export interface Issue {
  rule: RuleId;
  severity: Severity;
  category: Category;
  message: string;
  /** 1-based line number in the source, when known. */
  line?: number;
  /** A short snippet of the offending element. */
  snippet?: string;
  detail?: string;
  fix?: string;
  wcag?: WcagRef;
}

export interface CategoryScore {
  category: Category;
  label: string;
  score: number;
  error: number;
  warning: number;
  info: number;
}

export interface PageReport {
  source: string;
  title: string | null;
  score: number;
  grade: string;
  counts: { error: number; warning: number; info: number };
  categories: CategoryScore[];
  issues: Issue[];
}

export interface Report {
  tool: "a11ylint";
  version: string;
  generatedAt: string;
  summary: {
    pages: number;
    score: number;
    grade: string;
    errors: number;
    warnings: number;
    infos: number;
  };
  pages: PageReport[];
}

export interface A11ylintConfig {
  /** Categories to skip entirely. */
  disableCategories: Category[];
  /** Individual rules to skip. */
  disableRules: RuleId[];
  /** Only report issues at or above this level. */
  minLevel: "A" | "AA" | "AAA";
  /** CI gate: minimum overall score (0–100). */
  minScore: number;
  /** Per-rule severity overrides. */
  ruleSeverity: Partial<Record<RuleId, Severity>>;
  /** Per-category weights for the overall score. */
  categoryWeights: Partial<Record<Category, number>>;
}
