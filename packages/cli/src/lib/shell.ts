/**
 * Shell detection and PATH management for FuseCLI.
 * @module
 */

import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { FUSE_BIN } from "@/lib/config.js";

/** Supported shell RC file mappings */
const SHELL_RC_MAP: Record<string, string> = {
  bash: ".bashrc",
  zsh: ".zshrc",
  fish: ".config/fish/config.fish",
};

/**
 * Identifies the current user shell from SHELL env variable.
 * @returns Shell name (bash, zsh, fish) or "unknown"
 */
export function identifyShell(): string {
  const shell = process.env.SHELL || "";
  if (shell.includes("zsh")) return "zsh";
  if (shell.includes("bash")) return "bash";
  if (shell.includes("fish")) return "fish";
  return "unknown";
}

/**
 * Resolves the absolute path to the shell RC file.
 * @param shell - Shell name
 * @returns Absolute path to RC file, or null if unknown
 */
export function resolveRcFile(shell: string): string | null {
  const rc = SHELL_RC_MAP[shell];
  return rc ? join(homedir(), rc) : null;
}

/**
 * Injects FUSE_BIN into the user's shell PATH if not already present.
 * @returns true if PATH was modified, false if already present
 */
export function injectPath(): boolean {
  const shell = identifyShell();
  const rcFile = resolveRcFile(shell);
  if (!rcFile) return false;

  const exportLine =
    shell === "fish" ? `set -gx PATH ${FUSE_BIN} $PATH` : `export PATH="${FUSE_BIN}:$PATH"`;

  if (existsSync(rcFile)) {
    const content = readFileSync(rcFile, "utf-8");
    if (content.includes(FUSE_BIN)) return false;
  }

  appendFileSync(rcFile, `\n# FuseCLI\n${exportLine}\n`);
  return true;
}

/**
 * Strips FUSE_BIN from the user's shell RC file.
 * @returns true if PATH entry was removed
 */
export function stripPath(): boolean {
  const shell = identifyShell();
  const rcFile = resolveRcFile(shell);
  if (!rcFile || !existsSync(rcFile)) return false;

  const content = readFileSync(rcFile, "utf-8");
  const filtered = content
    .split("\n")
    .filter((line) => !line.includes(FUSE_BIN) && line !== "# FuseCLI")
    .join("\n");

  if (filtered === content) return false;
  Bun.write(rcFile, filtered);
  return true;
}
