/**
 * fusecli link <app> — Add CLI to PATH and link SKILL.md to agents.
 * @module
 */

import { existsSync, mkdirSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "commander";
import pc from "picocolors";
import { linkSkillToAgents } from "@/lib/agents.js";
import { FUSE_BIN, resolveCliBin, resolveCliDir } from "@/lib/config.js";
import { injectPath } from "@/lib/shell.js";

/**
 * Registers the `link` command on the given Commander program.
 * @param program - Commander program instance
 */
export function registerLink(program: Command): void {
  program
    .command("link <app>")
    .description("Add CLI to PATH and link SKILL.md to agent directories")
    .option("--no-skills", "Skip SKILL.md linking to agents")
    .option("--agents <list>", "Agent dirs: claude,codex,cursor (default: all)")
    .action((app: string, opts: LinkOptions) => {
      const cliDir = resolveCliDir(app);
      const binSrc = resolveCliBin(app);

      if (!existsSync(cliDir)) {
        console.error(pc.red(`CLI not found: ${cliDir}`));
        process.exit(2);
      }

      mkdirSync(FUSE_BIN, { recursive: true });

      if (!existsSync(binSrc)) {
        const entry = join(cliDir, "src", "index.ts");
        if (existsSync(entry)) {
          symlinkSync(entry, binSrc);
          console.log(pc.dim(`  symlinked ${binSrc}`));
        }
      }

      const pathAdded = injectPath();
      if (pathAdded) {
        console.log(pc.dim("  added ~/.fuse/bin to PATH"));
      }

      if (opts.skills !== false) {
        const skillPath = join(cliDir, "SKILL.md");
        if (existsSync(skillPath)) {
          const count = linkSkillToAgents(app, skillPath);
          console.log(pc.dim(`  linked SKILL.md to ${count} agent(s)`));
        }
      }

      console.log(pc.green(`${app}-cli linked. Restart shell or source rc file.`));
    });
}

/** Options for the link command */
interface LinkOptions {
  skills?: boolean;
  agents?: string;
}
