/**
 * FuseCLI configuration paths and environment variables.
 * @module
 */

import { homedir } from "node:os";
import { join } from "node:path";

/** Base directory for all FuseCLI data. Defaults to ~/.fuse */
export const FUSE_HOME = process.env.FUSE_HOME || join(homedir(), ".fuse");

/** Directory for CLI binaries. Defaults to ~/.fuse/bin */
export const FUSE_BIN = process.env.FUSE_BIN || join(FUSE_HOME, "bin");

/** Directory containing all generated/installed CLIs */
export const FUSE_CLIS_DIR = join(FUSE_HOME, "clis");

/** Registry API base URL */
export const REGISTRY_URL = process.env.FUSE_REGISTRY || "https://registry.fusecli.dev";

/**
 * Resolves the directory path for a given CLI application.
 * @param appName - Application name (slug)
 * @returns Absolute path to ~/.fuse/clis/<app>-cli
 */
export function resolveCliDir(appName: string): string {
  return join(FUSE_CLIS_DIR, `${appName}-cli`);
}

/**
 * Resolves the binary symlink path for a given CLI application.
 * @param appName - Application name (slug)
 * @returns Absolute path to ~/.fuse/bin/<app>-cli
 */
export function resolveCliBin(appName: string): string {
  return join(FUSE_BIN, `${appName}-cli`);
}

/**
 * Resolves the token storage path for a given CLI application.
 * @param appName - Application name (slug)
 * @returns Absolute path to ~/.fuse/tokens/<app>.json
 */
export function resolveTokenPath(appName: string): string {
  return join(FUSE_HOME, "tokens", `${appName}.json`);
}
