# Agent Integration

## How It Works

FuseCLI generates a **SKILL.md** for every CLI. This file tells AI agents what the CLI does and how to use it.

```
fusecli create exa --openapi spec.yaml
fusecli bundle exa
fusecli link exa
```

After `link`, the SKILL.md is symlinked to agent directories:

```
~/.claude/skills/exa-cli/SKILL.md     → Claude Code
~/.cursor/skills/exa-cli/SKILL.md     → Cursor
~/.codex/skills/exa-cli/SKILL.md      → Codex CLI
~/.windsurf/skills/exa-cli/SKILL.md   → Windsurf
~/.cline/skills/exa-cli/SKILL.md      → Cline
```

## What's in the SKILL.md

The SKILL.md is auto-generated from the OpenAPI spec:

```markdown
---
name: exa-cli
description: CLI for Exa Search API — search the web with AI
category: search
install_command: fusecli install exa
---

# exa-cli

## Commands

### exa-cli search --query <text>
Search the web using AI.

Options:
  --query <text>         Search query (required)
  --num-results <n>      Number of results (default: 10)
  --json                 JSON output

Example:
  exa-cli search --query "typescript frameworks" --num-results 5 --json

Response:
  { "ok": true, "data": { "results": [...] } }
```

## How Agents Use It

### Claude Code

When a user asks "search for typescript frameworks", Claude Code:

1. Reads SKILL.md → knows `exa-cli` exists and what it does
2. Calls `Bash("exa-cli search --query 'typescript frameworks' --num-results 5 --json")`
3. Receives JSON response
4. Summarizes results for the user

### Codex CLI

Same pattern but via the `shell` tool:

1. Reads SKILL.md from `~/.codex/skills/`
2. Executes the CLI command
3. Parses JSON output

### Cursor / Windsurf / Cline

All follow the same pattern: discover via SKILL.md, call via terminal, read JSON output.

## Why CLI Instead of MCP

| | CLI | MCP |
|---|---|---|
| **Discovery** | SKILL.md (loaded on demand, ~50 tokens) | Tool schemas (loaded at start, ~1000 tokens per tool) |
| **Call** | `Bash("cmd --json")` | `mcp_tool("name", {params})` |
| **Failure** | Exit code + stderr (explicit) | Can be silent |
| **Composability** | Pipes: `cmd --json \| jq '.data[0]'` | None |
| **Agent support** | 9/9 agents | 6/9 agents |

## Token Cost Comparison

For a session that calls an API 10 times:

**MCP**: ~44,000 tokens (schema loaded once: ~40K + 10 calls: ~4K)

**CLI**: ~10,000 tokens (SKILL.md loaded once: ~200 + 10 calls: ~10K)

Source: [Scalekit benchmark, 75 runs](https://www.scalekit.com/blog/mcp-vs-cli-use)

## Auto-Generated Workflows

FuseCLI detects command workflows automatically by analyzing parameter semantics — no hardcoded patterns.

**How it works:**
- Parameters like `--query`, `--search`, `--prompt` → detected as **entry points** (producers)
- Parameters like `--id`, `--url`, `--library-id` → detected as **consumers** (need output from another command)
- Workflows are generated as **producer → consumer** chains

**Example: Context7 CLI** (auto-detected)
```bash
# Workflow: Search → Context
# Step 1: Search for libraries
context7-public-api-cli search --library-name "react" --json
# Step 2: Get documentation (use library-id from step 1)
context7-public-api-cli context --library-id "/facebook/react" --json
```

**Example: Exa CLI** (auto-detected)
```bash
# Workflow: Search → Answer
# Step 1: Search for context
exa-search-api-cli search --query "zustand state management" --json
# Step 2: Get AI answer
exa-search-api-cli answer --query "how to use zustand?" --json
```

Every API produces different workflows based on its own parameters. No configuration needed.

## Progressive Disclosure

SKILL.md uses progressive disclosure:

1. **At startup**: Only the frontmatter is loaded (~50 tokens)
2. **When relevant**: The full SKILL.md is loaded (~200 tokens)
3. **When called**: The actual command + JSON response (~500 tokens per call)

This means unused CLIs cost almost nothing in context.
