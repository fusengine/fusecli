/**
 * Template: emits error handling module for generated standalone CLIs.
 * Contains exit codes, typed error, and catch handler.
 */

/** Emit the errors module source for a generated CLI. */
export function emitErrorsTemplate(): string {
  const L: string[] = [];
  L.push('import pc from "picocolors";');
  L.push("");
  L.push("export const EXIT = { OK: 0, API: 1, USAGE: 2, AUTH: 3, NET: 4, PARSE: 5 } as const;");
  L.push("");
  L.push("export class AppError extends Error {");
  L.push(
    "  constructor(public readonly code: number, msg: string, public readonly hint?: string) {",
  );
  L.push('    super(msg); this.name = "AppError";');
  L.push("  }");
  L.push("  toJSON() {");
  L.push("    return { ok: false, error: { code: this.code, message: this.message,");
  L.push("      ...(this.hint && { suggestion: this.hint }) } };");
  L.push("  }");
  L.push("}");
  L.push("");
  L.push("export function catchError(err: unknown, json = false): never {");
  L.push("  if (err instanceof AppError) {");
  L.push("    if (json) console.error(JSON.stringify(err.toJSON(), null, 2));");
  L.push("    else {");
  // biome-ignore lint/suspicious/noTemplateCurlyInString: intentional — generates template literal in output code
  L.push("      console.error(`${pc.red('Error')} ${err.code}: ${err.message}`);");
  L.push("      if (err.hint) console.error(pc.dim(err.hint));");
  L.push("    }");
  L.push("    process.exit(err.code >= 400 ? EXIT.API : EXIT.USAGE);");
  L.push("  }");
  L.push("  const msg = err instanceof Error ? err.message : 'Unknown error';");
  // biome-ignore lint/suspicious/noTemplateCurlyInString: intentional — generates template literal in output code
  L.push("  console.error(`${pc.red('Error')}: ${msg}`);");
  L.push("  process.exit(EXIT.API);");
  L.push("}");
  return L.join("\n");
}
