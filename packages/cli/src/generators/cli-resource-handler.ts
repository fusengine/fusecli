/**
 * Shared action handler builder for CLI resource generators.
 * @module
 */

import type { Param } from "@/ir/types.js";
import { isReserved, safeName } from "./cli-reserved-words.js";

/**
 * Escape a string for safe embedding in a double-quoted TypeScript string literal.
 * @param s - Raw string value
 * @returns Escaped string safe for use inside double quotes
 */
export function escapeStr(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "");
}

/**
 * Generate the .action() handler lines shared by flat and sub actions.
 * @param action - Partial action with method, path.
 * @param pathP - Path parameters.
 * @param optP - Non-path parameters (query + body).
 * @returns Array of code lines.
 */
export function buildActionHandler(
  action: { method: string; path: string },
  pathP: Param[],
  optP: Param[],
): string[] {
  const pNames = pathP.map((p) => p.name).join(", ");
  // biome-ignore lint/suspicious/noTemplateCurlyInString: intentional — generates template literal in output code
  const urlPath = action.path.replace(/\{(\w+)\}/g, "${$1}");
  const qP = optP.filter((p) => p.location === "query");
  const bP = optP.filter((p) => p.location === "body");
  const callParts = [`method: "${action.method}"`, `path: \`${urlPath}\``];
  if (bP.length)
    callParts.push(
      `body: { ${bP.map((p) => (isReserved(p.name) ? `${p.name}: ${safeName(p.name)}` : p.name)).join(", ")} }`,
    );
  if (qP.length) callParts.push(`query: { ${qP.map((p) => p.name).join(", ")} }`);
  const call = `{ ${callParts.join(", ")} }`;
  const params = pNames ? `${pNames}, opts` : "opts";
  const renames = [...bP, ...qP]
    .filter((p) => isReserved(p.name))
    .map((p) => `${p.name}: ${safeName(p.name)}`);
  const normals = [...bP, ...qP].filter((p) => !isReserved(p.name)).map((p) => p.name);
  const destructLine = [...normals, ...renames].length
    ? `const { ${[...normals, ...renames].join(", ")} } = opts; `
    : "";
  return [
    `    .action(async (${params}) => {`,
    `      try { ${destructLine}const d = await apiCall(${call}); render(d, program.opts()); }`,
    `      catch (e) { catchError(e); }`,
    `    });`,
  ];
}

/**
 * Build CLI flag string for a param using cliName (kebab-case).
 * @param p - The parameter definition.
 * @returns Flag string for Commander .option().
 */
export function buildFlag(p: Param): string {
  const key = p.cliName ?? p.name;
  return p.required ? `--${key} <${key}>` : `--${key} [${key}]`;
}

/** Check if a param needs numeric coercion (integer or number type). */
export function needsNumberCoerce(p: Param): boolean {
  return p.type === "integer" || p.type === "number";
}

/**
 * Build the coercion argument for a Commander .option() call.
 * Returns the trailing argument string (e.g. `, Number`) or empty string if none needed.
 * @param p - The parameter definition.
 * @returns Coercion argument string fragment for Commander .option().
 */
export function buildCoercionArg(p: Param): string {
  if (p.type === "integer" || p.type === "number") return ", Number";
  if (p.type === "array")
    return ', (v: string) => v.split(",").map((s: string) => s.trim()).filter(Boolean)';
  if (p.type === "object") return ", (v: string) => JSON.parse(v)";
  return "";
}
