/**
 * fusecli install <source> — Install CLI from GitHub or registry.
 * @module
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "commander";
import pc from "picocolors";
import { FUSE_CLIS_DIR, resolveCliDir } from "@/lib/config.js";
import { resolveGithubSource } from "@/lib/github.js";
import { execute } from "@/lib/utils.js";

/**
 * Registers the `install` command on the given Commander program.
 * @param program - Commander program instance
 */
export function registerInstall(program: Command): void {
  program
    .command("install <source>")
    .description("Install CLI from GitHub or registry")
    .option("--force", "Overwrite existing CLI")
    .action(async (source: string, opts: InstallOptions) => {
      const ref = resolveGithubSource(source);
      const destDir = resolveCliDir(ref.repo);

      if (existsSync(destDir) && !opts.force) {
        console.error(pc.red(`${ref.repo}-cli already exists. Use --force to overwrite.`));
        process.exit(2);
      }

      console.log(pc.cyan(`Installing ${ref.owner}/${ref.repo}...`));
      console.log(pc.dim(`  cloning ${ref.cloneUrl}`));

      await execute(["mkdir", "-p", FUSE_CLIS_DIR]);
      await execute(["git", "clone", "--depth", "1", ref.cloneUrl, destDir]);

      const pkgJson = join(destDir, "package.json");
      if (existsSync(pkgJson)) {
        console.log(pc.dim("  installing dependencies..."));
        await execute(["bun", "install"], destDir);
      }

      const buildScript = join(destDir, "package.json");
      if (existsSync(buildScript)) {
        try {
          await execute(["bun", "run", "build"], destDir);
          console.log(pc.dim("  built successfully"));
        } catch {
          console.log(pc.dim("  no build script, skipping"));
        }
      }

      console.log(pc.green(`${ref.repo}-cli installed at ${destDir}`));
      console.log(pc.dim(`  next: fusecli link ${ref.repo}`));
    });
}

/** Options for the install command */
interface InstallOptions {
  force?: boolean;
}
