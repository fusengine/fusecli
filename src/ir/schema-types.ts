/**
 * IR schema-related types.
 * Separated from core types to respect SOLID file size limits.
 */

import type { ParamType } from "@/ir/types.js";

/** Map of schema name to definition. */
export type SchemaMap = Record<string, SchemaDef>;

/** A schema definition with Zod code and TS type. */
export interface SchemaDef {
  name: string;
  zodCode: string;
  tsType: string;
  properties: PropertyDef[];
}

/** A property within a schema. */
export interface PropertyDef {
  name: string;
  type: ParamType;
  required: boolean;
  description?: string;
  default?: unknown;
  enum?: string[];
  format?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
}
