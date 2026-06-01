/** Configuration loading & defaults. */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { A11ylintConfig } from "./types.js";

export const DEFAULT_CONFIG: A11ylintConfig = {
  disableCategories: [],
  disableRules: [],
  minLevel: "AA",
  minScore: 0,
  ruleSeverity: {},
  categoryWeights: {
    images: 1.2,
    forms: 1.2,
    controls: 1.2,
    structure: 1,
    aria: 1,
    language: 1,
    tables: 0.8,
    color: 0.8,
  },
};

export const CONFIG_FILENAMES = [
  "a11ylint.config.json",
  ".a11ylintrc.json",
  ".a11ylintrc",
];

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge<T>(base: T, override: Partial<T>): T {
  const out = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(override ?? {})) {
    const current = out[key];
    if (isPlainObject(value) && isPlainObject(current)) {
      out[key] = deepMerge(current, value as Record<string, unknown>);
    } else if (value !== undefined) {
      out[key] = value;
    }
  }
  return out as T;
}

export function loadConfig(explicitPath?: string, cwd = process.cwd()): A11ylintConfig {
  let file: string | undefined = explicitPath ? resolve(cwd, explicitPath) : undefined;
  if (!file) {
    for (const name of CONFIG_FILENAMES) {
      const candidate = resolve(cwd, name);
      if (existsSync(candidate)) {
        file = candidate;
        break;
      }
    }
  }
  if (!file) return DEFAULT_CONFIG;
  if (!existsSync(file)) {
    throw new Error(`config file not found: ${file}`);
  }
  let parsed: Partial<A11ylintConfig>;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8")) as Partial<A11ylintConfig>;
  } catch (e) {
    throw new Error(`invalid JSON in config ${file}: ${(e as Error).message}`);
  }
  return deepMerge(DEFAULT_CONFIG, parsed);
}
