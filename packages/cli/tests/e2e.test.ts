/**
 * E2E test: Full Petstore pipeline parse -> IR -> validate -> generate.
 * @module
 */

import { describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { buildIR } from "@/ir/builder.js";
import type { IR } from "@/ir/types.js";
import { validateIR } from "@/ir/validator.js";
import { parseSpec } from "@/parser/index.js";
import { mockCliPlugin, mockSkillPlugin } from "./e2e-helpers.js";

const FIXTURES = resolve(import.meta.dir, "../fixtures");
const SPEC_V3 = `${FIXTURES}/petstore-v3.yaml`;
const SPEC_V2 = `${FIXTURES}/petstore-v2.json`;
const OUT = "/tmp/fusecli-e2e-test";

describe("fixtures exist", () => {
  it("petstore-v3.yaml exists", () => {
    expect(existsSync(SPEC_V3)).toBe(true);
  });
  it("petstore-v2.json exists", () => {
    expect(existsSync(SPEC_V2)).toBe(true);
  });
});

describe("E2E: Petstore full pipeline", () => {
  let ir: IR;

  it("Step 1: parses petstore-v3.yaml", async () => {
    const { parsed, endpoints } = await parseSpec(SPEC_V3);
    expect(parsed.version).toBe("3.0.3");
    expect(endpoints.length).toBeGreaterThanOrEqual(2);
    ir = buildIR(parsed, endpoints);
  });

  it("Step 2: IR has correct metadata", () => {
    expect(ir.meta.title).toBe("Petstore");
    expect(ir.meta.baseUrl).toContain("petstore");
  });

  it("Step 3: IR has pets resource with actions", () => {
    expect(ir.resources.length).toBeGreaterThanOrEqual(1);
    const pets = ir.resources.find((r) => r.name === "pets");
    expect(pets).toBeDefined();
    expect(pets?.actions.length).toBeGreaterThanOrEqual(2);
  });

  it("Step 4: IR validates without errors", () => {
    const result = validateIR(ir);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("Step 5: schemas extracted from spec", () => {
    expect(Object.keys(ir.schemas).length).toBeGreaterThanOrEqual(1);
  });

  it("Step 6: mock cli-plugin generates command files", () => {
    const files = mockCliPlugin.generate(ir, { outputDir: OUT });
    expect(files.length).toBeGreaterThanOrEqual(1);
    const petsCmd = files.find((f) => f.path.includes("pets.ts"));
    expect(petsCmd).toBeDefined();
    expect(petsCmd?.content).toContain("function list");
  });

  it("Step 7: mock skill-plugin generates SKILL.md", () => {
    const files = mockSkillPlugin.generate(ir, { outputDir: OUT });
    expect(files).toHaveLength(1);
    expect(files[0]?.content).toContain("# Petstore CLI");
    expect(files[0]?.content).toContain("GET /pets");
  });

  it("Step 8: v2 spec also produces valid IR", async () => {
    const { parsed, endpoints } = await parseSpec(SPEC_V2);
    const v2ir = buildIR(parsed, endpoints);
    const result = validateIR(v2ir);
    expect(result.valid).toBe(true);
  });
});
