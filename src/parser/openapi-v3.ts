/**
 * OpenAPI v3 endpoint extractor.
 * Walks paths and operations to produce ParsedEndpoint[].
 * @module
 */

import type { ParsedBody, ParsedEndpoint, ParsedParam, ParsedResponse } from "./index.js";
import { extractSchemaProperties } from "./schema-extractor.js";

/** HTTP methods to scan in each path item */
const METHODS = ["get", "post", "put", "patch", "delete"] as const;

/**
 * Parse an OpenAPI v3 resolved spec into endpoints.
 * @param spec - Resolved OpenAPI v3 spec object
 * @returns Array of parsed endpoints
 */
export function parseOpenApiV3(spec: Record<string, unknown>): ParsedEndpoint[] {
  const paths = (spec.paths ?? {}) as Record<string, Record<string, unknown>>;
  const endpoints: ParsedEndpoint[] = [];

  for (const [path, pathItem] of Object.entries(paths)) {
    const pathParams = extractParams(pathItem.parameters);

    for (const method of METHODS) {
      const op = pathItem[method] as Record<string, unknown> | undefined;
      if (!op) continue;

      endpoints.push({
        method: method.toUpperCase(),
        path,
        operationId: op.operationId as string | undefined,
        summary: op.summary as string | undefined,
        tags: (op.tags as string[]) ?? [],
        parameters: [...pathParams, ...extractParams(op.parameters)],
        body: extractBody(op.requestBody as Record<string, unknown> | undefined),
        responses: extractResponses(op.responses as Record<string, unknown> | undefined),
      });
    }
  }
  return endpoints;
}

/** Extract parameters from a parameters array */
function extractParams(params: unknown): ParsedParam[] {
  if (!Array.isArray(params)) return [];
  return params.map((p: Record<string, unknown>) => ({
    name: p.name as string,
    in: p.in as string,
    required: Boolean(p.required),
    type: ((p.schema as Record<string, unknown>)?.type as string) ?? "string",
    description: p.description as string | undefined,
  }));
}

/**
 * Extract request body from v3 requestBody, including inline schema properties.
 * Supports direct properties and allOf composition.
 * @param reqBody - The raw requestBody object from the spec
 * @returns ParsedBody or undefined
 */
function extractBody(reqBody: Record<string, unknown> | undefined): ParsedBody | undefined {
  if (!reqBody) return undefined;
  const content = reqBody.content as Record<string, unknown> | undefined;
  if (!content) return undefined;
  const ct = Object.keys(content)[0] ?? "application/json";
  const mediaObj = content[ct] as Record<string, unknown> | undefined;
  const schema = mediaObj?.schema as Record<string, unknown> | undefined;
  const properties = extractSchemaProperties(schema);
  return { required: Boolean(reqBody.required), contentType: ct, properties };
}

/** Extract responses map */
function extractResponses(responses: Record<string, unknown> | undefined): ParsedResponse[] {
  if (!responses) return [];
  return Object.entries(responses).map(([status, val]) => ({
    status,
    description: ((val as Record<string, unknown>)?.description as string) ?? "",
  }));
}
