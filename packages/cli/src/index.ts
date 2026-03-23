#!/usr/bin/env bun
/**
 * FuseCLI — Any API. One CLI. Every Agent.
 * Main entry point for the fusecli binary.
 * @module
 */

import { Command } from "commander";
import pc from "picocolors";
import { registerBundle } from "@/commands/bundle.js";
import { registerCreate } from "@/commands/create.js";
import { registerDoctor } from "@/commands/doctor.js";
import { registerExplore } from "@/commands/explore.js";
import { registerInstall } from "@/commands/install.js";
import { registerLink } from "@/commands/link.js";
import { registerList } from "@/commands/list.js";
import { registerRemove } from "@/commands/remove.js";
import { registerRun } from "@/commands/run.js";
import { registerSearch } from "@/commands/search.js";
import { registerUpdate } from "@/commands/update.js";
import { cliPlugin } from "@/generators/cli-plugin.js";
import { skillPlugin } from "@/generators/skill-plugin.js";

console.log(`${pc.bold(pc.cyan("fusecli"))}${pc.dim(" v0.1.0")}`);
console.log(pc.dim("Any API. One CLI. Every Agent."));
console.log(`${pc.magenta("powered by fusengine")}\n`);

const program = new Command()
  .name("fusecli")
  .version("0.1.0")
  .description("Generate production-ready CLIs from OpenAPI specs")
  .configureHelp({
    subcommandTerm: (cmd) => pc.cyan(cmd.name()) + (cmd.usage() ? ` ${pc.dim(cmd.usage())}` : ""),
  });

const plugins = [cliPlugin, skillPlugin];

registerCreate(program, plugins);
registerRun(program);
registerBundle(program);
registerLink(program);
registerInstall(program);
registerSearch(program);
registerList(program);
registerDoctor(program);
registerUpdate(program);
registerRemove(program);
registerExplore(program);

program.parse();
