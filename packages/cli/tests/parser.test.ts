/**
 * Tests for the unified spec parser.
 * Validates OpenAPI v3 (YAML) and Swagger v2 (JSON) parsing.
 * @module
 */

import { describe, expect, it } from "bun:test";
import { resolve } from "node:path";
import { parseSpec } from "@/parser/index.js";

const FIXTURES = resolve(import.meta.dir, "../fixtures");

describe("parseSpec", () => {
  it("parses OpenAPI v3 YAML and returns parsed metadata", async () => {
    const { parsed, endpoints } = await parseSpec(`${FIXTURES}/petstore-v3.yaml`);
    expect(parsed.version).toBe("3.0.3");
    expect(parsed.resolved).toBeDefined();
    expect(endpoints.length).toBeGreaterThan(0);
  });

  it("parses Swagger v2 JSON and returns parsed metadata", async () => {
    const { parsed, endpoints } = await parseSpec(`${FIXTURES}/petstore-v2.json`);
    expect(parsed.version).toBe("2.0");
    expect(parsed.resolved).toBeDefined();
    expect(endpoints.length).toBeGreaterThan(0);
  });

  it("extracts correct number of endpoints from v3 spec", async () => {
    const { endpoints } = await parseSpec(`${FIXTURES}/petstore-v3.yaml`);
    expect(endpoints.length).toBeGreaterThanOrEqual(2);
  });

  it("extracts path parameters correctly from endpoints", async () => {
    const { endpoints } = await parseSpec(`${FIXTURES}/petstore-v3.yaml`);
    const getEp = endpoints.find((e) => e.method === "GET" && e.path.includes("{"));
    expect(getEp).toBeDefined();
    const pathParam = getEp?.parameters.find((p) => p.in === "path");
    expect(pathParam).toBeDefined();
    expect(pathParam?.required).toBe(true);
  });

  it("extracts tags from endpoints", async () => {
    const { endpoints } = await parseSpec(`${FIXTURES}/petstore-v3.yaml`);
    const tagged = endpoints.filter((ep) => ep.tags.length > 0);
    expect(tagged.length).toBeGreaterThan(0);
  });

  it("throws on invalid spec input", async () => {
    expect(parseSpec("/nonexistent/file.yaml")).rejects.toThrow();
  });

  it("parses v2 endpoints with correct methods", async () => {
    const { endpoints } = await parseSpec(`${FIXTURES}/petstore-v2.json`);
    const methods = endpoints.map((e) => e.method);
    expect(methods.some((m) => m === "GET")).toBe(true);
  });
});
