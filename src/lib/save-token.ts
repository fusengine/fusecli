/**
 * Helper to persist an API token for a generated CLI.
 * Writes to the same path the generated CLI reads at runtime.
 * @module
 */

import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import pc from "picocolors";

/**
 * Writes an API token to `~/.config/tokens/<appSlug>-cli.txt` with mode 600.
 * The path mirrors TOKEN_PATH in the generated config template.
 * @param appSlug - Slugified application name (e.g. "my-api")
 * @param token   - Raw token string to persist
 */
export function saveCliToken(appSlug: string, token: string): void {
  const dir = join(homedir(), ".config", "tokens");
  const file = join(dir, `${appSlug}-cli.txt`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, token, { encoding: "utf8" });
  chmodSync(file, 0o600);
  console.log(pc.green(`Token saved for ${appSlug}-cli`));
}
