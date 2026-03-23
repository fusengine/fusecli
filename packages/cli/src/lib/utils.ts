/**
 * Shared utility functions for FuseCLI.
 * @module
 */

/**
 * Converts a string to a URL-friendly slug.
 * @param input - The string to slugify
 * @returns Lowercase hyphen-separated slug
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Executes a shell command via Bun.spawn and returns stdout.
 * @param cmd - Command and arguments array
 * @param cwd - Working directory
 * @returns stdout as string
 */
export async function execute(cmd: string[], cwd?: string): Promise<string> {
  const proc = Bun.spawn(cmd, { cwd, stdout: "pipe", stderr: "pipe" });
  const stdout = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    const stderr = await new Response(proc.stderr).text();
    throw new Error(`Command failed (exit ${exitCode}): ${cmd.join(" ")}\n${stderr}`);
  }
  return stdout.trim();
}
