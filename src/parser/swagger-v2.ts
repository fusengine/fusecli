/**
 * Swagger v2 endpoint extractor.
 * Walks paths and operations to produce ParsedEndpoint[].
 * @module
 */

import type { ParsedEndpoint, ParsedParam, ParsedResponse } from "./index.js";

/** HTTP methods to scan in each path item */
const METHODS = ["get", "post", "put", "patch", "delete"] as const;

/**
 * Parse a Swagger v2 resolved spec into endpoints.
 * @param spec - Resolved Swagger v2 spec object
 * @returns Array of parsed endpoints
 */
export function parseSwaggerV2(spec: Record<string, unknown>): ParsedEndpoint[] {
  const paths = (spec.paths ?? {}) as Record<string, Record<string, unknown>>;
  const endpoints: ParsedEndpoint[] = [];

  for (const [path, pathItem] of Object.entries(paths)) {
    const pathParams = extractParams(pathItem.parameters);

    for (const method of METHODS) {
      const op = pathItem[method] as Record<string, unknown> | undefined;
      if (!op) continue;

      const allParams = [...pathParams, ...extractV2Params(op.parameters)];
      const bodyParam = findBodyParam(op.parameters);

      endpoints.push({
        method: method.toUpperCase(),
        path,
        operationId: op.operationId as string | undefined,
        summary: op.summary as string | undefined,
        tags: (op.tags as string[]) ?? [],
        parameters: allParams.filter((p) => p.in !== "body"),
        body: bodyParam
          ? { required: Boolean(bodyParam.required), contentType: "application/json" }
          : undefined,
        responses: extractResponses(op.responses as Record<string, unknown> | undefined),
      });
    }
  }
  return endpoints;
}

/** Extract non-body parameters from a v2 parameters array */
function extractParams(params: unknown): ParsedParam[] {
  if (!Array.isArray(params)) return [];
  return params.filter((p: Record<string, unknown>) => p.in !== "body").map(toParam);
}

/** Extract all v2 parameters (including body for filtering) */
function extractV2Params(params: unknown): ParsedParam[] {
  if (!Array.isArray(params)) return [];
  return params.map(toParam);
}

/** Convert a raw v2 parameter to ParsedParam */
function toParam(p: Record<string, unknown>): ParsedParam {
  return {
    name: p.name as string,
    in: p.in as string,
    required: Boolean(p.required),
    type: (p.type as string) ?? "string",
    description: p.description as string | undefined,
  };
}

/** Find the body parameter in a v2 parameters array */
function findBodyParam(params: unknown): Record<string, unknown> | undefined {
  if (!Array.isArray(params)) return undefined;
  return params.find((p: Record<string, unknown>) => p.in === "body");
}

/** Extract responses map */
function extractResponses(responses: Record<string, unknown> | undefined): ParsedResponse[] {
  if (!responses) return [];
  return Object.entries(responses).map(([status, val]) => ({
    status,
    description: ((val as Record<string, unknown>)?.description as string) ?? "",
  }));
}
