/**
 * Template: emits config module for generated standalone CLIs.
 * Injects IR values directly into the output source string.
 */

import type { IR } from "@/ir/types.js";
import { slugify } from "@/lib/utils.js";

/**
 * Emit the config module source for a generated CLI.
 * @param ir - Intermediate representation.
 * @returns TypeScript source code string.
 */
export function emitConfigTemplate(ir: IR): string {
  const app = slugify(ir.meta.title);
  const bin = `${app}-cli`;
  return [
    'import { homedir } from "node:os";',
    'import { join } from "node:path";',
    "",
    `export const APP_NAME = "${app}";`,
    `export const APP_CLI = "${bin}";`,
    `export const BASE_URL = "${ir.meta.baseUrl}";`,
    `export const AUTH_TYPE = "${ir.auth.type}";`,
    `export const AUTH_HEADER = "${ir.auth.header}";`,
    "",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: intentional — generates template literal in output code
    "export const TOKEN_PATH = join(homedir(), " + '".config", "tokens", `${APP_NAME}-cli.txt`);',
    "",
    "export const globalFlags = {",
    "  json: false,",
    '  format: "text" as "text" | "json" | "csv" | "yaml",',
    "  verbose: false,",
    "  noColor: false,",
    "  noHeader: false,",
    "};",
  ].join("\n");
}
