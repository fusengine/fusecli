/**
 * CLI plugin orchestrator.
 * Implements IPlugin, calls all sub-generators, returns GeneratedFile[].
 */

import { generateAuthCommand } from "@/generators/cli-auth.js";
import { generateEntryPoint } from "@/generators/cli-entry.js";
import { generatePackageJson } from "@/generators/cli-package.js";
import { generateResourceFile } from "@/generators/cli-resource.js";
import { generateSchemaFile } from "@/generators/cli-schemas.js";
import type { GeneratedFile, IPlugin, PluginOptions } from "@/interfaces/plugin.js";
import type { IR } from "@/ir/types.js";
import { slugify } from "@/lib/utils.js";
import { emitAuthTemplate } from "@/templates/auth.js";
import { generateClientCode } from "@/templates/client.js";
import { emitConfigTemplate } from "@/templates/config.js";
import { emitErrorsTemplate } from "@/templates/errors.js";
import { emitOutputTemplate } from "@/templates/output.js";

/** CLI code generator plugin. */
export const cliPlugin: IPlugin = {
  name: "plugin-cli",
  version: "1.0.0",

  generate(ir: IR, options: PluginOptions): GeneratedFile[] {
    const dir = options.outputDir;
    const appName = slugify(ir.meta.title);
    const files: GeneratedFile[] = [
      { path: `${dir}/src/index.ts`, content: generateEntryPoint(ir) },
      { path: `${dir}/package.json`, content: generatePackageJson(ir) },
      { path: `${dir}/src/commands/auth.ts`, content: generateAuthCommand(ir) },
      { path: `${dir}/src/lib/client.ts`, content: generateClientCode(ir) },
      { path: `${dir}/src/lib/auth.ts`, content: emitAuthTemplate(ir) },
      { path: `${dir}/src/lib/output.ts`, content: emitOutputTemplate() },
      { path: `${dir}/src/lib/errors.ts`, content: emitErrorsTemplate() },
      { path: `${dir}/src/lib/config.ts`, content: emitConfigTemplate(ir) },
    ];
    for (const resource of ir.resources) {
      files.push({
        path: `${dir}/src/commands/${resource.name}.ts`,
        content: generateResourceFile(resource, appName),
      });
      const schemaEntries = Object.entries(ir.schemas);
      const relevant = schemaEntries.filter(([k]) =>
        k.toLowerCase().includes(resource.name.toLowerCase()),
      );
      if (relevant.length > 0) {
        files.push({
          path: `${dir}/src/schemas/${resource.name}.ts`,
          content: generateSchemaFile(resource, Object.fromEntries(relevant)),
        });
      }
    }
    return files;
  },
};
