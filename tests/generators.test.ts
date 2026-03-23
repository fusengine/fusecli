/**
 * Tests for cli-plugin generator — verifies file generation from IR.
 * @module
 */

import { describe, expect, it } from "bun:test";
import { cliPlugin } from "@/generators/cli-plugin.js";
import type { IR } from "@/ir/types.js";

/** Minimal IR fixture for generator tests. */
function createTestIR(): IR {
  return {
    meta: {
      title: "TestAPI",
      version: "1.0.0",
      baseUrl: "https://api.test.com",
      openapiVersion: "3.0.3",
    },
    auth: { type: "bearer", header: "Authorization", scheme: "bearer" },
    resources: [
      {
        name: "users",
        displayName: "Users",
        basePath: "/users",
        actions: [
          {
            name: "list",
            method: "GET",
            path: "/users",
            params: [],
            responses: [{ status: 200, description: "OK" }],
            tags: ["users"],
          },
          {
            name: "get",
            method: "GET",
            path: "/users/{id}",
            params: [
              { name: "id", cliName: "id", location: "path", type: "string", required: true },
            ],
            responses: [{ status: 200, description: "OK" }],
            tags: ["users"],
          },
        ],
      },
    ],
    schemas: {},
  };
}

describe("cliPlugin.generate", () => {
  it("returns GeneratedFile[] with correct paths", () => {
    const files = cliPlugin.generate(createTestIR(), { outputDir: "./out" });
    expect(files.length).toBeGreaterThan(0);
    const paths = files.map((f) => f.path);
    expect(paths.some((p) => p.includes("index.ts"))).toBe(true);
    expect(paths.some((p) => p.includes("package.json"))).toBe(true);
  });

  it("generates a command file for the users resource", () => {
    const files = cliPlugin.generate(createTestIR(), { outputDir: "./out" });
    const usersCmd = files.find((f) => f.path.includes("users.ts"));
    expect(usersCmd).toBeDefined();
    expect(usersCmd?.content.length).toBeGreaterThan(0);
  });

  it("respects outputDir option in all paths", () => {
    const files = cliPlugin.generate(createTestIR(), { outputDir: "/custom" });
    for (const f of files) {
      expect(f.path.startsWith("/custom")).toBe(true);
    }
  });

  it("has correct plugin name and version", () => {
    expect(cliPlugin.name).toBe("plugin-cli");
    expect(cliPlugin.version).toBe("1.0.0");
  });
});
