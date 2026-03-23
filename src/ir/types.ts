/**
 * Intermediate Representation — core types.
 * The universal contract between parser and all plugins.
 */

import type { SchemaMap } from "@/ir/schema-types.js";

/** Root IR structure. */
export interface IR {
  meta: ApiMeta;
  auth: AuthConfig;
  resources: Resource[];
  schemas: SchemaMap;
}

/** API metadata extracted from OpenAPI spec. */
export interface ApiMeta {
  title: string;
  version: string;
  description?: string;
  baseUrl: string;
  docsUrl?: string;
  openapiVersion: string;
}

/** Authentication configuration. */
export type AuthType = "bearer" | "api-key" | "basic" | "oauth2" | "none";

export interface AuthConfig {
  type: AuthType;
  header: string;
  scheme?: string;
  tokenUrl?: string;
  authorizationUrl?: string;
  scopes?: string[];
}

/** A resource groups related API actions. */
export interface Resource {
  name: string;
  displayName: string;
  description?: string;
  basePath: string;
  actions: Action[];
}

/** HTTP methods supported by actions. */
export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

/** A single API action (endpoint). */
export interface Action {
  name: string;
  operationId?: string;
  description?: string;
  method: HttpMethod;
  path: string;
  params: Param[];
  body?: BodyDef;
  responses: ResponseDef[];
  tags: string[];
}

/** Parameter location in the request. */
export type ParamLocation = "path" | "query" | "header" | "body";

/** Supported parameter types. */
export type ParamType = "string" | "number" | "integer" | "boolean" | "array" | "object";

/** A single parameter definition. */
export interface Param {
  name: string;
  cliName: string;
  location: ParamLocation;
  type: ParamType;
  required: boolean;
  description?: string;
  default?: unknown;
  enum?: string[];
}

/** Request body definition. */
export interface BodyDef {
  contentType: string;
  schemaRef: string;
  required: boolean;
}

/** Response definition. */
export interface ResponseDef {
  status: number;
  description?: string;
  schemaRef?: string;
}

export type { PropertyDef, SchemaDef, SchemaMap } from "@/ir/schema-types.js";
