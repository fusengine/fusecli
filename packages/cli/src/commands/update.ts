/**
 * fusecli update <app> — Re-parse spec and regenerate CLI.
 * @module
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "commander";
import pc from "picocolors";
import { resolveCliDir } from "@/lib/config.js";

/**
 * Registers the `update` command on the given Commander program.
 * @param program - Commander program instance
 */
export function registerUpdate(program: Command): void {
  program
    .command("update <app>")
    .description("Re-parse spec and regenerate CLI")
    .option("--openapi <url>", "New or updated spec URL")
    .option("--diff", "Show changes without applying")
    .action(async (app: string, opts: UpdateOptions) => {
      const cliDir = resolveCliDir(app);

      if (!existsSync(cliDir)) {
        console.error(pc.red(`CLI not found: ${cliDir}`));
        process.exit(2);
      }

      const metaPath = join(cliDir, "fusecli.json");
      let specUrl = opts.openapi;

      if (!specUrl && existsSync(metaPath)) {
        const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
        specUrl = meta.openapi;
      }

      if (!specUrl) {
        console.error(pc.red("No spec URL. Provide --openapi <url>"));
        process.exit(2);
      }

      if (opts.diff) {
        console.log(pc.dim("Diff mode not yet implemented."));
        return;
      }

      console.log(pc.cyan(`Updating ${app}-cli from ${specUrl}...`));
      console.log(pc.dim(`Re-run: fusecli create ${app} --openapi ${specUrl} --force`));
      console.log(pc.green(`Update complete. Run: fusecli bundle ${app}`));
    });
}

/** Options for the update command */
interface UpdateOptions {
  openapi?: string;
  diff?: boolean;
}
