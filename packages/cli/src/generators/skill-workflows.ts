/**
 * Auto-detects API workflows by analyzing parameter semantics.
 * No hardcoded patterns — producer-consumer relationships are inferred.
 */

import type { Action, Resource } from "@/ir/types.js";

/** Param names that indicate a search/query entry point (producer) */
const ENTRY_PARAMS = new Set([
  "query",
  "q",
  "search",
  "filter",
  "prompt",
  "question",
  "text",
  "keyword",
  "library-name",
  "term",
  "keywords",
]);

/** Param names that indicate a result consumer */
const CONSUMER_PARAMS = new Set([
  "id",
  "url",
  "urls",
  "uri",
  "href",
  "library-id",
  "project-id",
  "resource-id",
  "screen-id",
  "research-id",
  "document-id",
]);

interface CmdInfo {
  label: string;
  example: string;
  description: string;
  role: "entry" | "consumer" | "neutral";
}

/**
 * Build dynamic workflow section by detecting producer-consumer chains.
 * @param resources - IR resources to analyze.
 * @param binName - CLI binary name.
 * @returns Markdown lines for the Workflows section.
 */
export function buildWorkflows(resources: Resource[], binName: string): string[] {
  const commands: CmdInfo[] = [];
  for (const r of resources) {
    for (const a of r.actions) {
      const isSingle = r.actions.length === 1;
      const sub = isSingle ? "" : ` ${a.name}`;
      const opt = a.params.find((p) => p.location !== "path" && p.required);
      const flag = opt ? ` --${opt.cliName ?? opt.name} "..."` : "";
      commands.push({
        label: `${r.displayName ?? r.name}${isSingle ? "" : ` ${a.name}`}`,
        example: `${binName} ${r.name}${sub}${flag} --json`,
        description: a.description ?? `${a.method} ${a.path}`,
        role: detectRole(a),
      });
    }
  }
  const entries = commands.filter((c) => c.role === "entry");
  const consumers = commands.filter((c) => c.role === "consumer");
  if (!entries.length || !consumers.length) return [];

  const lines = ["## Workflows", ""];
  for (const entry of entries) {
    for (const consumer of consumers) {
      if (entry.label === consumer.label) continue;
      lines.push(`### ${entry.label} → ${consumer.label}`, "");
      lines.push("```bash");
      lines.push(`# Step 1: ${entry.description}`, entry.example);
      lines.push(`# Step 2: ${consumer.description} (use result from step 1)`, consumer.example);
      lines.push("```", "");
    }
  }
  return lines;
}

/** Detect if an action is an entry point, consumer, or neutral based on param names. */
function detectRole(action: Action): "entry" | "consumer" | "neutral" {
  for (const p of action.params) {
    if (CONSUMER_PARAMS.has((p.cliName ?? p.name).toLowerCase())) return "consumer";
  }
  for (const p of action.params) {
    if (ENTRY_PARAMS.has((p.cliName ?? p.name).toLowerCase())) return "entry";
  }
  return "neutral";
}
