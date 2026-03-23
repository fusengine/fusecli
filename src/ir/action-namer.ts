/**
 * Derives human-friendly action names from HTTP method + path.
 * Used by the IR builder to name each action.
 * @module
 */

/** Pattern: path ends with a parameter placeholder like {id} */
const ITEM_PATH_RE = /\{[^}]+\}$/;

/**
 * Derive an action name from method, path, and optional operationId.
 * @param method - HTTP method (GET, POST, etc.)
 * @param path - API path (e.g., "/pets/{petId}")
 * @param operationId - Optional operationId from the spec
 * @returns A short action name like "list", "get", "create", "delete"
 */
export function nameAction(method: string, path: string, operationId?: string): string {
  const isItem = ITEM_PATH_RE.test(path);
  const m = method.toUpperCase();

  if (m === "GET") return isItem ? "get" : "list";
  if (m === "DELETE") return "delete";
  if (m === "PATCH") return "update";
  if (m === "PUT") return isItem ? "replace" : "create";
  if (m === "POST")
    return operationId ? (extractVerb(operationId) ?? slugifyOp(operationId)) : "create";

  return operationId ? slugifyOp(operationId) : m.toLowerCase();
}

/** CRUD verbs to recognise at the start of an operationId */
const CRUD_VERBS = ["create", "list", "get", "update", "delete", "patch", "replace"] as const;

/**
 * Extract a known CRUD verb from the start of an operationId.
 * e.g. "createPet" → "create", "listUsers" → "list"
 * @param op - The operationId string
 * @returns The matched verb or undefined
 */
function extractVerb(op: string): string | undefined {
  const lower = op.toLowerCase();
  return CRUD_VERBS.find((v) => lower.startsWith(v));
}

/** Convert an operationId to a simple kebab-case slug */
function slugifyOp(op: string): string {
  return op
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
