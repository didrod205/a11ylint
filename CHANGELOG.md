# Changelog

All notable changes are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/) and this project adheres to
[Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-06-01

### Added

- Initial public release.
- `scan` command: statically lint HTML files / directories for accessibility.
- `report` command: re-render a saved JSON report as Markdown.
- `init` command: scaffold an `a11ylint.config.json`.
- 22 WCAG-mapped rules across 8 categories: images, forms, structure, controls,
  ARIA, language/metadata, tables, and inline color contrast.
- Each issue carries a WCAG 2.1 success-criterion reference + level (A/AA/AAA),
  a line number, a snippet, and a concrete fix.
- WCAG contrast math for inline `style` colors (hex, rgb(), named).
- ARIA role & attribute validation against a WAI-ARIA subset.
- Per-category + weighted overall score with an A–F grade.
- `--level` to target A / AA / AAA conformance.
- JSON (`--json`) and Markdown (`--md`) export; colored console output.
- CI gate: `--min-score` (non-zero exit).
- Config file support: disable categories/rules, severities, weights, level.
- Programmatic API: `analyze`, `buildReport`, `parseDocument`, `accessibleName`,
  `contrastRatio`, `toJSON`, `toMarkdown`.
- No headless browser — pure static analysis. ESM + CJS + TypeScript types.

[0.1.0]: https://github.com/didrod205/a11ylint/releases/tag/v0.1.0
