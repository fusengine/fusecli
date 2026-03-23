/**
 * Unified spec parser entry point.
 * Detects JSON/YAML, resolves $refs, delegates to v2 or v3 parser.
 * @module
 */

import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { parseOpenApiV3 } from "./openapi-v3.js";
import { resolveRefs } from "./ref-resolver.js";
import { parseSwaggerV2 } from "./swagger-v2.js";

/** A parsed parameter from the spec */
export interface ParsedParam {
  name: string;
  in: string;
  required: boolean;
  type?: string;
  description?: string;
}

/** A single body field extracted from the requestBody schema */
export interface ParsedBodyField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

/** A parsed request body */
export interface ParsedBody {
  required: boolean;
  contentType: string;
  schemaRef?: string;
  /** Inline body properties extracted from requestBody.content.*.schema */
  properties?: ParsedBodyField[];
}

/** A parsed response */
export interface ParsedResponse {
  status: string;
  description: string;
}

/** A parsed endpoint from the spec */
export interface ParsedEndpoint {
  method: string;
  path: string;
  operationId?: string;
  summary?: string;
  tags: string[];
  parameters: ParsedParam[];
  body?: ParsedBody;
  responses: ParsedResponse[];
}

/** Metadata about the parsed spec */
export interface ParsedSpec {
  version: string;
  resolved: Record<string, unknown>;
}

/**
 * Parse an OpenAPI/Swagger spec file and extract endpoints.
 * @param input - Absolute path to the spec file
 * @returns Parsed spec metadata and endpoint list
 */
export async function parseSpec(
  input: string,
): Promise<{ parsed: ParsedSpec; endpoints: ParsedEndpoint[] }> {
  const isUrl = input.startsWith("http://") || input.startsWith("https://");
  const raw = isUrl ? await (await fetch(input)).text() : readFileSync(input, "utf-8");
  const isJson = isUrl ? input.endsWith(".json") : input.endsWith(".json");
  const spec = isJson ? JSON.parse(raw) : parseYaml(raw);
  const resolved = resolveRefs(spec);
  const version = resolved.openapi ?? resolved.swagger ?? "";

  const endpoints = String(version).startsWith("3")
    ? parseOpenApiV3(resolved)
    : parseSwaggerV2(resolved);

  return { parsed: { version: String(version), resolved }, endpoints };
}
