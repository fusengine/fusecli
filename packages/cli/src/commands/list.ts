/**
 * fusecli list — List all installed CLIs.
 * @module
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "commander";
import pc from "picocolors";
import { FUSE_CLIS_DIR } from "@/lib/config.js";

/**
 * Registers the `list` command on the given Commander program.
 * @param program - Commander program instance
 */
export function registerList(program: Command): void {
  program
    .command("list")
    .description("List all installed CLIs")
    .option("--json", "JSON output")
    .action((opts: ListOptions) => {
      if (!existsSync(FUSE_CLIS_DIR)) {
        if (opts.json) {
          console.log(JSON.stringify({ ok: true, data: [], meta: { total: 0 } }));
        } else {
          console.log(pc.dim("No CLIs installed. Run: fusecli create <app>"));
        }
        return;
      }

      const entries = readdirSync(FUSE_CLIS_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name.endsWith("-cli"))
        .map((d) => {
          const pkgPath = join(FUSE_CLIS_DIR, d.name, "package.json");
          const version = readPkgVersion(pkgPath);
          return { name: d.name, version };
        });

      if (opts.json) {
        console.log(
          JSON.stringify({ ok: true, data: entries, meta: { total: entries.length } }, null, 2),
        );
        return;
      }

      if (!entries.length) {
        console.log(pc.dim("No CLIs installed."));
        return;
      }

      for (const entry of entries) {
        console.log(`${pc.cyan(entry.name)} ${pc.dim(entry.version)}`);
      }
    });
}

/**
 * Reads the version from a package.json file.
 * @param pkgPath - Absolute path to package.json
 * @returns Version string or "unknown"
 */
function readPkgVersion(pkgPath: string): string {
  try {
    if (!existsSync(pkgPath)) return "unknown";
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    return pkg.version || "unknown";
  } catch {
    return "unknown";
  }
}

/** Options for the list command */
interface ListOptions {
  json?: boolean;
}
