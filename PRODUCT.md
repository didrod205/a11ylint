# a11ylint — Product & Launch Strategy

The strategy brief behind a11ylint, so the project can be maintained, marketed,
and grown by one person.

## 1. Idea & rationale

Web accessibility is now a legal and financial requirement (ADA, the European
Accessibility Act effective June 2025, Section 508), with thousands of lawsuits
filed yearly — yet the dominant tools (axe-core, pa11y, Lighthouse) all require
a **headless browser**, making them slow and awkward to run on the static HTML a
build just produced. a11ylint is a **deterministic, static** a11y linter that
catches the large class of markup-level WCAG issues with no browser, so it drops
straight into CI or a pre-commit hook.

## 2. Competitor analysis

| Tool | Focus | Gap a11ylint fills |
| --- | --- | --- |
| **axe-core / @axe-core/cli** | Runtime a11y in a browser | Needs a DOM/browser; heavy for static HTML & CI |
| **pa11y** | Headless-Chrome a11y | Puppeteer dependency, slower, more setup |
| **Lighthouse** | Perf/SEO/a11y of a rendered page | Browser-bound; a11y is one tab, not a focused linter |
| **eslint-plugin-jsx-a11y** | JSX lint in React source | Source-only, React-only; doesn't check built HTML |
| **html-validate** | HTML validity (some a11y) | Validity-focused; not WCAG-mapped a11y scoring/report |

**White space:** a fast, browser-free, WCAG-mapped a11y linter for **HTML
files** with a gate-able score and JSON/Markdown reports.

## 3. Differentiation

- **No headless browser** — pure static analysis, milliseconds, trivial CI setup.
- **WCAG-mapped** — every issue cites a success criterion + level.
- **Score + grade + reports** — gate-able, shareable, diff-able.
- **Framework-agnostic** — lints any emitted HTML (Next, Astro, Hugo, plain).
- **Deterministic & local** — same HTML → same report; nothing uploaded.
- **Dependency-light** — `cac`, `picocolors`, `node-html-parser`.

## 4. Folder structure

```
a11ylint/
├─ src/
│  ├─ parse.ts, wcag.ts, aria-data.ts, utils/color.ts
│  ├─ rules/   # images/forms/structure/controls/aria/language/tables/color + registry
│  ├─ score.ts, config.ts, types.ts
│  ├─ report/{json,markdown,console}.ts
│  ├─ index.ts, loader.ts, cli.ts
├─ tests/      # vitest specs
├─ examples/ good.html, bad.html, config + sample reports
└─ .github/, README.md, CONTRIBUTING.md, CHANGELOG.md, LICENSE, package.json
```

## 5. Source

Full TypeScript in `src/` (ESM+CJS via tsup), MIT-licensed. See README
"Programmatic API" and CONTRIBUTING "Adding a rule".

## 6. README

See [README.md](./README.md): one-liner, why-it-exists, features, install,
quick start, CLI usage, example result, config, 3 use cases, roadmap, FAQ,
contributing, license, sponsor (Lemon Squeezy), screenshot placeholder.

## 7. License

[MIT](./LICENSE).

## 8. GitHub topics

`accessibility`, `a11y`, `wcag`, `accessibility-linter`, `a11y-linter`,
`html-accessibility`, `axe-alternative`, `wcag-checker`, `aria`, `a11y-ci`,
`accessibility-audit`, `section508`, `cli`, `typescript`.

## 9. Product Hunt blurb

> **a11ylint — catch accessibility bugs in your HTML, right in CI.**
> A free, deterministic, **static** a11y linter (no headless browser) that
> checks WCAG-mapped rules — alt text, form labels, heading order, ARIA validity,
> landmarks, color contrast, data tables — with line numbers, fixes, a score and
> JSON/Markdown reports. `npx @didrod2539/a11ylint scan ./dist`. Gate CI with
> `--min-score 90`.

## 10. npm name

Package `@didrod2539/a11ylint`, bin `a11ylint`. Scoped to satisfy npm's
name-similarity policy while keeping the memorable `a11y` + `*lint` brand.
ESM+CJS+types.

## 11. SEO/keyword strategy

- **Primary:** accessibility linter, a11y CI, WCAG checker, HTML accessibility,
  axe alternative, accessibility audit CLI, section 508 checker.
- **Long-tail:** "check accessibility without browser", "WCAG lint CI",
  "static a11y linter", "find missing alt text CLI", "ARIA validation tool".
- **Channels:** README (keyword-rich + FAQ), npm keywords, GitHub topics, a
  dev.to post ("Accessibility in CI without a headless browser"), Product Hunt,
  r/webdev, r/accessibility, a11y Slack/Discord communities, Show HN.
- **Content moat:** a "static vs runtime a11y checks" reference page that
  doubles as docs and ranks for "axe alternative".

## 12. Monetization

- **Sponsorship via Lemon Squeezy only** (one-time/recurring) — FUNDING.yml +
  README. Funds: more rules, a GitHub Action w/ PR annotations, SARIF output,
  CSS-aware contrast, a `--fix` mode, issue triage.
- **Future optional paid tier (never gates the OSS):** a hosted dashboard that
  tracks a11y score over time and comments on PRs. CLI + library stay free and
  MIT forever.

## 13. Maintenance plan (one person)

- Each rule is an isolated pure function with its own test → low-risk changes.
- WCAG/ARIA mappings are declarative data; updates are one-line PRs.
- CI matrix (Node 18/20/22) + example smoke test guards regressions.
- Tagged releases auto-publish via `release.yml`.
- Determinism + committed sample reports make output changes obvious in diffs.
