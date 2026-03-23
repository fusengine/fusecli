/**
 * HTTP endpoint caller — builds URLs and executes fetch from IR actions.
 * @module
 */

import type { Action } from "@/ir/types.js";

/** Options for calling an endpoint */
export interface CallOptions {
  baseUrl: string;
  token?: string;
  pathParams?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: Record<string, unknown>;
  json?: boolean;
}

/**
 * Builds the full URL for an action, substituting path and query params.
 * @param baseUrl - API base URL
 * @param action - IR action definition
 * @param opts - Path and query parameters
 * @returns Fully resolved URL string
 */
export function buildEndpointUrl(
  baseUrl: string,
  action: Action,
  opts: { pathParams?: Record<string, string>; queryParams?: Record<string, string> },
): string {
  let url = `${baseUrl}${action.path}`;
  for (const [key, value] of Object.entries(opts.pathParams || {})) {
    url = url.replace(`{${key}}`, encodeURIComponent(value));
  }
  const qs = new URLSearchParams(opts.queryParams || {}).toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Calls an API endpoint based on an IR action definition.
 * @param action - IR action to execute
 * @param opts - Call options including baseUrl, token, params
 * @returns Parsed JSON response
 */
export async function callEndpoint(
  action: Action,
  opts: CallOptions,
): Promise<{ status: number; data: unknown }> {
  const url = buildEndpointUrl(opts.baseUrl, action, {
    pathParams: opts.pathParams,
    queryParams: opts.queryParams,
  });

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.token) {
    headers.Authorization = `Bearer ${opts.token}`;
  }

  const response = await fetch(url, {
    method: action.method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const data = response.headers.get("content-type")?.includes("json")
    ? await response.json()
    : await response.text();

  return { status: response.status, data };
}
