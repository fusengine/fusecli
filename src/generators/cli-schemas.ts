/**
 * Generates Zod schema files for a resource.
 * Each resource with schemas gets its own schema file.
 */

import { toPascal } from "@/generators/gen-utils.js";
import type { Resource, SchemaMap } from "@/ir/types.js";

/**
 * Generate a schema file for a resource.
 * @param resource - The resource definition.
 * @param schemas - Relevant schemas for this resource.
 * @returns TypeScript source code with Zod schemas.
 */
export function generateSchemaFile(resource: Resource, schemas: SchemaMap): string {
  const lines: string[] = [`import { z } from "zod";`, ""];

  for (const [name, schema] of Object.entries(schemas)) {
    if (schema.zodCode) {
      lines.push(`/** Schema for ${name}. */`);
      lines.push(schema.zodCode);
      lines.push("");
    }
  }

  if (lines.length <= 2) {
    lines.push(`/** No schemas defined for ${resource.name}. */`);
    lines.push(`export const ${toPascal(resource.name)}Schema = z.object({});`);
  }

  return lines.join("\n");
}
