/**
 * Generates a resource command file for a standalone CLI.
 * Single-action resources are flattened (no subcommand nesting).
 * @module
 */

import { toPascal } from "@/generators/gen-utils.js";
import type { Action, Resource } from "@/ir/types.js";
import { buildActionHandler, buildFlag, escapeStr, needsNumberCoerce } from "./cli-resource-handler.js";

/**
 * Generate a resource command file.
 * @param resource - The resource definition from IR.
 * @param _appName - The slugified app name (unused, kept for interface compat).
 * @returns TypeScript source code string.
 */
export function generateResourceFile(resource: Resource, _appName: string): string {
  const fnName = `register${toPascal(resource.name)}Commands`;
  const isSingle = resource.actions.length === 1;
  const lines: string[] = [
    `import type { Command } from "commander";`,
    `import { apiCall } from "../lib/client.js";`,
    `import { render } from "../lib/output.js";`,
    `import { catchError } from "../lib/errors.js";`,
    "",
    `/** Register ${resource.displayName ?? resource.name} commands. */`,
    `export function ${fnName}(program: Command): void {`,
    `  const cmd = program.command("${resource.name}")`,
    `    .description("${escapeStr(resource.description ?? `Manage ${resource.name}`)}");`,
    "",
  ];
  if (isSingle && resource.actions[0]) {
    lines.push(buildFlatAction(resource.actions[0]));
  } else {
    for (const action of resource.actions) {
      lines.push(buildSubAction(action));
    }
  }
  lines.push("}");
  return lines.join("\n");
}

/**
 * Generate a flat action — options directly on cmd, no subcommand nesting.
 * Used when the resource has exactly one action.
 * @param action - The single action to flatten.
 * @returns Code lines as a string.
 */
function buildFlatAction(action: Action): string {
  const pathP = action.params.filter((p) => p.location === "path");
  const optP = action.params.filter((p) => p.location !== "path");
  const args = pathP.map((p) => `<${p.name}>`).join(" ");
  const lines = args
    ? [`  cmd.argument("${args}", "${escapeStr(action.description ?? action.name)}")`]
    : [`  cmd`];
  for (const p of optP) {
    lines.push(`    .option("${buildFlag(p)}", "${escapeStr(p.description ?? p.name)}"${needsNumberCoerce(p) ? ", Number" : ""})`);
  }
  lines.push(...buildActionHandler(action, pathP, optP));
  return lines.join("\n");
}

/**
 * Generate a subcommand action block.
 * Used when the resource has multiple actions.
 * @param action - The action to generate a subcommand for.
 * @returns Code lines as a string.
 */
function buildSubAction(action: Action): string {
  const pathP = action.params.filter((p) => p.location === "path");
  const optP = action.params.filter((p) => p.location !== "path");
  const args = pathP.map((p) => `<${p.name}>`).join(" ");
  const cmdStr = args ? `"${action.name} ${args}"` : `"${action.name}"`;
  const desc = escapeStr(action.description ?? `${action.method} ${action.path}`);
  const lines = [`  cmd.command(${cmdStr})`, `    .description("${desc}")`];
  for (const p of optP) {
    lines.push(`    .option("${buildFlag(p)}", "${escapeStr(p.description ?? p.name)}"${needsNumberCoerce(p) ? ", Number" : ""})`);
  }
  lines.push(...buildActionHandler(action, pathP, optP));
  return lines.join("\n");
}
