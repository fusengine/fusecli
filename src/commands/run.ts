/**
 * fusecli run — Instant API access without code generation.
 * @module
 */

import type { Command } from "commander";
import pc from "picocolors";
import { runFromSpec } from "@/runtime/index.js";

/**
 * Registers the `run` command on the given Commander program.
 * @param program - Commander program instance
 */
export function registerRun(program: Command): void {
  program
    .command("run")
    .description("Use any API instantly without codegen")
    .requiredOption("--openapi <url>", "OpenAPI spec URL or local path")
    .option("--base-url <url>", "Override base URL")
    .option("--token <token>", "Auth token")
    .option("--json", "Force JSON output")
    .allowUnknownOption()
    .action(async (opts: RunOptions, cmd: Command) => {
      console.log(pc.dim(`Parsing ${opts.openapi}...`));
      const argv = cmd.args;
      await runFromSpec(opts.openapi, ["node", "run", ...argv], {
        token: opts.token,
        baseUrl: opts.baseUrl,
      });
    });
}

/** Options for the run command */
interface RunOptions {
  openapi: string;
  baseUrl?: string;
  token?: string;
  json?: boolean;
}
