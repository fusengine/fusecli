/**
 * fusecli create <app> — Generate a CLI from an OpenAPI spec.
 * @module
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "commander";
import pc from "picocolors";
import type { IPlugin } from "@/interfaces/plugin.js";
import { buildIR } from "@/ir/builder.js";
import type { AuthType, IR } from "@/ir/types.js";
import { resolveCliDir } from "@/lib/config.js";
import { saveCliToken } from "@/lib/save-token.js";
import { execute, slugify } from "@/lib/utils.js";
import { parseSpec } from "@/parser/index.js";

/**
 * Registers the `create` command on the given Commander program.
 * @param program - Commander program instance
 * @param plugins - Array of plugins to run after IR generation
 */
export function registerCreate(program: Command, plugins: IPlugin[]): void {
  program
    .command("create <app>")
    .description("Generate a CLI from an OpenAPI spec")
    .requiredOption("--openapi <url>", "OpenAPI spec URL or local path")
    .option("--base-url <url>", "Override base URL from spec")
    .option("--auth-type <type>", "Override auth type (bearer, api-key, basic, custom)")
    .option("--auth-header <header>", "Override auth header name")
    .option("--docs <url>", "Documentation URL stored in ir.meta.docsUrl")
    .option("--force", "Overwrite existing CLI")
    .option("--no-install", "Skip dependency installation")
    .option("--token <token>", "API token (stored automatically, skips auth set)")
    .action(async (app: string, opts: CreateOptions) => {
      const slug = slugify(app);
      const outDir = resolveCliDir(slug);
      console.log(pc.cyan(`Creating ${slug}-cli from ${opts.openapi}...`));

      const { parsed, endpoints } = await parseSpec(opts.openapi);
      const ir: IR = buildIR(parsed, endpoints);

      if (opts.baseUrl) ir.meta.baseUrl = opts.baseUrl;
      if (opts.authType) ir.auth.type = opts.authType as AuthType;
      if (opts.authHeader) ir.auth.header = opts.authHeader;
      if (opts.docs) ir.meta.docsUrl = opts.docs;

      mkdirSync(outDir, { recursive: true });

      for (const plugin of plugins) {
        const files = plugin.generate(ir, { outputDir: outDir });
        for (const file of files) {
          mkdirSync(join(file.path, ".."), { recursive: true });
          writeFileSync(file.path, file.content);
        }
        console.log(pc.dim(`  plugin ${plugin.name}: ${files.length} files`));
      }

      if (opts.install !== false) {
        console.log(pc.dim("  installing dependencies..."));
        await execute(["bun", "install"], outDir);
      }

      if (opts.token) {
        saveCliToken(slug, opts.token);
      }

      console.log(pc.green(`${slug}-cli created at ${outDir}`));
      console.log(pc.dim(`  next: fusecli bundle ${slug}`));
    });
}

/** Options for the create command */
interface CreateOptions {
  openapi: string;
  baseUrl?: string;
  authType?: string;
  authHeader?: string;
  docs?: string;
  force?: boolean;
  install?: boolean;
  token?: string;
}
