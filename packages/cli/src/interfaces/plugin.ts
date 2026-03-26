/**
 * Plugin contract for code generation from IR.
 * Every plugin receives an IR and produces generated files.
 */

import type { IR } from "@/ir/types.js";

/** Options passed to plugin generate method. */
export interface PluginOptions {
  /** Output directory for generated files. */
  outputDir: string;
  /** Slugified application name (e.g. "my-app"). */
  appName?: string;
}

/** A file produced by a plugin. */
export interface GeneratedFile {
  /** Relative or absolute file path. */
  path: string;
  /** File content as string. */
  content: string;
}

/** Plugin interface — the universal contract for all generators. */
export interface IPlugin {
  /** Plugin name identifier. */
  name: string;
  /** Plugin version. */
  version: string;
  /** Generate files from an IR. */
  generate(ir: IR, options: PluginOptions): GeneratedFile[];
}
