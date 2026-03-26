/**
 * Tests for IR builder, validator, action-namer, and resource-grouper.
 * @module
 */

import { describe, expect, it } from "bun:test";
import { resolve } from "node:path";
import { nameAction } from "@/ir/action-namer.js";
import { buildIR } from "@/ir/builder.js";
import { groupEndpoints } from "@/ir/resource-grouper.js";
import type { IR } from "@/ir/types.js";
import { validateIR } from "@/ir/validator.js";
import { parseSpec } from "@/parser/index.js";

const FIXTURES = resolve(import.meta.dir, "../fixtures");

async function loadIR(): Promise<IR> {
  const { parsed, endpoints } = await parseSpec(`${FIXTURES}/petstore-v3.yaml`);
  return buildIR(parsed, endpoints);
}

describe("buildIR", () => {
  it("builds IR with correct meta from Petstore", async () => {
    const ir = await loadIR();
    expect(ir.meta.title).toBe("Petstore");
    expect(ir.meta.baseUrl).toContain("petstore");
  });

  it("groups endpoints into pets resource", async () => {
    const ir = await loadIR();
    expect(ir.resources.map((r) => r.name)).toContain("pets");
  });

  it("names actions correctly", async () => {
    const ir = await loadIR();
    const pets = ir.resources.find((r) => r.name === "pets");
    const names = pets?.actions.map((a) => a.name) ?? [];
    expect(names).toContain("list");
    expect(names).toContain("create");
  });
});

describe("validateIR", () => {
  it("validates correct IR without errors", async () => {
    const result = validateIR(await loadIR());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns errors for empty IR", () => {
    const ir: IR = {
      meta: { title: "", version: "0", baseUrl: "", openapiVersion: "3" },
      auth: { type: "none", header: "" },
      resources: [],
      schemas: {},
    };
    const result = validateIR(ir);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("groupEndpoints", () => {
  it("groups by tag when available", async () => {
    const { endpoints } = await parseSpec(`${FIXTURES}/petstore-v3.yaml`);
    const resources = groupEndpoints(endpoints);
    expect(resources.length).toBeGreaterThanOrEqual(1);
    expect(resources[0]?.name).toBe("pets");
    expect(resources[0]?.displayName).toBe("pets");
  });
});

describe("nameAction", () => {
  it("returns list for GET on collection", () => {
    expect(nameAction("GET", "/pets")).toBe("list");
  });
  it("returns get for GET on item", () => {
    expect(nameAction("GET", "/pets/{id}")).toBe("get");
  });
  it("returns create for POST", () => {
    expect(nameAction("POST", "/pets")).toBe("create");
  });
  it("returns delete for DELETE", () => {
    expect(nameAction("DELETE", "/pets/{id}")).toBe("delete");
  });
  it("returns update for PATCH", () => {
    expect(nameAction("PATCH", "/pets/{id}")).toBe("update");
  });
  it("returns replace for PUT on item", () => {
    expect(nameAction("PUT", "/pets/{id}")).toBe("replace");
  });
});
