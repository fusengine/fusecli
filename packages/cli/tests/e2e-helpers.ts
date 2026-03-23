/**
 * Shared helpers and mock plugins for E2E Petstore tests.
 * @module
 */

import type { GeneratedFile, IPlugin, PluginOptions } from "@/interfaces/plugin.js";
import type { IR } from "@/ir/types.js";

/** Mock plugin-cli: generates a command file per resource. */
export const mockCliPlugin: IPlugin = {
  name: "plugin-cli",
  version: "1.0.0",
  generate(ir: IR, opts: PluginOptions): GeneratedFile[] {
    return ir.resources.map((r) => ({
      path: `${opts.outputDir}/src/commands/${r.name}.ts`,
      content: r.actions
        .map((a) => `export function ${a.name}() { /* ${a.method} ${a.path} */ }`)
        .join("\n"),
    }));
  },
};

/** Mock plugin-skill: generates SKILL.md from IR. */
export const mockSkillPlugin: IPlugin = {
  name: "plugin-skill",
  version: "1.0.0",
  generate(ir: IR, opts: PluginOptions): GeneratedFile[] {
    const lines = [`# ${ir.meta.title} CLI`, ""];
    for (const r of ir.resources) {
      lines.push(`## ${r.displayName ?? r.name}`);
      for (const a of r.actions) {
        lines.push(`- \`${a.name}\` — ${a.method} ${a.path}`);
      }
    }
    return [{ path: `${opts.outputDir}/SKILL.md`, content: lines.join("\n") }];
  },
};
