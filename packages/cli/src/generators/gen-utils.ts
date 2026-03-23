/**
 * Shared utilities for generator modules.
 * Single source of truth for string transforms used across generators.
 */

/**
 * Convert a kebab-case or plain string to PascalCase.
 * @param input - The string to convert (e.g. "my-resource").
 * @returns PascalCase string (e.g. "MyResource").
 */
export function toPascal(input: string): string {
  return input
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}
