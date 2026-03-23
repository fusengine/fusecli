/**
 * fusecli doctor — Health check for FuseCLI installation.
 * @module
 */

import { existsSync } from "node:fs";
import type { Command } from "commander";
import pc from "picocolors";
import { scanAgentDirs } from "@/lib/agents.js";
import { FUSE_BIN, FUSE_CLIS_DIR, FUSE_HOME } from "@/lib/config.js";
import { identifyShell, resolveRcFile } from "@/lib/shell.js";

/**
 * Registers the `doctor` command on the given Commander program.
 * @param program - Commander program instance
 */
export function registerDoctor(program: Command): void {
  program
    .command("doctor")
    .description("Check FuseCLI installation health")
    .action(() => {
      console.log(pc.cyan("FuseCLI Doctor\n"));
      let issues = 0;

      issues += checkItem("Bun runtime", typeof Bun !== "undefined");
      issues += checkItem("FUSE_HOME exists", existsSync(FUSE_HOME));
      issues += checkItem("FUSE_BIN exists", existsSync(FUSE_BIN));
      issues += checkItem("CLIs directory", existsSync(FUSE_CLIS_DIR));

      const shell = identifyShell();
      issues += checkItem(`Shell detected (${shell})`, shell !== "unknown");

      const rcFile = resolveRcFile(shell);
      if (rcFile) {
        issues += checkItem(`RC file exists (${rcFile})`, existsSync(rcFile));
      }

      const agents = scanAgentDirs();
      issues += checkItem(`Agent dirs found (${agents.length})`, agents.length > 0);

      console.log("");
      if (issues === 0) {
        console.log(pc.green("All checks passed."));
      } else {
        console.log(pc.yellow(`${issues} issue(s) found.`));
      }
    });
}

/**
 * Prints a single health check item.
 * @param label - Check description
 * @param ok - Whether the check passed
 * @returns 0 if ok, 1 if not
 */
function checkItem(label: string, ok: boolean): number {
  const icon = ok ? pc.green("OK") : pc.red("FAIL");
  console.log(`  [${icon}] ${label}`);
  return ok ? 0 : 1;
}
