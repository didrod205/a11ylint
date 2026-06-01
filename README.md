<div align="center">

# ♿ a11ylint

### Catch accessibility (a11y) bugs in your HTML — no browser, right in CI.

[![npm version](https://img.shields.io/npm/v/@didrod2539/a11ylint.svg?color=success)](https://www.npmjs.com/package/@didrod2539/a11ylint)
[![CI](https://github.com/didrod205/a11ylint/actions/workflows/ci.yml/badge.svg)](https://github.com/didrod205/a11ylint/actions/workflows/ci.yml)
[![node](https://img.shields.io/node/v/@didrod2539/a11ylint.svg)](https://www.npmjs.com/package/@didrod2539/a11ylint)
[![license](https://img.shields.io/npm/l/@didrod2539/a11ylint.svg)](./LICENSE)

A deterministic, **static** accessibility linter for HTML. It checks WCAG-mapped
rules — alt text, form labels, heading order, ARIA validity, landmarks, color
contrast, data tables and more — **without a headless browser**, so it runs on
your build output in milliseconds. Score, A–F grade, and JSON/Markdown reports.

</div>

---

## One-line summary

`a11ylint` statically analyzes HTML files and reports WCAG accessibility issues
with line numbers, fixes, and a score you can gate in CI — no Puppeteer, no API
key, no server.

## Why this project exists

Accessibility isn't optional anymore: the **ADA** (US), the **European
Accessibility Act** (in force June 2025), **Section 508**, and similar laws make
inaccessible sites a legal and financial risk — and thousands of lawsuits are
filed every year. Yet most a11y tools (axe-core, pa11y, Lighthouse) need to spin
up a **headless browser**, which is slow, heavy, and awkward to wire into a build
that just emitted static HTML.

`a11ylint` focuses on the large set of issues you **can** catch from the markup
alone — missing alt text, unlabeled inputs, empty buttons/links, broken heading
order, invalid ARIA, missing landmarks, low-contrast inline styles, header-less
tables — and runs them as a fast, deterministic lint. Perfect for a pre-commit
hook or CI gate. It complements (doesn't replace) runtime tools.

## Key features

- 🖼️ **Images** — missing `alt`, redundant "image of…" alt text.
- 📝 **Forms** — inputs/selects/textareas with no associated label, empty labels.
- 🔤 **Structure** — skipped heading levels, empty headings, missing `<h1>`,
  missing `<main>` landmark, invalid list nesting.
- 🔘 **Controls** — empty buttons/links, `<a>` without `href`, positive `tabindex`.
- 🧩 **ARIA** — invalid roles, misspelled `aria-*` attributes, focusable content
  inside `aria-hidden`.
- 🌐 **Language & meta** — missing `lang`/`<title>`, zoom-disabling viewport,
  duplicate `id`s.
- 📊 **Tables** — data tables without `<th>`/scope or `<caption>`.
- 🎨 **Color** — WCAG contrast math on inline `style` colors.
- Every issue maps to a **WCAG 2.1 success criterion** and level (A/AA/AAA).
- Score + **A–F grade**, **JSON/Markdown** export, **CI gate** exit codes.

## Install

```bash
# run without installing
npx @didrod2539/a11ylint scan index.html

# or install
npm install -g @didrod2539/a11ylint    # global CLI (provides `a11ylint`)
npm install -D @didrod2539/a11ylint    # project dev-dependency (for CI)
```

Node ≥ 18. ESM + CJS + TypeScript types.

## Quick start

```bash
a11ylint scan ./dist
```

```
page.html  80/100 (B)
  Images & media          79
  Forms & labels          76
  Interactive controls    66
  ARIA usage              70
  ...

  ✗ Image is missing an alt attribute:8 [WCAG 1.1.1 A]
      → Add alt text, or alt="" with role="presentation" if decorative.
  ✗ Form control <input type="text"> has no associated label:19 [WCAG 3.3.2 A]
      → Add <label for="…">, wrap it in a <label>, or use aria-label.
  ✗ Invalid ARIA role "buton":27 [WCAG 4.1.2 A]
  ⚠ Low contrast 1.92:1 (needs 4.5:1):25 [WCAG 1.4.3 AA]

Overall  80/100 (B)  1 page(s), 12 error(s), 8 warning(s), 2 info
```

## CLI usage

```bash
a11ylint scan [...targets]    # lint HTML files or directories
a11ylint report <input.json>  # re-render a saved JSON report as Markdown
a11ylint init                 # scaffold a11ylint.config.json
a11ylint --help
a11ylint --version
```

`scan` options:

| Option | Description |
| --- | --- |
| `--config <file>` | Path to a config file (otherwise auto-detected) |
| `--level <A\|AA\|AAA>` | Target WCAG conformance level (default AA) |
| `--json <file>` | Write a JSON report |
| `--md <file>` | Write a Markdown report |
| `--min-score <n>` | Exit non-zero if the overall score < n (CI gate) |
| `--quiet` | Hide info-level issues in the console |

Pointed at a directory, `scan` finds every `.html`/`.htm` recursively.

## Example result

Full reports for the bundled samples are in
[`examples/sample-report.md`](./examples/sample-report.md) and
[`examples/sample-report.json`](./examples/sample-report.json).

> 📸 _Screenshot / demo GIF placeholder:_ `./docs/screenshot.png` — record the
> terminal running `npx @didrod2539/a11ylint scan examples/bad.html`.

## Configuration

Create `a11ylint.config.json` (or run `a11ylint init`):

```json
{
  "minLevel": "AA",
  "minScore": 90,
  "disableCategories": [],
  "disableRules": ["img-redundant-alt"],
  "ruleSeverity": { "table-caption": "warning" },
  "categoryWeights": { "images": 1.2, "forms": 1.2, "controls": 1.2 }
}
```

| Field | Meaning |
| --- | --- |
| `minLevel` | Target WCAG level: `A` (A only), `AA` (A+AA), `AAA` (all) |
| `minScore` | CI gate threshold (overridable with `--min-score`) |
| `disableCategories` | Skip whole categories (e.g. `["color"]`) |
| `disableRules` | Skip individual rules by id |
| `ruleSeverity` | Override severity per rule id |
| `categoryWeights` | Re-weight categories in the overall score |

Categories: `images`, `forms`, `structure`, `controls`, `aria`, `language`,
`tables`, `color`. Run with `--help` or read `src/types.ts` for the full rule id
list.

## Real-world use cases

1. **Gate accessibility in CI.** Add `a11ylint scan ./dist --min-score 90` to
   your pipeline. A PR that ships an unlabeled form field or an image without alt
   text fails the build before it reaches users (or auditors).
2. **Audit a static export or template.** Run `a11ylint scan ./public
   --md a11y-audit.md` to get a per-page, WCAG-referenced Markdown report you can
   hand to a designer or compliance reviewer.
3. **Pre-commit safety net.** Wire `a11ylint scan <changed>.html` into a
   pre-commit hook so regressions are caught at authoring time, no browser needed.

## Programmatic API

```ts
import { analyze, buildReport, toMarkdown } from "@didrod2539/a11ylint";

const page = analyze({ source: "index.html", html });
console.log(page.score, page.grade, page.issues);

const report = buildReport([page], { version: "0.1.0" });
await fs.writeFile("a11y.md", toMarkdown(report));
```

## Roadmap

- More rules: autocomplete tokens, `lang` on inline language changes, iframe
  titles, label/placeholder-only inputs, redundant `role`.
- Contrast for `<style>` blocks and class-based colors (lightweight CSS cascade).
- A GitHub Action + annotations on PR diffs.
- SARIF output for code-scanning integration.
- `--fix` for safe auto-fixes (add `scope`, quote ids, etc.).
- Config presets (`strict`, `recommended`).

## FAQ

**Is this a replacement for axe-core / Lighthouse?**
No — it's a **complement**. Those run in a real browser and catch dynamic and
computed-style issues a11ylint can't. a11ylint catches the large class of
**static, markup-level** problems with zero browser overhead, which makes it
ideal for CI and pre-commit. Use both.

**Does it need a browser or network?**
No. It parses HTML with a fast static parser and runs entirely locally — no
Puppeteer, no API key, no uploads.

**Why did my page score 80 with 12 errors?**
The score is per-category (each capped at 0–100) then weighted, so one terrible
category doesn't zero out a page that's otherwise fine. Tune `categoryWeights`
and `minScore` for your bar, and use `--min-score` to gate.

**Can it check color contrast?**
For colors declared in **inline `style`** attributes, yes (full WCAG math).
Contrast from external/embedded CSS needs the cascade and is on the roadmap.

**Does it understand ARIA?**
It validates role and `aria-*` attribute names against WAI-ARIA and flags
focusable content hidden with `aria-hidden`. Deep role-semantics checks are
planned.

## Contributing

Contributions welcome! Each check is a small, self-contained rule in
`src/rules/`, and WCAG mappings live in `src/wcag.ts`. See
[CONTRIBUTING.md](./CONTRIBUTING.md) and the
[Code of Conduct](./CODE_OF_CONDUCT.md).

```bash
git clone https://github.com/didrod205/a11ylint.git
cd a11ylint
npm install
npm test
npm run build
node dist/cli.js scan examples/bad.html
```

## License

[MIT](./LICENSE) © a11ylint contributors

## 💖 Sponsor

a11ylint is free, MIT-licensed, and built in spare time. If it helped you ship a
more accessible (and more compliant) site, please consider supporting it:

- ⭐ **Star this repo** — free, and it helps others find it.
- 🍋 **[Sponsor via Lemon Squeezy](https://elab-studio.lemonsqueezy.com/checkout/buy/5d059b89-51d0-456b-b33a-ed56994f7010)** — one-time or recurring.

**Where your support goes:** more WCAG rules, a GitHub Action with PR
annotations, SARIF output, CSS-aware contrast checking, a `--fix` mode, and fast
issue responses.
