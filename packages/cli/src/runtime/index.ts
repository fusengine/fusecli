/**
 * Zero-codegen runtime — parses spec and builds dynamic Commander program.
 * @module
 */

import { Command } from "commander";
import { buildIR } from "@/ir/builder.js";
import type { IR, Resource } from "@/ir/types.js";
import { parseSpec } from "@/parser/index.js";
import { callEndpoint } from "@/runtime/endpoint-caller.js";

/**
 * Runs a CLI dynamically from an OpenAPI spec without code generation.
 * Parses the spec, builds IR, then creates Commander commands on-the-fly.
 * @param specPath - Path or URL to the OpenAPI spec
 * @param argv - CLI arguments to parse
 * @param opts - Optional token and base URL overrides
 */
export async function runFromSpec(
  specPath: string,
  argv: string[],
  opts: { token?: string; baseUrl?: string } = {},
): Promise<void> {
  const { parsed, endpoints } = await parseSpec(specPath);
  const ir: IR = buildIR(parsed, endpoints);
  const base = opts.baseUrl || ir.meta.baseUrl;

  const program = new Command().name("fusecli-run").description(ir.meta.title);

  for (const resource of ir.resources) {
    registerResource(program, resource, base, opts.token);
  }

  program.parse(argv);
}

/**
 * Registers a resource and its actions as Commander sub-commands.
 * @param program - Parent Commander program
 * @param resource - IR resource definition
 * @param baseUrl - API base URL
 * @param token - Optional auth token
 */
function registerResource(
  program: Command,
  resource: Resource,
  baseUrl: string,
  token?: string,
): void {
  const cmd = program.command(resource.name).description(resource.displayName);

  for (const action of resource.actions) {
    const sub = cmd.command(action.name).description(action.description || action.name);

    for (const param of action.params) {
      if (param.location === "path") {
        sub.argument(param.cliName, param.description || param.name);
      } else {
        const flag = `--${param.name} <value>`;
        param.required ? sub.requiredOption(flag) : sub.option(flag);
      }
    }

    sub.option("--json", "JSON envelope output");
    sub.action(async (...args: unknown[]) => {
      const result = await callEndpoint(action, { baseUrl, token });
      const lastArg = args[args.length - 1] as Record<string, unknown>;
      if (lastArg?.json) {
        console.log(JSON.stringify({ ok: true, data: result.data }, null, 2));
      } else {
        console.log(result.data);
      }
    });
  }
}
