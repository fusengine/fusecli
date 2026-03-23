/**
 * Shared schema property extractor for OpenAPI v2/v3 parsers.
 * Handles direct properties and allOf composition.
 * @module
 */

import type { ParsedBodyField } from "./index.js";

/**
 * Extract body fields from a JSON schema, handling direct properties and allOf.
 * @param schema - The JSON schema object (may contain properties or allOf)
 * @returns Array of parsed body fields, or undefined if no properties found
 */
export function extractSchemaProperties(
  schema: Record<string, unknown> | undefined,
): ParsedBodyField[] | undefined {
  if (!schema) return undefined;
  const allOf = schema.allOf as Record<string, unknown>[] | undefined;
  if (allOf) {
    const merged = allOf.flatMap((s) => extractSchemaProperties(s) ?? []);
    return merged.length > 0 ? merged : undefined;
  }
  const props = schema.properties as Record<string, Record<string, unknown>> | undefined;
  if (!props) return undefined;
  const requiredFields = (schema.required ?? []) as string[];
  return Object.entries(props).map(([name, def]) => ({
    name,
    type: (def.type as string) ?? "string",
    required: requiredFields.includes(name),
    description: def.description as string | undefined,
  }));
}
