import pc from "picocolors";
import type { PageReport, Report, Severity } from "../types.js";

const MARK: Record<Severity, (s: string) => string> = {
  error: (s) => pc.red(s),
  warning: (s) => pc.yellow(s),
  info: (s) => pc.blue(s),
};
const SIGN: Record<Severity, string> = { error: "✗", warning: "⚠", info: "ℹ" };

function gradeColor(grade: string, text: string): string {
  if (grade === "A") return pc.green(text);
  if (grade === "B") return pc.cyan(text);
  if (grade === "C") return pc.yellow(text);
  return pc.red(text);
}

/** Print a report to the console. When `quiet`, info-level issues are hidden. */
export function printReport(report: Report, quiet = false): void {
  for (const p of report.pages) printPage(p, quiet);

  const s = report.summary;
  const head = gradeColor(s.grade, `${s.score}/100 (${s.grade})`);
  console.log(
    `\n${pc.bold("Overall")}  ${head}  ` +
      `${s.pages} page(s), ` +
      `${pc.red(`${s.errors} error(s)`)}, ${pc.yellow(`${s.warnings} warning(s)`)}, ${s.infos} info`,
  );
}

function printPage(p: PageReport, quiet: boolean): void {
  const head = gradeColor(p.grade, `${p.score}/100 (${p.grade})`);
  const title = p.title ? pc.dim(` ${truncate(p.title, 40)}`) : "";
  console.log(`\n${pc.bold(p.source)}  ${head}${title}`);

  for (const c of p.categories) {
    const label = c.label.padEnd(22);
    console.log(`  ${pc.dim(label)} ${String(c.score).padStart(3)}`);
  }

  const issues = quiet ? p.issues.filter((i) => i.severity !== "info") : p.issues;
  if (issues.length === 0) {
    console.log(`  ${pc.green("✓")} ${pc.dim("no issues")}`);
    return;
  }
  console.log("");
  for (const i of issues) {
    const loc = i.line ? pc.dim(`:${i.line}`) : "";
    const wcag = i.wcag ? pc.dim(` [WCAG ${i.wcag.criterion} ${i.wcag.level}]`) : "";
    console.log(`  ${MARK[i.severity](SIGN[i.severity])} ${i.message}${loc}${wcag}`);
    if (i.fix) console.log(`      ${pc.dim("→ " + i.fix)}`);
  }
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}
