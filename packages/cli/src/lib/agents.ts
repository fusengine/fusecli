/**
 * AI agent directory detection and SKILL.md linking for FuseCLI.
 * @module
 */

import { existsSync, mkdirSync, symlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/** Known agent skill directories relative to home */
const AGENT_PATHS: Record<string, string> = {
  claude: ".claude/skills",
  cursor: ".cursor/skills",
  codex: ".codex/skills",
  windsurf: ".windsurf/skills",
  cline: ".cline/skills",
};

/**
 * Scans the home directory for installed AI agent skill directories.
 * @returns Array of objects with agent name and absolute skill dir path
 */
export function scanAgentDirs(): Array<{ agent: string; dir: string }> {
  const home = homedir();
  const found: Array<{ agent: string; dir: string }> = [];
  for (const [agent, relPath] of Object.entries(AGENT_PATHS)) {
    const dir = join(home, relPath);
    if (existsSync(join(home, relPath.split("/")[0] ?? ""))) {
      found.push({ agent, dir });
    }
  }
  return found;
}

/**
 * Creates a symlink for SKILL.md in each detected agent skill directory.
 * @param appName - CLI application name (slug)
 * @param skillPath - Absolute path to the source SKILL.md
 * @returns Number of symlinks created
 */
export function linkSkillToAgents(appName: string, skillPath: string): number {
  const agents = scanAgentDirs();
  let linked = 0;
  for (const { dir } of agents) {
    const target = join(dir, `${appName}-cli`, "SKILL.md");
    mkdirSync(join(dir, `${appName}-cli`), { recursive: true });
    if (!existsSync(target)) {
      symlinkSync(skillPath, target);
      linked++;
    }
  }
  return linked;
}
