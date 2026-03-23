# FuseCLI API — Agent Integration Strategy

## The Core Insight

Every AI coding agent in 2026 has a **Bash tool**. Not every agent has MCP.

```
Agent                  Bash Tool    MCP Support
─────────────────────  ─────────    ───────────
Claude Code            ✅ Yes       ✅ Yes
OpenAI Codex CLI       ✅ Yes       ✅ Yes (experimental)
Cursor                 ✅ Yes       ✅ Yes
Windsurf               ✅ Yes       ✅ Yes
Cline                  ✅ Yes       ✅ Yes
Aider                  ✅ Yes       ❌ No
Amp                    ✅ Yes       Partial
Devin                  ✅ Yes       ❌ No
GitHub Copilot (CLI)   ✅ Yes       ✅ Yes
```

**CLI via Bash is the universal denominator.** 9/9 agents support it. MCP: 6/9.

## Discovery: How Agents Find Our CLIs

### Layer 1: SKILL.md (Primary)

SKILL.md is the **open standard** for agent tool discovery (57,000+ skills on skills.sh).
Supported by: Claude Code, Codex CLI, Cursor, Gemini CLI, 20+ agents.

FuseCLI auto-generates SKILL.md from the OpenAPI spec:

```markdown
---
name: typefully-cli
description: CLI for Typefully API — manage drafts, schedules, and media
category: social
install_command: fusecli install typefully
---

# typefully-cli

Manage your Typefully account from the command line.
All commands support `--json` for structured output.

## Authentication

\`\`\`bash
typefully-cli auth set <your-api-token>
typefully-cli auth test  # verify token works
\`\`\`

## Commands

### typefully-cli drafts list
List all drafts with pagination.

\`\`\`bash
typefully-cli drafts list --json --limit 10
\`\`\`

**Options:**
- `--limit <n>` — Max results (default: 20)
- `--page <n>` — Page number (default: 1)
- `--sort <field>` — Sort field (e.g., created_at:desc)
- `--filter <expr>` — Filter (e.g., status=draft)

**Response:**
\`\`\`json
{
  "ok": true,
  "data": [
    { "id": "abc123", "content": "...", "status": "draft" }
  ],
  "meta": { "total": 42, "page": 1, "limit": 10 }
}
\`\`\`

### typefully-cli drafts create --content <text>
Create a new draft.

\`\`\`bash
typefully-cli drafts create --json --content "Hello world" --threadify
\`\`\`

**Required options:**
- `--content <text>` — Draft content

**Optional:**
- `--threadify` — Split into thread
- `--schedule-date <datetime>` — ISO 8601 date

**Response:**
\`\`\`json
{ "ok": true, "data": { "id": "abc123", "status": "draft" } }
\`\`\`

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | API Error (4xx/5xx) |
| 2 | Usage Error (wrong args) |
| 3 | Auth Error (no token) |
```

### Layer 2: AGENTS.md (OpenAI Codex)

For Codex CLI projects, generate an AGENTS.md entry:

```markdown
## Available CLI Tools

### typefully-cli
- **Purpose**: Manage Typefully drafts, schedules, and media
- **Auth**: Run `typefully-cli auth set <token>` before use
- **Output**: Always use `--json` flag for structured output
- **Docs**: Run `typefully-cli --help` for all commands
```

### Layer 3: --help (Universal)

Every CLI command has detailed `--help` with examples:

```
$ typefully-cli drafts --help
Usage: typefully-cli drafts [command] [options]

Manage Typefully drafts

Commands:
  list              List all drafts
  get <id>          Get a specific draft
  create            Create a new draft
  update <id>       Update an existing draft
  delete <id>       Delete a draft

Global Options:
  --json            Output as JSON
  --format <fmt>    text, json, csv, yaml
  --verbose         Debug logging

Examples:
  typefully-cli drafts list --limit 5 --json
  typefully-cli drafts create --content "Hello" --threadify
  typefully-cli drafts get abc123 --json
```

## Agent Interaction Patterns

### Pattern 1: Simple Query

```
Agent thinks: "I need to list the user's drafts on Typefully"
Agent calls: Bash("typefully-cli drafts list --json --limit 5")
Agent receives: { "ok": true, "data": [...], "meta": { "total": 12 } }
Agent responds: "You have 12 drafts. Here are the most recent 5: ..."
```

### Pattern 2: Create + Verify

```
Agent thinks: "User wants to create a draft"
Agent calls: Bash("typefully-cli drafts create --json --content 'Hello world'")
Agent receives: { "ok": true, "data": { "id": "abc123", "status": "draft" } }
Agent calls: Bash("typefully-cli drafts get abc123 --json")
Agent receives: { "ok": true, "data": { "id": "abc123", "content": "Hello world" } }
Agent responds: "Draft created successfully (ID: abc123)"
```

### Pattern 3: Error Handling

```
Agent calls: Bash("typefully-cli drafts list --json")
Agent receives: { "ok": false, "error": { "code": 401, "message": "Unauthorized", "suggestion": "Run: typefully-cli auth set <token>" } }
Exit code: 3
Agent responds: "Auth token not configured. Please provide your Typefully API token."
```

### Pattern 4: Piping (Advanced)

```
Agent thinks: "Get the first draft ID, then delete it"
Agent calls: Bash("typefully-cli drafts list --json | jq -r '.data[0].id'")
Agent receives: "abc123"
Agent calls: Bash("typefully-cli drafts delete abc123 --json")
```

## Why This Beats MCP

| Aspect | CLI via Bash | MCP Server |
|--------|:-------------|:-----------|
| Agent calls it | `Bash("cmd --json")` | `mcp_tool("name", {params})` |
| Discovery | SKILL.md + --help | Tool schema in context |
| Token cost | ~1,365/session | ~44,026/session (32x more) |
| Failure mode | Exit code + stderr | Silent timeout possible |
| Composability | Pipes, jq, grep | None |
| Offline | Yes | Often no |
| Debug | Run in terminal | Inspect MCP logs |
| Universal | ALL 9 agents | 6/9 agents |

## Skill Installation Paths

FuseCLI links SKILL.md to agent directories automatically:

```bash
fusecli link typefully
# Creates symlinks:
# ~/.claude/skills/typefully-cli/SKILL.md        → Claude Code
# ~/.cursor/skills/typefully-cli/SKILL.md        → Cursor
# ~/.codex/skills/typefully-cli/SKILL.md         → Codex CLI
# ~/.cline/skills/typefully-cli/SKILL.md         → Cline
# ~/.windsurf/skills/typefully-cli/SKILL.md      → Windsurf
```

Agent directories are auto-detected. Only existing directories get symlinks.

## MCP as Optional Thin Wrapper (Phase 9+)

For users who specifically need MCP, we can add a thin wrapper:

```bash
fusecli mcp-wrap typefully
# Generates a tiny MCP server that shells out to the CLI:
# tool("typefully_drafts_list", {limit}) → exec("typefully-cli drafts list --json --limit {limit}")
```

This ensures: one implementation (CLI), two interfaces (Bash + MCP).
The MCP server is literally a shell wrapper — zero logic duplication.
