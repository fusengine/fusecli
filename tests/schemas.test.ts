/**
 * Tests for Zod schema generation and primitive type mapping.
 * @module
 */

import { describe, expect, it } from "bun:test";
import type { PropertyDef } from "@/ir/schema-types.js";
import { generateZodSchema, mapPrimitiveToZod } from "@/lib/schemas.js";

describe("generateZodSchema", () => {
  it("generates valid Zod code for Pet schema", () => {
    const props: PropertyDef[] = [
      { name: "id", type: "integer", required: true },
      { name: "name", type: "string", required: true },
      { name: "tag", type: "string", required: false },
    ];
    const code = generateZodSchema("Pet", props);
    expect(code).toContain("PetSchema");
    expect(code).toContain("z.object");
    expect(code).toContain("z.number().int()");
    expect(code).toContain("z.string()");
  });

  it("marks optional fields with .optional()", () => {
    const props: PropertyDef[] = [
      { name: "name", type: "string", required: true },
      { name: "tag", type: "string", required: false },
    ];
    const code = generateZodSchema("CreatePet", props);
    expect(code).toContain("tag: z.string().optional()");
    expect(code).not.toContain("name: z.string().optional()");
  });

  it("handles enum fields correctly", () => {
    const props: PropertyDef[] = [
      { name: "status", type: "string", required: false, enum: ["available", "pending", "sold"] },
    ];
    const code = generateZodSchema("Status", props);
    expect(code).toContain("z.enum");
    expect(code).toContain("available");
  });

  it("generates empty object schema for no properties", () => {
    const code = generateZodSchema("Empty", []);
    expect(code).toBe("export const EmptySchema = z.object({});");
  });

  it("applies constraints (min, max)", () => {
    const props: PropertyDef[] = [
      { name: "email", type: "string", required: true, minLength: 5, maxLength: 100 },
    ];
    const code = generateZodSchema("User", props);
    expect(code).toContain(".min(5)");
    expect(code).toContain(".max(100)");
  });
});

describe("mapPrimitiveToZod", () => {
  it("maps string to z.string()", () => {
    expect(mapPrimitiveToZod("string")).toBe("z.string()");
  });

  it("maps integer to z.number().int()", () => {
    expect(mapPrimitiveToZod("integer")).toBe("z.number().int()");
  });

  it("maps boolean to z.boolean()", () => {
    expect(mapPrimitiveToZod("boolean")).toBe("z.boolean()");
  });

  it("maps string+email format to z.string().email()", () => {
    expect(mapPrimitiveToZod("string", "email")).toBe("z.string().email()");
  });

  it("maps string+uuid format to z.string().uuid()", () => {
    expect(mapPrimitiveToZod("string", "uuid")).toBe("z.string().uuid()");
  });

  it("returns z.unknown() for unrecognized type", () => {
    expect(mapPrimitiveToZod("unknown" as "string")).toBe("z.unknown()");
  });
});
