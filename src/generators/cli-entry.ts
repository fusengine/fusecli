/**
 * Generates the CLI entry point (src/index.ts) for a standalone CLI.
 * Uses Commander.js with global options.
 */

import { toPascal } from "@/generators/gen-utils.js";
import type { IR } from "@/ir/types.js";
import { slugify } from "@/lib/utils.js";

/**
 * Generate the main entry point file content.
 * @param ir - The intermediate representation.
 * @returns TypeScript source code string.
 */
export function generateEntryPoint(ir: IR): string {
  const appName = slugify(ir.meta.title);
  const binName = `${appName}-cli`;
  const resources = ir.resources.map((r) => r.name);

  const imports = [
    `import { Command } from "commander";`,
    `import { registerAuthCommand } from "./commands/auth.js";`,
    ...resources.map((r) => `import { register${toPascal(r)}Commands } from "./commands/${r}.js";`),
  ];

  const registrations = [
    `  registerAuthCommand(program);`,
    ...resources.map((r) => `  register${toPascal(r)}Commands(program);`),
  ];

  return `#!/usr/bin/env bun
${imports.join("\n")}

const program = new Command();

program
  .name("${binName}")
  .description("${ir.meta.description ?? `${ir.meta.title} CLI`}")
  .version("${ir.meta.version}")
  .option("--json", "Output as JSON envelope")
  .option("--format <fmt>", "Output format: text | json | csv | yaml", "text")
  .option("--verbose", "Enable verbose logging")
  .addHelpText("after", "\\nSetup: ${binName} auth set <your-api-key>\\n");

${registrations.join("\n")}

program.parse();
`;
}
