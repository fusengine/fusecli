/**
 * Basic local $ref resolver for OpenAPI/Swagger specs.
 * Resolves JSON Pointer references (e.g., "#/components/schemas/Pet").
 */

/**
 * Resolve all local $ref pointers in a parsed spec object.
 * @param spec - The parsed OpenAPI/Swagger spec object
 * @returns The spec with all local $refs resolved inline
 */
export function resolveRefs<T extends Record<string, unknown>>(spec: T): T {
  return walk(spec, spec, new Set<string>()) as T;
}

/** Recursively walk the object and replace $ref nodes */
function walk(node: unknown, root: Record<string, unknown>, visiting: Set<string>): unknown {
  if (node === null || node === undefined || typeof node !== "object") return node;
  if (Array.isArray(node)) return node.map((item) => walk(item, root, visiting));
  const obj = node as Record<string, unknown>;
  if (typeof obj.$ref === "string" && obj.$ref.startsWith("#/")) {
    if (visiting.has(obj.$ref)) return { $circular: obj.$ref };
    visiting.add(obj.$ref);
    const segments = obj.$ref.substring(2).split("/");
    let target: unknown = root;
    for (const seg of segments) target = (target as Record<string, unknown>)?.[seg];
    const resolved = target !== undefined ? walk(target, root, visiting) : obj;
    visiting.delete(obj.$ref);
    return resolved;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) result[key] = walk(value, root, visiting);
  return result;
}
