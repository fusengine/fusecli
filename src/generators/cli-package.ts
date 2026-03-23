/**
 * Generates package.json for a standalone CLI.
 * Minimal deps: commander, zod, picocolors — NO @fusecli/shared.
 */

import type { IR } from "@/ir/types.js";
import { slugify } from "@/lib/utils.js";

/**
 * Generate package.json content for a standalone CLI.
 * @param ir - The intermediate representation.
 * @returns JSON string for package.json.
 */
export function generatePackageJson(ir: IR): string {
  const appName = slugify(ir.meta.title);
  const pkg = {
    name: `${appName}-cli`,
    version: ir.meta.version,
    description: ir.meta.description ?? `${ir.meta.title} CLI`,
    type: "module",
    bin: { [`${appName}-cli`]: "./src/index.ts" },
    scripts: {
      start: "bun src/index.ts",
      build: `bun build src/index.ts --compile --outfile dist/${appName}-cli`,
    },
    dependencies: {
      commander: "^14.0.0",
      zod: "^4.0.0",
      picocolors: "^1.1.0",
    },
  };
  return JSON.stringify(pkg, null, 2);
}
