# Contributing to a11ylint

Thanks for your interest! a11ylint is built so that **adding a rule is small,
isolated, and testable**. Most contributions are a new WCAG rule.

## Getting started

```bash
git clone https://github.com/didrod205/a11ylint.git
cd a11ylint
npm install
npm test            # vitest
npm run typecheck   # tsc --noEmit
npm run build       # tsup -> dist/
node dist/cli.js scan examples/bad.html
```

## Project layout

```
src/
  parse.ts          # HTML -> queryable document (with line numbers)
  wcag.ts           # rule -> WCAG success-criterion mapping
  aria-data.ts      # valid ARIA roles & attributes
  utils/color.ts    # WCAG contrast math
  rules/            # images / forms / structure / controls / aria / language /
                    #   tables / color  (the interesting part) + registry
  score.ts          # issues -> per-category & overall score, A–F grade
  report/           # json | markdown | console renderers
  config.ts, types.ts, index.ts, loader.ts, cli.ts
tests/              # vitest specs
examples/           # good.html, bad.html, config + sample reports
```

## Adding a rule

1. Add the rule id to `RuleId` in `src/types.ts`, and a WCAG mapping in
   `src/wcag.ts`.
2. Write the rule in the relevant `src/rules/*.ts`:

   ```ts
   import type { Issue } from "../types.js";
   import { makeIssue, type Rule, type RuleContext } from "./context.js";

   export const myRule: Rule = {
     id: "my-rule",
     category: "forms",
     severity: "error",
     run(ctx: RuleContext): Issue[] {
       const issues: Issue[] = [];
       for (const el of ctx.doc.root.querySelectorAll("…")) {
         // push makeIssue(this, ctx, { el, message, fix }) — line/snippet auto-filled
       }
       return issues;
     },
   };
   ```

3. Register it in `src/rules/index.ts` (order = report order).
4. Add a test in `tests/rules.test.ts` with a tiny HTML snippet proving it fires
   (and doesn't fire on accessible markup).

## Principles

- **Deterministic.** No randomness, no network, no time-dependent output. Same
  HTML must always produce the same report.
- **Static-only.** a11ylint analyzes markup; if a check truly needs a rendered
  browser (computed styles, focus management), it belongs in axe/pa11y, not here.
- **Conservative.** Prefer a missed edge case over a false positive; cite the
  WCAG criterion and document heuristics.
- **Dependency-light.** Only `cac`, `picocolors`, and `node-html-parser`.
- **Actionable.** Every issue needs a concrete `fix` message.

## Checklist before opening a PR

- [ ] `npm run typecheck` passes
- [ ] `npm test` passes (tests added for new behavior)
- [ ] New rules have a stable id, a WCAG mapping, and a `fix` message
- [ ] `CHANGELOG.md` updated for user-facing changes
- [ ] Regenerated `examples/sample-report.*` if output changed

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md).
