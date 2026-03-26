/**
 * Nested body reconstruction for dot-notation params in generated CLI code.
 * @module
 */

import type { Param } from "@/ir/types.js";
import { isReserved, safeName } from "./cli-reserved-words.js";

/**
 * Convert a param to its Commander opts key (camelCase from kebab flag name).
 * @param p - Parameter definition
 * @returns Valid JS identifier used by Commander in opts object
 */
export function optKey(p: Param): string {
  const flag = (p.cliName ?? p.name).replace(/\./g, "-");
  return flag.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** Check if any body params use dot-notation (nested objects). */
export function hasDots(params: Param[]): boolean {
  return params.some((p) => p.name.includes("."));
}

/**
 * Build the nested body reconstruction lines for dot-notation params.
 * @param bP - Body parameters
 * @returns Generated code string that builds the body object
 */
export function buildNestedBody(bP: Param[]): string {
  const lines: string[] = ["const body: Record<string, unknown> = {};"];
  for (const p of bP) {
    const val = isReserved(optKey(p)) ? safeName(optKey(p)) : optKey(p);
    if (p.name.includes(".")) {
      const parts = p.name.split(".");
      const root = parts[0];
      const leaf = parts.slice(1).join(".");
      lines.push(`body["${root}"] = body["${root}"] ?? {};`);
      lines.push(`(body["${root}"] as Record<string, unknown>)["${leaf}"] = ${val};`);
    } else {
      lines.push(`body["${p.name}"] = ${val};`);
    }
  }
  return lines.join(" ");
}
