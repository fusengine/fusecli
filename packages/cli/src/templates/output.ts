/**
 * Template: emits output formatting module for generated standalone CLIs.
 * JSON envelope, text table with picocolors, CSV support.
 */

/** Emit table and CSV source lines (used by emitOutputTemplate). */
function emitTableLines(): string[] {
  const n1 = "        if (Array.isArray(nv)) { for (const item of nv) console.log(pc.dim('  > ' + flat(item))); }";
  const n2 = "        else if (nv != null) console.log(pc.dim('  > ' + pc.bold(nk) + ': ' + flat(nv)));";
  return [
    "function toTable(rows: Record<string, unknown>[], noH?: boolean, verbose?: boolean): void {",
    "  if (!rows.length) { console.log(pc.dim('(no results)')); return; }",
    "  const allKeys = Object.keys(rows[0]!);",
    "  const scalarKeys = allKeys.filter(k => typeof rows[0]![k] !== 'object' || rows[0]![k] == null);",
    "  const nestedKeys = allKeys.filter(k => typeof rows[0]![k] === 'object' && rows[0]![k] != null);",
    "  const w = scalarKeys.map(k => Math.max(k.length, ...rows.map(r => flat(r[k]).slice(0, 60).length)));",
    "  if (!noH) console.log(scalarKeys.map((k, i) => pc.bold(k.padEnd(w[i]))).join('  '));",
    "  for (const r of rows) {",
    "    console.log(scalarKeys.map((k, i) => flat(r[k]).slice(0, 60).padEnd(w[i])).join('  '));",
    "    if (verbose && nestedKeys.length) {",
    "      for (const nk of nestedKeys) {",
    "        const nv = r[nk];",
    n1,
    n2,
    "      }",
    "    }",
    "  }",
    "}",
    "",
    "function toCsv(rows: Record<string, unknown>[], noH?: boolean): void {",
    "  if (!rows.length) return;",
    "  const keys = Object.keys(rows[0]!);",
    "  if (!noH) console.log(keys.join(','));",
    '  for (const r of rows) console.log(keys.map(k => flat(r[k])).join(","));',
    "}",
  ];
}

/** Emit the output module source for a generated CLI. */
export function emitOutputTemplate(): string {
  const L: string[] = [];
  L.push('import pc from "picocolors";', 'import { globalFlags } from "./config.js";', "");
  L.push("function flat(v: unknown): string {");
  L.push("  if (v == null) return '';");
  L.push("  if (Array.isArray(v)) return v.map(flat).join(', ');");
  L.push('  if (typeof v === "object") return JSON.stringify(v);');
  L.push("  return String(v);", "}", "");
  L.push("function unwrap(data: unknown): unknown {");
  L.push('  if (typeof data === "object" && data !== null && !Array.isArray(data)) {');
  L.push("    for (const k of ['results', 'data', 'items']) {");
  L.push("      const val = (data as Record<string, unknown>)[k];");
  L.push("      if (Array.isArray(val)) return val;");
  L.push("    }", "  }", "  return data;", "}", "");
  L.push("function printObj(obj: Record<string, unknown>, indent = 0): void {");
  L.push("  const pad = ' '.repeat(indent);");
  L.push("  for (const [k, v] of Object.entries(obj)) {");
  L.push('    if (typeof v === "object" && v !== null && !Array.isArray(v)) {');
  // biome-ignore lint/suspicious/noTemplateCurlyInString: intentional — generates template literal in output code
  L.push("      console.log(`${pad}${pc.bold(k)}:`);");
  L.push("      printObj(v as Record<string, unknown>, indent + 2);");
  L.push("    } else {");
  // biome-ignore lint/suspicious/noTemplateCurlyInString: intentional — generates template literal in output code
  L.push("      console.log(`${pad}${pc.bold(k)}: ${flat(v)}`);");
  L.push("    }", "  }", "}", "");
  L.push("export function render(", "  data: unknown,");
  L.push(
    "  opts: { json?: boolean; format?: string; noHeader?: boolean; verbose?: boolean } = {},",
  );
  L.push("): void {");
  L.push("  const fmt = opts.json ? 'json' : (opts.format ?? globalFlags.format);");
  L.push(
    '  if (fmt === "json") { console.log(JSON.stringify({ ok: true, data }, null, 2)); return; }',
  );
  L.push("  const unwrapped = unwrap(data);");
  L.push(
    '  if (fmt === "csv" && Array.isArray(unwrapped)) { toCsv(unwrapped, opts.noHeader); return; }',
  );
  L.push(
    "  if (Array.isArray(unwrapped)) { toTable(unwrapped, opts.noHeader, opts.verbose); return; }",
  );
  L.push('  if (typeof unwrapped === "object" && unwrapped !== null) {');
  L.push("    printObj(unwrapped as Record<string, unknown>);", "    return;", "  }");
  L.push("  console.log(unwrapped);", "}", "", ...emitTableLines());
  return L.join("\n");
}
