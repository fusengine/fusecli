/**
 * Template: emits credential module for generated standalone CLIs.
 * Token CRUD in ~/.config/tokens/<app>-cli.txt, chmod 600.
 */

import type { IR } from "@/ir/types.js";

/** Produce the credential module source for a generated CLI. */
export function emitAuthTemplate(ir: IR): string {
  const hdr = credHeaderLine(ir.auth.type);
  const L: string[] = [];
  L.push(
    'import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, chmodSync } from "node:fs";',
  );
  L.push('import { dirname } from "node:path";');
  L.push('import { TOKEN_PATH, AUTH_HEADER, APP_CLI } from "./config.js";');
  L.push('import { AppError } from "./errors.js";');
  L.push("");
  L.push("export const credentialSaved = (): boolean => existsSync(TOKEN_PATH);");
  L.push("");
  L.push("export const readCredential = (): string => {");
  L.push(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: intentional — generates template literal in output code
    "  if (!credentialSaved()) throw new AppError(2, 'No credential.', `Run: ${APP_CLI} auth set <token>`);",
  );
  L.push('  return readFileSync(TOKEN_PATH, "utf-8").trim();');
  L.push("};");
  L.push("");
  L.push("export const writeCredential = (t: string): void => {");
  L.push("  mkdirSync(dirname(TOKEN_PATH), { recursive: true });");
  L.push("  writeFileSync(TOKEN_PATH, t.trim(), { mode: 0o600 });");
  L.push("  chmodSync(TOKEN_PATH, 0o600);");
  L.push("};");
  L.push("");
  L.push(
    "export const deleteCredential = (): void => { if (credentialSaved()) unlinkSync(TOKEN_PATH); };",
  );
  L.push("");
  L.push("export const credentialHeaders = (): Record<string, string> => {");
  L.push("  const tk = readCredential();");
  L.push(`  ${hdr}`);
  L.push("};");
  L.push("");
  L.push("export const redactCredential = (t: string): string =>");
  // biome-ignore lint/suspicious/noTemplateCurlyInString: intentional — generates template literal in output code
  L.push('  t.length <= 8 ? "****" : `${t.slice(0, 4)}...${t.slice(-4)}`;');
  return L.join("\n");
}

/** Render the return line for the auth header builder. */
function credHeaderLine(authType: string): string {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: intentional — generates template literal in output code
  if (authType === "bearer") return "return { [AUTH_HEADER]: `Bearer ${tk}` };";
  if (authType === "basic")
    // biome-ignore lint/suspicious/noTemplateCurlyInString: intentional — generates template literal in output code
    return 'return { Authorization: `Basic ${Buffer.from(tk).toString("base64")}` };';
  return "return { [AUTH_HEADER]: tk };";
}
