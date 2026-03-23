/**
 * Builds a complete IR from a parsed spec and its endpoints.
 * Orchestrates resource grouping, action naming, and metadata extraction.
 * @module
 */

import type { ParsedEndpoint, ParsedSpec } from "@/parser/index.js";
import { groupEndpoints } from "./resource-grouper.js";
import type { PropertyDef, SchemaMap } from "./schema-types.js";
import type { ApiMeta, AuthConfig, IR } from "./types.js";

/**
 * Build a complete IR from parsed spec metadata and endpoints.
 * @param parsed - Parsed spec metadata (version, resolved spec)
 * @param endpoints - Parsed endpoints from the spec
 * @returns Complete IR structure
 */
export function buildIR(parsed: ParsedSpec, endpoints: ParsedEndpoint[]): IR {
  const spec = parsed.resolved;
  return {
    meta: extractMeta(spec, parsed.version),
    auth: extractAuth(spec),
    resources: groupEndpoints(endpoints),
    schemas: extractSchemas(spec),
  };
}

/** Extract API metadata from the resolved spec */
function extractMeta(spec: Record<string, unknown>, version: string): ApiMeta {
  const info = (spec.info ?? {}) as Record<string, unknown>;
  const servers = spec.servers as Array<Record<string, unknown>> | undefined;
  const host = spec.host as string | undefined;
  const basePath = spec.basePath as string | undefined;
  const schemes = spec.schemes as string[] | undefined;

  let baseUrl = "";
  if (servers?.[0]?.url) {
    baseUrl = servers[0].url as string;
  } else if (host) {
    const scheme = schemes?.[0] ?? "https";
    baseUrl = `${scheme}://${host}${basePath ?? ""}`;
  }

  return {
    title: (info.title as string) ?? "",
    version: (info.version as string) ?? "",
    description: info.description as string | undefined,
    baseUrl,
    openapiVersion: version,
  };
}

/** Extract auth configuration from the resolved spec */
function extractAuth(spec: Record<string, unknown>): AuthConfig {
  const schemes =
    (spec.components as Record<string, unknown>)?.securitySchemes ?? spec.securityDefinitions;
  if (!schemes || typeof schemes !== "object") return { type: "none", header: "" };

  const first = Object.values(schemes as Record<string, Record<string, unknown>>)[0];
  if (!first) return { type: "none", header: "" };

  if (first.scheme === "bearer" || first.type === "http") {
    return { type: "bearer", header: "Authorization", scheme: "bearer" };
  }
  if (first.type === "apiKey") {
    return { type: "api-key", header: (first.name as string) ?? "X-API-Key" };
  }
  if (first.type === "oauth2") {
    const flows = first.flows as Record<string, Record<string, string>> | undefined;
    const flow = flows?.authorizationCode ?? flows?.clientCredentials ?? flows?.implicit;
    return { type: "oauth2", header: "Authorization", tokenUrl: flow?.tokenUrl, authorizationUrl: flow?.authorizationUrl };
  }
  return { type: "none", header: "" };
}

/** Extract schemas from components/schemas or definitions */
function extractSchemas(spec: Record<string, unknown>): SchemaMap {
  const defs = (spec.components as Record<string, unknown>)?.schemas ?? spec.definitions;
  if (!defs || typeof defs !== "object") return {};

  const map: SchemaMap = {};
  for (const [name, def] of Object.entries(defs as Record<string, Record<string, unknown>>)) {
    const props = (def.properties ?? {}) as Record<string, Record<string, unknown>>;
    const required = (def.required ?? []) as string[];
    const properties: PropertyDef[] = Object.entries(props).map(([pName, pDef]) => ({
      name: pName,
      type: (pDef.type as PropertyDef["type"]) ?? "string",
      required: required.includes(pName),
      enum: pDef.enum as string[] | undefined,
      format: pDef.format as string | undefined,
    }));
    map[name] = { name, zodCode: "", tsType: "", properties };
  }
  return map;
}
