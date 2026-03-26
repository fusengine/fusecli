/**
 * Groups parsed endpoints into Resource objects by tag or path prefix.
 * @module
 */

import { slugify } from "@/lib/utils.js";
import type { ParsedBodyField, ParsedEndpoint } from "@/parser/index.js";
import { nameAction } from "./action-namer.js";
import type { Action, Param, Resource, ResponseDef } from "./types.js";

/**
 * Group parsed endpoints into resources by their first tag or path prefix.
 * @param endpoints - Parsed endpoints from the spec
 * @returns Array of Resource objects with named actions
 */
export function groupEndpoints(endpoints: ParsedEndpoint[]): Resource[] {
  const groups = new Map<string, ParsedEndpoint[]>();
  for (const ep of endpoints) {
    const key = ep.tags[0] ?? extractPrefix(ep.path);
    const list = groups.get(key) ?? [];
    list.push(ep);
    groups.set(key, list);
  }
  const resources: Resource[] = [];
  for (const [name, eps] of groups) {
    const actions: Action[] = eps.map((ep) => ({
      name: nameAction(ep.method, ep.path, ep.operationId),
      operationId: ep.operationId,
      description: ep.summary,
      method: ep.method as Action["method"],
      path: ep.path,
      params: [...ep.parameters.map(toParam), ...(ep.body?.properties ?? []).map(toBodyParam)],
      body: ep.body
        ? { contentType: ep.body.contentType, schemaRef: "", required: ep.body.required }
        : undefined,
      responses: ep.responses.map(toResponse),
      tags: ep.tags,
    }));
    const slug = slugify(name);
    const desc =
      eps
        .map((e) => e.summary)
        .filter(Boolean)
        .join(", ") || undefined;
    resources.push({
      name: slug,
      displayName: name,
      description: desc,
      basePath: commonBase(eps.map((e) => e.path)),
      actions,
    });
  }
  return resources;
}

/** Extract the first meaningful path segment as a resource name */
function extractPrefix(path: string): string {
  return path.split("/").filter(Boolean)[0]?.replace(/[{}]/g, "") ?? "default";
}

/** Find the common base path */
function commonBase(paths: string[]): string {
  const first = paths[0];
  if (!first) return "/";
  const parts = first.split("/");
  let i = 0;
  while (i < parts.length && paths.every((p) => p.split("/")[i] === parts[i])) i++;
  return parts.slice(0, i).join("/") || "/";
}

/** Convert ParsedParam to IR Param */
function toParam(p: {
  name: string;
  in: string;
  required: boolean;
  type?: string;
  description?: string;
}): Param {
  return {
    name: p.name,
    cliName: p.name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
    location: p.in as Param["location"],
    type: (p.type ?? "string") as Param["type"],
    required: p.required,
    description: p.description,
  };
}

/** Convert a body schema field to an IR Param with location "body" */
function toBodyParam(f: ParsedBodyField): Param {
  return {
    name: f.name,
    cliName: f.name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
    location: "body",
    type: (f.type ?? "string") as Param["type"],
    required: f.required,
    description: f.description,
  };
}

/** Convert parsed response to IR ResponseDef */
function toResponse(r: { status: string; description: string }): ResponseDef {
  return { status: Number.parseInt(r.status, 10), description: r.description };
}
