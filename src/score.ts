/** Deterministic scoring & grading. */

import { CATEGORY_LABELS, type A11ylintConfig, type Category, type CategoryScore, type Issue } from "./types.js";

export function gradeFor(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

const WEIGHT = { error: 10, warning: 4, info: 1 } as const;

/** Score a single category from its issues (100 = no issues). */
export function scoreCategory(issues: Issue[], category: Category): CategoryScore {
  let penalty = 0;
  let error = 0;
  let warning = 0;
  let info = 0;
  for (const i of issues) {
    if (i.category !== category) continue;
    penalty += WEIGHT[i.severity];
    if (i.severity === "error") error++;
    else if (i.severity === "warning") warning++;
    else info++;
  }
  const score = Math.max(0, Math.min(100, 100 - penalty));
  return { category, label: CATEGORY_LABELS[category], score, error, warning, info };
}

/** Combine category scores into a single weighted 0–100 score. */
export function overallScore(categories: CategoryScore[], config: A11ylintConfig): number {
  if (categories.length === 0) return 100;
  let weighted = 0;
  let total = 0;
  for (const c of categories) {
    const w = config.categoryWeights[c.category] ?? 1;
    weighted += c.score * w;
    total += w;
  }
  return total > 0 ? Math.round(weighted / total) : 100;
}
