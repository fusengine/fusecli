/**
 * SKILL.md generator plugin.
 * Implements IPlugin, generates a SKILL.md file from IR for agent discovery.
 */

import { buildWorkflows } from "@/generators/skill-workflows.js";
import type { GeneratedFile, IPlugin, PluginOptions } from "@/interfaces/plugin.js";
import type { IR, Resource } from "@/ir/types.js";
import { slugify } from "@/lib/utils.js";

/** SKILL.md generator plugin. */
export const skillPlugin: IPlugin = {
  name: "plugin-skill",
  version: "1.0.0",

  generate(ir: IR, options: PluginOptions): GeneratedFile[] {
    const content = generateSkillMd(ir);
    return [{ path: `${options.outputDir}/SKILL.md`, content }];
  },
};

/**
 * Generate SKILL.md content from IR.
 * @param ir - The intermediate representation.
 * @returns Markdown string.
 */
export function generateSkillMd(ir: IR): string {
  const appName = slugify(ir.meta.title);
  const binName = `${appName}-cli`;
  const lines: string[] = [
    "---",
    `name: ${appName}`,
    `description: ${ir.meta.description ?? `${ir.meta.title} CLI`}`,
    `version: ${ir.meta.version}`,
    "---",
    "",
    `# ${ir.meta.title} CLI`,
    "",
    `> ${ir.meta.description ?? "Generated CLI skill"}`,
    "",
    `Base URL: \`${ir.meta.baseUrl}\``,
    "",
    "## Commands",
    "",
    `### Auth`,
    `- \`${binName} auth set <token>\` — Store API token`,
    `- \`${binName} auth show\` — Display stored token`,
    `- \`${binName} auth test\` — Verify token against API`,
    `- \`${binName} auth remove\` — Remove stored token`,
    "",
  ];

  for (const resource of ir.resources) {
    lines.push(...buildResourceSection(resource, binName));
  }

  lines.push(...buildWorkflows(ir.resources, binName));
  lines.push("## Exit Codes", "");
  lines.push("| Code | Meaning |", "|------|---------|");
  lines.push("| 0 | Success |", "| 1 | API Error |");
  lines.push("| 2 | Usage Error |", "| 3 | Auth Error |");
  lines.push("| 4 | Network Error |", "| 5 | Parse Error |");
  return lines.join("\n");
}

/** Build a resource section for SKILL.md. */
function buildResourceSection(resource: Resource, binName: string): string[] {
  const isSingle = resource.actions.length === 1;
  const lines = [`### ${resource.displayName ?? resource.name}`, ""];
  for (const action of resource.actions) {
    const pathP = action.params.filter((p) => p.location === "path");
    const optP = action.params.filter((p) => p.location !== "path");
    const args = pathP.map((p) => `<${p.cliName ?? p.name}>`).join(" ");
    const sub = isSingle ? "" : ` ${action.name}`;
    const desc = action.description ?? `${action.method} ${action.path}`;
    lines.push(`**\`${binName} ${resource.name}${sub}${args ? ` ${args}` : ""}\`** — ${desc}`, "");
    if (optP.length) {
      for (const p of optP) {
        const flag = p.required
          ? `--${p.cliName ?? p.name} <value>`
          : `--${p.cliName ?? p.name} [value]`;
        lines.push(`- \`${flag}\` — ${p.description ?? p.name}${p.required ? " (required)" : ""}`);
      }
      lines.push("");
    }
    const example = optP[0] ? ` --${optP[0].cliName ?? optP[0].name} "value"` : "";
    lines.push(
      "```bash",
      `${binName} ${resource.name}${sub}${args ? ` ${args}` : ""}${example} --json`,
      "```",
      "",
    );
  }
  return lines;
}
