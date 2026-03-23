/**
 * Template: emits output formatting module for generated standalone CLIs.
 * JSON envelope, text table with picocolors, CSV support.
 */

/** Emit the output module source for a generated CLI. */
export function emitOutputTemplate(): string {
  const L: string[] = [];
  L.push('import pc from "picocolors";');
  L.push('import { globalFlags } from "./config.js";');
  L.push("");
  L.push("export function render(");
  L.push("  data: unknown,");
  L.push("  opts: { json?: boolean; format?: string; noHeader?: boolean } = {},");
  L.push("): void {");
  L.push("  const fmt = opts.json ? 'json' : (opts.format ?? globalFlags.format);");
  L.push(
    '  if (fmt === "json") { console.log(JSON.stringify({ ok: true, data }, null, 2)); return; }',
  );
  L.push('  if (fmt === "csv" && Array.isArray(data)) { toCsv(data, opts.noHeader); return; }');
  L.push("  if (Array.isArray(data)) { toTable(data, opts.noHeader); return; }");
  L.push('  if (typeof data === "object" && data !== null) {');
  // biome-ignore lint/suspicious/noTemplateCurlyInString: intentional — generates template literal in output code
  L.push("    for (const [k, v] of Object.entries(data)) console.log(`${pc.bold(k)}: ${v}`);");
  L.push("    return;");
  L.push("  }");
  L.push("  console.log(data);");
  L.push("}");
  L.push("");
  L.push("function toTable(rows: Record<string, unknown>[], noH?: boolean): void {");
  L.push("  if (!rows.length) { console.log(pc.dim('(no results)')); return; }");
  L.push("  const keys = Object.keys(rows[0]);");
  L.push(
    "  const w = keys.map(k => Math.max(k.length, ...rows.map(r => String(r[k] ?? '').length)));",
  );
  L.push("  if (!noH) console.log(keys.map((k, i) => pc.bold(k.padEnd(w[i]))).join('  '));");
  L.push(
    "  for (const r of rows) console.log(keys.map((k, i) => String(r[k] ?? '').padEnd(w[i])).join('  '));",
  );
  L.push("}");
  L.push("");
  L.push("function toCsv(rows: Record<string, unknown>[], noH?: boolean): void {");
  L.push("  if (!rows.length) return;");
  L.push("  const keys = Object.keys(rows[0]);");
  L.push("  if (!noH) console.log(keys.join(','));");
  L.push('  for (const r of rows) console.log(keys.map(k => String(r[k] ?? "")).join(","));');
  L.push("}");
  return L.join("\n");
}
