/**
 * fusecli bundle <app> — Build CLI binary via Bun.
 * @module
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "commander";
import pc from "picocolors";
import { FUSE_BIN, resolveCliBin, resolveCliDir } from "@/lib/config.js";
import { execute } from "@/lib/utils.js";

/**
 * Registers the `bundle` command on the given Commander program.
 * @param program - Commander program instance
 */
export function registerBundle(program: Command): void {
  program
    .command("bundle <app>")
    .description("Build a CLI binary from generated source")
    .option("--compile", "Create standalone binary (no Bun required)")
    .option("--minify", "Minify output")
    .action(async (app: string, opts: BundleOptions) => {
      const cliDir = resolveCliDir(app);
      const entry = join(cliDir, "src", "index.ts");

      if (!existsSync(entry)) {
        console.error(pc.red(`CLI not found: ${cliDir}`));
        console.error(pc.dim(`Run: fusecli create ${app}`));
        process.exit(2);
      }

      console.log(pc.cyan(`Bundling ${app}-cli...`));

      const outFile = resolveCliBin(app);
      const args = ["bun", "build", entry, "--outfile", outFile, "--target", "bun"];
      if (opts.compile) args.push("--compile");
      if (opts.minify) args.push("--minify");

      await execute(["mkdir", "-p", FUSE_BIN]);
      await execute(args, cliDir);
      await execute(["chmod", "+x", outFile]);

      console.log(pc.green(`Built: ${outFile}`));
      console.log(pc.dim(`  next: fusecli link ${app}`));
    });
}

/** Options for the bundle command */
interface BundleOptions {
  compile?: boolean;
  minify?: boolean;
}
