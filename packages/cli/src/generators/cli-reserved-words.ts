/**
 * Reserved JavaScript keywords and safe-name helper.
 * Extracted from cli-resource-handler.ts for SOLID compliance (< 100 lines).
 * @module
 */

const RESERVED = new Set([
  "break",
  "case",
  "catch",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "finally",
  "for",
  "function",
  "if",
  "in",
  "instanceof",
  "new",
  "return",
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "class",
  "const",
  "enum",
  "export",
  "extends",
  "import",
  "super",
  "implements",
  "interface",
  "let",
  "package",
  "private",
  "protected",
  "public",
  "static",
  "yield",
  "await",
  "async",
]);

/**
 * Check if a name is a reserved JavaScript keyword.
 * @param name - Identifier to check
 * @returns True if the name is reserved
 */
export function isReserved(name: string): boolean {
  return RESERVED.has(name);
}

/**
 * Prefix reserved JS words to make them valid identifiers.
 * @param name - Identifier to make safe
 * @returns Safe identifier (prefixed with _ if reserved)
 */
export function safeName(name: string): string {
  return RESERVED.has(name) ? `_${name}` : name;
}
