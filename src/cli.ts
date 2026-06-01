#!/usr/bin/env node
/** a11ylint command-line interface. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { cac } from "cac";
import pkg from "../package.json";
import { DEFAULT_CONFIG, loadConfig } from "./config.js";
import { analyze, buildReport } from "./index.js";
import { loadInputs } from "./loader.js";
import { printReport } from "./report/console.js";
import { toJSON } from "./report/json.js";
import { toMarkdown } from "./report/markdown.js";
import type { Report } from "./types.js";

const CONFIG_FILE = "a11ylint.config.json";
const cli = cac("a11ylint");

interface ScanOptions {
  config?: string;
  level?: string;
  json?: string;
  md?: string;
  minScore?: string;
  quiet?: boolean;
}

cli
  .command("scan [...targets]", "Lint HTML files or directories for accessibility")
  .option("--config <file>", "Path to a config file")
  .option("--level <A|AA|AAA>", "Minimum WCAG level to report")
  .option("--json <file>", "Write a JSON report to this path")
  .option("--md <file>", "Write a Markdown report to this path")
  .option("--min-score <n>", "Exit non-zero if the overall score is below this (CI gate)")
  .option("--quiet", "Hide info-level issues in the console")
  .example("  a11ylint scan index.html")
  .example("  a11ylint scan ./dist --min-score 90")
  .example("  a11ylint scan page.html --level AAA --json report.json")
  .action((targets: string[], options: ScanOptions) => {
    if (!targets || targets.length === 0) {
      console.error("a11ylint: provide at least one HTML file or directory.");
      process.exit(2);
    }
    try {
      const config = loadConfig(options.config);
      if (options.level) {
        const lvl = options.level.toUpperCase();
        if (lvl !== "A" && lvl !== "AA" && lvl !== "AAA") {
          throw new Error(`invalid --level "${options.level}" (use A, AA, or AAA).`);
        }
        config.minLevel = lvl;
      }

      const inputs = loadInputs(targets);
      const pages = inputs.map((input) => analyze(input, config));
      const report = buildReport(pages, { version: pkg.version });

      printReport(report, Boolean(options.quiet));

      if (options.json) {
        writeFileSync(resolve(options.json), toJSON(report));
        console.log(`\nWrote JSON report → ${options.json}`);
      }
      if (options.md) {
        writeFileSync(resolve(options.md), toMarkdown(report));
        console.log(`Wrote Markdown report → ${options.md}`);
      }

      const minScore = options.minScore !== undefined ? Number(options.minScore) : config.minScore;
      if (report.summary.score < minScore) {
        console.error(
          `\na11ylint: score ${report.summary.score} is below the minimum ${minScore}.`,
        );
        process.exit(1);
      }
    } catch (e) {
      console.error(`a11ylint: ${(e as Error).message}`);
      process.exit(2);
    }
  });

cli
  .command("report <input>", "Render a saved JSON report as Markdown")
  .option("--md <file>", "Write Markdown to this path instead of stdout")
  .action((input: string, options: { md?: string }) => {
    try {
      const report = JSON.parse(readFileSync(resolve(input), "utf8")) as Report;
      const md = toMarkdown(report);
      if (options.md) {
        writeFileSync(resolve(options.md), md);
        console.log(`Wrote ${options.md}`);
      } else {
        process.stdout.write(md);
      }
    } catch (e) {
      console.error(`a11ylint: ${(e as Error).message}`);
      process.exit(2);
    }
  });

cli
  .command("init", "Create an a11ylint config file with the defaults")
  .option("--force", "Overwrite an existing config")
  .action((options: { force?: boolean }) => {
    const file = resolve(CONFIG_FILE);
    if (existsSync(file) && !options.force) {
      console.error(`a11ylint: ${CONFIG_FILE} already exists (use --force to overwrite).`);
      process.exit(1);
    }
    writeFileSync(file, JSON.stringify(DEFAULT_CONFIG, null, 2) + "\n");
    console.log(`Created ${CONFIG_FILE}`);
  });

cli.help();
cli.version(pkg.version);
cli.parse();
