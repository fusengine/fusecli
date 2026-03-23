/**
 * fusecli search <query> — Search the FuseCLI registry.
 * @module
 */

import type { Command } from "commander";
import pc from "picocolors";
import { REGISTRY_URL } from "@/lib/config.js";

/**
 * Registers the `search` command on the given Commander program.
 * @param program - Commander program instance
 */
export function registerSearch(program: Command): void {
  program
    .command("search <query>")
    .description("Search the FuseCLI registry")
    .option("--category <cat>", "Filter by category")
    .option("--sort <field>", "Sort: popular | votes | newest", "popular")
    .option("--limit <n>", "Max results", "10")
    .option("--json", "JSON output")
    .action(async (query: string, opts: SearchOptions) => {
      const params = new URLSearchParams({
        q: query,
        sort: opts.sort || "popular",
        limit: opts.limit || "10",
      });
      if (opts.category) params.set("category", opts.category);

      const url = `${REGISTRY_URL}/api/search?${params}`;

      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error(pc.red(`Registry error: ${res.status}`));
          process.exit(1);
        }

        const data = (await res.json()) as RegistryResult;

        if (opts.json) {
          console.log(JSON.stringify({ ok: true, data: data.items }, null, 2));
          return;
        }

        if (!data.items?.length) {
          console.log(pc.dim("No results found."));
          return;
        }

        for (const item of data.items) {
          console.log(`${pc.cyan(item.name)} ${pc.dim(`v${item.version}`)}`);
          if (item.description) console.log(`  ${item.description}`);
        }
      } catch {
        console.error(pc.red("Failed to reach registry. Check your connection."));
        process.exit(4);
      }
    });
}

/** Options for the search command */
interface SearchOptions {
  category?: string;
  sort?: string;
  limit?: string;
  json?: boolean;
}

/** Registry search response shape */
interface RegistryResult {
  items: Array<{ name: string; version: string; description?: string }>;
}
