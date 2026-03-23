/**
 * fusecli remove <app> — Uninstall a CLI.
 * @module
 */

import { existsSync, rmSync, unlinkSync } from "node:fs";
import type { Command } from "commander";
import pc from "picocolors";
import { resolveCliBin, resolveCliDir } from "@/lib/config.js";

/**
 * Registers the `remove` command on the given Commander program.
 * @param program - Commander program instance
 */
export function registerRemove(program: Command): void {
  program
    .command("remove <app>")
    .description("Uninstall a CLI")
    .option("--keep-token", "Do not delete auth token")
    .action((app: string) => {
      const cliDir = resolveCliDir(app);
      const binPath = resolveCliBin(app);

      if (!existsSync(cliDir)) {
        console.error(pc.red(`CLI not found: ${app}`));
        process.exit(2);
      }

      rmSync(cliDir, { recursive: true, force: true });
      console.log(pc.dim(`  removed ${cliDir}`));

      if (existsSync(binPath)) {
        unlinkSync(binPath);
        console.log(pc.dim(`  removed ${binPath}`));
      }

      console.log(pc.green(`${app}-cli removed.`));
    });
}
