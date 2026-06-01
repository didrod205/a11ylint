import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { analyze, buildReport, gradeFor, toJSON, toMarkdown } from "../src/index.js";
import { DEFAULT_CONFIG } from "../src/config.js";

const good = readFileSync(resolve(__dirname, "../examples/good.html"), "utf8");
const bad = readFileSync(resolve(__dirname, "../examples/bad.html"), "utf8");

describe("end-to-end analyze", () => {
  it("scores an accessible page much higher than a broken one", () => {
    const g = analyze({ source: "good", html: good });
    const b = analyze({ source: "bad", html: bad });
    expect(g.score).toBeGreaterThan(b.score);
    expect(g.grade).toBe("A");
    expect(g.issues).toHaveLength(0);
    expect(b.counts.error).toBeGreaterThan(5);
  });

  it("covers many categories on the bad page", () => {
    const b = analyze({ source: "bad", html: bad });
    const cats = new Set(b.issues.map((i) => i.category));
    expect(cats.size).toBeGreaterThanOrEqual(6);
  });

  it("is deterministic", () => {
    const a = analyze({ source: "bad", html: bad });
    const b = analyze({ source: "bad", html: bad });
    expect(a.score).toBe(b.score);
    expect(a.issues.length).toBe(b.issues.length);
  });

  it("honours disableCategories and disableRules", () => {
    const noImages = analyze({ source: "bad", html: bad }, { ...DEFAULT_CONFIG, disableCategories: ["images"] });
    expect(noImages.issues.some((i) => i.category === "images")).toBe(false);
    const noAlt = analyze({ source: "bad", html: bad }, { ...DEFAULT_CONFIG, disableRules: ["img-alt"] });
    expect(noAlt.issues.some((i) => i.rule === "img-alt")).toBe(false);
  });

  it("attaches WCAG references to issues", () => {
    const b = analyze({ source: "bad", html: bad });
    const altIssue = b.issues.find((i) => i.rule === "img-alt");
    expect(altIssue?.wcag?.criterion).toBe("1.1.1");
    expect(altIssue?.wcag?.level).toBe("A");
  });
});

describe("buildReport & exports", () => {
  const report = buildReport(
    [analyze({ source: "good.html", html: good }), analyze({ source: "bad.html", html: bad })],
    { version: "9.9.9" },
  );

  it("summarizes pages", () => {
    expect(report.tool).toBe("a11ylint");
    expect(report.summary.pages).toBe(2);
    expect(report.summary.errors).toBeGreaterThan(0);
    expect(report.version).toBe("9.9.9");
  });

  it("renders JSON and Markdown", () => {
    expect(JSON.parse(toJSON(report)).tool).toBe("a11ylint");
    const md = toMarkdown(report);
    expect(md).toContain("# a11ylint report");
    expect(md).toContain("WCAG");
  });

  it("grades correctly", () => {
    expect(gradeFor(95)).toBe("A");
    expect(gradeFor(50)).toBe("F");
  });
});
