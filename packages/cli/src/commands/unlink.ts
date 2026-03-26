/**
 * fusecli unlink <app> — Remove CLI from PATH and unlink SKILL.md from agents.
 * @module
 */

import { existsSync, rmSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "commander";
import pc from "picocolors";
import { scanAgentDirs } from "@/lib/agents.js";
import { resolveCliBin } from "@/lib/config.js";

/**
 * Registers the `unlink` command on the given Commander program.
 * Removes the binary symlink and SKILL.md links without deleting CLI source.
 * @param program - Commander program instance
 */
export function registerUnlink(program: Command): void {
  program
    .command("unlink <app>")
    .description("Remove CLI from PATH and unlink SKILL.md from agent directories")
    .action((app: string) => {
      let removed = 0;

      const binPath = resolveCliBin(app);
      if (existsSync(binPath)) {
        unlinkSync(binPath);
        console.log(pc.dim(`  removed symlink ${binPath}`));
        removed++;
      }

      const agentDirs = scanAgentDirs();
      for (const { agent, dir } of agentDirs) {
        const skillDir = join(dir, `${app}-cli`);
        const skillLink = join(skillDir, "SKILL.md");
        if (existsSync(skillLink)) {
          unlinkSync(skillLink);
          console.log(pc.dim(`  unlinked SKILL.md from ${agent}`));
          removed++;
        }
        if (existsSync(skillDir)) {
          rmSync(skillDir, { recursive: true, force: true });
        }
      }

      if (removed === 0) {
        console.log(pc.yellow(`No links found for ${app}-cli.`));
        return;
      }

      console.log(pc.green(`${app}-cli unlinked. CLI source preserved in ~/.fuse/clis/.`));
    });
}
