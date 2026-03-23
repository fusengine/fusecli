/**
 * fusecli explore — Browse API resources from an OpenAPI spec.
 * @module
 */

import type { Command } from "commander";
import pc from "picocolors";
import { buildIR } from "@/ir/builder.js";
import type { IR } from "@/ir/types.js";
import { parseSpec } from "@/parser/index.js";

/**
 * Registers the `explore` command on the given Commander program.
 * @param program - Commander program instance
 */
export function registerExplore(program: Command): void {
  program
    .command("explore")
    .description("Browse API resources from an OpenAPI spec")
    .requiredOption("--openapi <url>", "OpenAPI spec URL or local path")
    .option("--json", "JSON output")
    .action(async (opts: ExploreOptions) => {
      const { parsed, endpoints } = await parseSpec(opts.openapi);
      const ir: IR = buildIR(parsed, endpoints);

      if (opts.json) {
        const data = ir.resources.map((r) => ({
          name: r.name,
          displayName: r.displayName,
          actions: r.actions.map((a) => ({
            name: a.name,
            method: a.method,
            path: a.path,
            params: a.params.length,
          })),
        }));
        console.log(JSON.stringify({ ok: true, data, meta: { total: data.length } }, null, 2));
        return;
      }

      console.log(pc.cyan(`${ir.meta.title} v${ir.meta.version}`));
      console.log(pc.dim(`Base URL: ${ir.meta.baseUrl}\n`));

      for (const resource of ir.resources) {
        console.log(pc.bold(resource.displayName) + pc.dim(` (${resource.basePath})`));
        for (const action of resource.actions) {
          const method = pc.cyan(action.method.padEnd(6));
          console.log(`  ${method} ${action.path} ${pc.dim(`→ ${action.name}`)}`);
        }
        console.log("");
      }
    });
}

/** Options for the explore command */
interface ExploreOptions {
  openapi: string;
  json?: boolean;
}
