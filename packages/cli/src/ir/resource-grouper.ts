/**
 * Groups parsed endpoints into Resource objects by tag or path prefix.
 * @module
 */
import { slugify } from "@/lib/utils.js";
import type { ParsedBodyField, ParsedEndpoint } from "@/parser/index.js";
import { nameAction } from "./action-namer.js";
import type { Action, Param, Resource, ResponseDef } from "./types.js";

const toKebab = (s: string) => s.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

/**
 * Strip controller segments and resource name from an action name.
 * @example slugifyAction("research-controller-create-research", "research") => "create"
 */
function slugifyAction(raw: string, resource: string): string {
  let n = toKebab(raw).replace(/-?controller-?/g, "-").replace(/^-|-$/g, "");
  if (n.startsWith(`${resource}-`)) n = n.slice(resource.length + 1);
  if (n.endsWith(`-${resource}`)) n = n.slice(0, -(resource.length + 1));
  return n || raw;
}

/**
 * Group parsed endpoints into resources by their first tag or path prefix.
 * @param endpoints - Parsed endpoints from the spec
 */
export function groupEndpoints(endpoints: ParsedEndpoint[]): Resource[] {
  const groups = new Map<string, ParsedEndpoint[]>();
  for (const ep of endpoints) {
    const key = ep.tags[0] ?? (ep.path.split("/").filter(Boolean)[0]?.replace(/[{}]/g, "") ?? "default");
    const list = groups.get(key) ?? [];
    list.push(ep);
    groups.set(key, list);
  }
  const resources: Resource[] = [];
  for (const [name, eps] of groups) {
    const resSlug = slugify(name);
    const actions: Action[] = eps.map((ep) => ({
      name: slugifyAction(nameAction(ep.method, ep.path, ep.operationId), resSlug),
      operationId: ep.operationId,
      description: ep.summary,
      method: ep.method as Action["method"],
      path: ep.path,
      params: [...ep.parameters.map(mapToParam), ...(ep.body?.properties ?? []).map(mapToBodyParam)],
      body: ep.body ? { contentType: ep.body.contentType, schemaRef: "", required: ep.body.required } : undefined,
      responses: ep.responses.map(mapToResponse),
      tags: ep.tags,
    }));
    const desc = eps.map((e) => e.summary).filter(Boolean).join(", ") || undefined;
    resources.push({ name: resSlug, displayName: name, description: desc,
      basePath: findCommonBase(eps.map((e) => e.path)), actions });
  }
  return resources;
}

/** Find the common base path shared by all paths */
function findCommonBase(paths: string[]): string {
  const first = paths[0];
  if (!first) return "/";
  const parts = first.split("/");
  let i = 0;
  while (i < parts.length && paths.every((p) => p.split("/")[i] === parts[i])) i++;
  return parts.slice(0, i).join("/") || "/";
}

/** Convert a parsed parameter to an IR Param */
function mapToParam(p: { name: string; in: string; required: boolean; type?: string; description?: string }): Param {
  return { name: p.name, cliName: toKebab(p.name), location: p.in as Param["location"],
    type: (p.type ?? "string") as Param["type"], required: p.required, description: p.description };
}

/** Convert a body schema field to an IR Param with location "body" */
function mapToBodyParam(f: ParsedBodyField): Param {
  return { name: f.name, cliName: toKebab(f.name), location: "body",
    type: (f.type ?? "string") as Param["type"], required: f.required, description: f.description };
}

/** Convert a parsed response to an IR ResponseDef */
function mapToResponse(r: { status: string; description: string }): ResponseDef {
  return { status: Number.parseInt(r.status, 10), description: r.description };
}
