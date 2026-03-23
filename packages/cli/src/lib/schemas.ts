/**
 * Zod schema code generation from IR PropertyDef[].
 * Merges primitives mapping, type-mapper, and generator into one file.
 * @module
 */

import type { PropertyDef } from "@/ir/schema-types.js";

/**
 * Map a primitive type (+ optional format) to a Zod type string.
 * @param type - The property type (string, integer, number, boolean, etc.)
 * @param format - Optional format hint (email, uuid, date-time, etc.)
 * @returns Zod type expression string
 */
export function mapPrimitiveToZod(type: string, format?: string): string {
  if (type === "integer") return "z.number().int()";
  if (type === "number") return "z.number()";
  if (type === "boolean") return "z.boolean()";
  if (type === "array") return "z.array(z.unknown())";
  if (type === "object") return "z.record(z.unknown())";

  if (type === "string") {
    if (format === "email") return "z.string().email()";
    if (format === "uuid") return "z.string().uuid()";
    if (format === "uri" || format === "url") return "z.string().url()";
    if (format === "date-time") return "z.string().datetime()";
    if (format === "date") return "z.string().date()";
    return "z.string()";
  }
  return "z.unknown()";
}

/**
 * Generate a Zod schema declaration from a name and property definitions.
 * @param name - Schema name (e.g., "Pet")
 * @param properties - Array of property definitions
 * @returns Zod schema code string (e.g., "export const PetSchema = z.object({...})")
 */
export function generateZodSchema(name: string, properties: PropertyDef[]): string {
  if (properties.length === 0) {
    return `export const ${name}Schema = z.object({});`;
  }

  const fields = properties.map((p) => {
    let zodType = buildFieldType(p);
    zodType = applyConstraints(zodType, p);
    if (!p.required) zodType += ".optional()";
    return `  ${p.name}: ${zodType}`;
  });

  return `export const ${name}Schema = z.object({\n${fields.join(",\n")},\n});`;
}

/** Build the base Zod type for a field, handling enums */
function buildFieldType(p: PropertyDef): string {
  if (p.enum && p.enum.length > 0) {
    const vals = p.enum.map((v) => `"${v}"`).join(", ");
    return `z.enum([${vals}])`;
  }
  return mapPrimitiveToZod(p.type, p.format);
}

/** Apply min/max/pattern constraints to a Zod type string */
function applyConstraints(zodType: string, p: PropertyDef): string {
  let result = zodType;
  if (p.minLength !== undefined) result += `.min(${p.minLength})`;
  if (p.maxLength !== undefined) result += `.max(${p.maxLength})`;
  if (p.minimum !== undefined) result += `.min(${p.minimum})`;
  if (p.maximum !== undefined) result += `.max(${p.maximum})`;
  return result;
}
