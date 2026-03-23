/**
 * Template: emits HTTP client module for generated standalone CLIs.
 * Supports REST (fetch) and MCP (JSON-RPC) based on BASE_URL.
 */

import type { IR } from "@/ir/types.js";

/** Emit the client module source for a generated CLI. */
export function generateClientCode(_ir: IR): string {
  const L: string[] = [];
  L.push('import { BASE_URL } from "./config.js";');
  L.push('import { credentialHeaders } from "./auth.js";');
  L.push('import { AppError } from "./errors.js";');
  L.push("");
  L.push("const MAX_RETRY = 3;");
  L.push("const TIMEOUT = 30_000;");
  L.push("const RETRY_ON = new Set([429, 500, 502, 503, 504]);");
  L.push("const IS_MCP = BASE_URL.endsWith('/mcp') || BASE_URL.endsWith('/mcp/');");
  L.push("let rpcId = 0;");
  L.push("");
  L.push(
    "interface ReqOpts { method: string; path: string; body?: unknown; query?: Record<string, string>; toolName?: string; }",
  );
  L.push("");
  L.push("export async function apiCall(opts: ReqOpts): Promise<unknown> {");
  L.push("  return IS_MCP ? mcpCall(opts) : restCall(opts);");
  L.push("}");
  L.push("");
  L.push("async function restCall(opts: ReqOpts): Promise<unknown> {");
  L.push("  const base = BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/';");
  L.push("  const url = new URL(opts.path.startsWith('/') ? opts.path.slice(1) : opts.path, base);");
  L.push(
    "  if (opts.query) for (const [k, v] of Object.entries(opts.query)) { if (v != null && v !== undefined) url.searchParams.set(k, String(v)); }",
  );
  L.push(
    '  const headers: Record<string, string> = { "Content-Type": "application/json", ...credentialHeaders() };',
  );
  L.push("  const init: RequestInit = { method: opts.method, headers,");
  L.push("    body: opts.body ? JSON.stringify(opts.body) : undefined, signal: AbortSignal.timeout(TIMEOUT) };");
  L.push("  for (let i = 0; i <= MAX_RETRY; i++) {");
  L.push("    const res = await fetch(url.toString(), init);");
  L.push("    if (res.ok) { const txt = await res.text(); try { return JSON.parse(txt); } catch { return txt; } }");
  L.push("    if (!RETRY_ON.has(res.status) || i === MAX_RETRY) throw new AppError(res.status, await res.text());");
  L.push("    await new Promise(r => setTimeout(r, Math.min(1000 * 2 ** i, 8000)));");
  L.push("  }");
  L.push("}");
  L.push("");
  L.push("async function mcpCall(opts: ReqOpts): Promise<unknown> {");
  L.push('  const headers: Record<string, string> = { "Content-Type": "application/json", ...credentialHeaders() };');
  L.push("  const toolName = opts.toolName ?? deriveTool(opts.method, opts.path);");
  L.push("  const args = { ...opts.body as Record<string, unknown>, ...opts.query };");
  L.push('  const body = JSON.stringify({ jsonrpc: "2.0", method: "tools/call",');
  L.push("    params: { name: toolName, arguments: args }, id: ++rpcId });");
  L.push("  const res = await fetch(BASE_URL, { method: 'POST', headers, body, signal: AbortSignal.timeout(TIMEOUT) });");
  L.push("  if (!res.ok) throw new AppError(res.status, await res.text());");
  L.push("  const txt = await res.text();");
  L.push("  try { const j = JSON.parse(txt); return j.result ?? j; } catch { return txt; }");
  L.push("}");
  L.push("");
  L.push("function deriveTool(method: string, path: string): string {");
  L.push('  const seg = path.split("/").filter(Boolean).filter(s => !s.startsWith("{"));');
  L.push('  const resource = seg[seg.length - 1] ?? "unknown";');
  L.push('  const verbs: Record<string, string> = { GET: "list", POST: "create", DELETE: "delete", PATCH: "update" };');
  L.push('  const hasId = path.includes("{");');
  L.push('  const verb = method === "GET" && hasId ? "get" : (verbs[method] ?? method.toLowerCase());');
  // biome-ignore lint/suspicious/noTemplateCurlyInString: intentional — generates template literal in output code
  L.push("  return `${verb}_${resource}`;");
  L.push("}");
  return L.join("\n");
}
