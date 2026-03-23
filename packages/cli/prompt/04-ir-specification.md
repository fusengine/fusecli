# FuseCLI API — Intermediate Representation (IR) Specification

## Overview

The IR is the **universal contract** between the parser and all plugins.
Parser produces IR. Plugins consume IR. No plugin ever touches raw OpenAPI.

## IR Types

```typescript
// ─── Root ────────────────────────────────────────

export interface IR {
  meta: ApiMeta;
  auth: AuthConfig;
  resources: Resource[];
  schemas: SchemaMap;
}

// ─── Meta ────────────────────────────────────────

export interface ApiMeta {
  title: string;           // "Typefully API"
  version: string;         // "1.0.0"
  description?: string;    // API description
  baseUrl: string;         // "https://api.typefully.com"
  docsUrl?: string;        // Link to human docs
  openapiVersion: string;  // "3.1.0"
}

// ─── Auth ────────────────────────────────────────

export type AuthType = "bearer" | "api-key" | "basic" | "oauth2" | "none";

export interface AuthConfig {
  type: AuthType;
  header: string;          // "Authorization", "X-Api-Key", etc.
  scheme?: string;         // "Bearer", "Basic"
  tokenUrl?: string;       // OAuth2 token endpoint
  scopes?: string[];       // OAuth2 scopes
}

// ─── Resource ────────────────────────────────────

export interface Resource {
  name: string;            // "drafts" (pluralized, kebab-case)
  displayName: string;     // "Drafts"
  description?: string;    // "Manage draft content"
  basePath: string;        // "/drafts"
  actions: Action[];
}

// ─── Action ──────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface Action {
  name: string;            // "list", "get", "create", "update", "delete"
  operationId?: string;    // Original OpenAPI operationId
  description?: string;    // "List all drafts with pagination"
  method: HttpMethod;
  path: string;            // "/drafts" or "/drafts/{id}"
  params: Param[];         // Path + query + header params
  body?: BodyDef;          // Request body definition
  responses: ResponseDef[];
  tags: string[];          // OpenAPI tags
}

// ─── Param ───────────────────────────────────────

export type ParamLocation = "path" | "query" | "header";

export interface Param {
  name: string;            // "id", "limit", "page"
  cliName: string;         // "--limit", "<id>" (computed)
  location: ParamLocation;
  type: ParamType;
  required: boolean;
  description?: string;
  default?: unknown;
  enum?: string[];         // Allowed values
}

export type ParamType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "array"
  | "object";

// ─── Body ────────────────────────────────────────

export interface BodyDef {
  contentType: string;     // "application/json"
  schemaRef: string;       // Reference to schemas map
  required: boolean;
}

// ─── Response ────────────────────────────────────

export interface ResponseDef {
  status: number;          // 200, 201, 400, 404, etc.
  description?: string;
  schemaRef?: string;      // Reference to schemas map
}

// ─── Schema Map ──────────────────────────────────

export type SchemaMap = Record<string, SchemaDef>;

export interface SchemaDef {
  name: string;            // "CreateDraftRequest"
  zodCode: string;         // Generated Zod v4 code string
  tsType: string;          // Generated TypeScript type string
  properties: PropertyDef[];
}

export interface PropertyDef {
  name: string;            // "content"
  type: ParamType;
  required: boolean;
  description?: string;
  default?: unknown;
  enum?: string[];
  format?: string;         // "date-time", "email", "uri", etc.
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;        // Regex pattern
}
```

## Resource Grouping Strategy

OpenAPI endpoints are grouped into resources by:

1. **Tags** (primary): If endpoint has tag "drafts" → resource "drafts"
2. **Path segments** (fallback): `/drafts/{id}` → resource "drafts"
3. **operationId prefix** (fallback): `listDrafts` → resource "drafts"

## Action Naming Convention

| HTTP Method | Path Pattern | Action Name |
|-------------|-------------|-------------|
| GET | /resources | `list` |
| GET | /resources/{id} | `get` |
| POST | /resources | `create` |
| PUT | /resources/{id} | `replace` |
| PATCH | /resources/{id} | `update` |
| DELETE | /resources/{id} | `delete` |
| POST | /resources/{id}/action | `action` (e.g., `publish`, `archive`) |
| GET | /resources/{id}/sub | `list-sub` (e.g., `list-comments`) |

## CLI Name Mapping

| OpenAPI | CLI |
|---------|-----|
| Path param `{id}` | Argument `<id>` |
| Query param `limit` | Option `--limit <n>` |
| Query param `is_active` | Option `--is-active` (kebab-case) |
| Body field `content` | Option `--content <text>` |
| Body field `tags` (array) | Option `--tags <items>` (comma-separated) |
| Boolean field `threadify` | Option `--threadify` (flag) |
| Enum field `status` | Option `--status <value>` with choices |
