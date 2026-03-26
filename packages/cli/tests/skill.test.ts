/**
 * Tests for skill-plugin SKILL.md generation.
 * @module
 */

import { describe, expect, it } from "bun:test";
import { skillPlugin } from "@/generators/skill-plugin.js";
import type { IR } from "@/ir/types.js";

/** Minimal IR fixture for skill plugin tests. */
function createTestIR(): IR {
  return {
    meta: {
      title: "PetStore",
      version: "1.0.0",
      description: "Manage your pets",
      baseUrl: "https://api.petstore.io/v1",
      openapiVersion: "3.0.3",
    },
    auth: { type: "bearer", header: "Authorization" },
    resources: [
      {
        name: "pets",
        displayName: "Pets",
        basePath: "/pets",
        actions: [
          { name: "list", method: "GET", path: "/pets", params: [], responses: [], tags: [] },
          {
            name: "get",
            method: "GET",
            path: "/pets/{id}",
            params: [
              { name: "id", cliName: "id", location: "path", type: "string", required: true },
            ],
            responses: [],
            tags: [],
          },
        ],
      },
    ],
    schemas: {},
  };
}

describe("skillPlugin SKILL.md generation", () => {
  it("generates exactly one SKILL.md file", () => {
    const files = skillPlugin.generate(createTestIR(), { outputDir: "./out" });
    expect(files).toHaveLength(1);
    expect(files[0]?.path).toBe("./out/SKILL.md");
  });

  it("includes title and base URL in content", () => {
    const files = skillPlugin.generate(createTestIR(), { outputDir: "./out" });
    const md = files[0]?.content;
    expect(md).toContain("PetStore");
    expect(md).toContain("https://api.petstore.io/v1");
  });

  it("lists resources and actions", () => {
    const files = skillPlugin.generate(createTestIR(), { outputDir: "./out" });
    const md = files[0]?.content;
    expect(md).toContain("Pets");
    expect(md).toContain("list");
    expect(md).toContain("GET /pets");
  });

  it("has correct plugin name and version", () => {
    expect(skillPlugin.name).toBe("plugin-skill");
    expect(skillPlugin.version).toBe("1.0.0");
  });
});
