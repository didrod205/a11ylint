/** Resolve CLI paths into HTML files to analyze. */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { AnalyzeInput } from "./index.js";

const HTML_FILE = /\.(html?|xhtml)$/i;
const SKIP_DIRS = new Set(["node_modules", ".git", "coverage"]);

function walk(dir: string, out: string[]): void {
  let entries: import("node:fs").Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      walk(full, out);
    } else if (entry.isFile() && HTML_FILE.test(entry.name)) {
      out.push(full);
    }
  }
}

/** Resolve targets (files/dirs) into a sorted list of HTML file paths. */
export function discoverFiles(targets: string[]): string[] {
  const files: string[] = [];
  for (const target of targets) {
    let st: import("node:fs").Stats;
    try {
      st = statSync(target);
    } catch {
      throw new Error(`path not found: ${target}`);
    }
    if (st.isDirectory()) walk(target, files);
    else if (st.isFile()) files.push(target);
  }
  return [...new Set(files)].sort();
}

/** Read all target files into analyze inputs. */
export function loadInputs(targets: string[]): AnalyzeInput[] {
  const files = discoverFiles(targets);
  if (files.length === 0) {
    throw new Error("no HTML files (*.html, *.htm) found in the given path(s).");
  }
  return files.map((source) => ({ source, html: readFileSync(source, "utf8") }));
}
