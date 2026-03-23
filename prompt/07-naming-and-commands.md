# FuseCLI API — Naming & Command Reference

## Binary Name

**`fusecli`** — short, memorable, no conflict with existing tools.

```bash
npm install -g @fusecli/cli
# or
bun add -g @fusecli/cli
```

## npm Package Names

| Package | npm Name | Purpose |
|---------|----------|---------|
| CLI Manager | `@fusecli/cli` | Main binary |
| Core | `@fusecli/core` | Parser + IR |
| Shared | `@fusecli/shared` | Runtime libs for generated CLIs |
| Plugin CLI | `@fusecli/plugin-cli` | CLI code generator |
| Plugin SKILL | `@fusecli/plugin-skill` | SKILL.md generator |
| Plugin Tests | `@fusecli/plugin-tests` | Test suite generator |
| Runtime | `@fusecli/runtime` | Zero-codegen interpreter |

## Command Reference

### Core Commands

```bash
# Create a new CLI from OpenAPI spec (primary flow)
fusecli create <app> --openapi <url-or-path> [options]
  --openapi <url>        OpenAPI spec URL or local path (required for auto-gen)
  --base-url <url>       Override base URL from spec
  --auth-type <type>     bearer | api-key | basic | oauth2 (auto-detected from spec)
  --auth-header <name>   Custom auth header name
  --plugins <list>       Plugins to run: cli,skill,tests (default: cli,skill)
  --force                Overwrite existing CLI
  --no-install           Skip dependency installation

# Instant API access without code generation
fusecli run --openapi <url-or-path> [resource] [action] [options]
  --openapi <url>        OpenAPI spec URL or local path (required)
  --base-url <url>       Override base URL
  --token <token>        Auth token (or set via env var)
  --json                 Force JSON output

# Interactive API exploration
fusecli explore --openapi <url-or-path>
  --openapi <url>        OpenAPI spec URL or local path (required)

# Build CLI from source
fusecli bundle <app> [options]
  --compile              Create standalone binary (no Bun required)
  --minify               Minify output

# Add CLI to PATH + link skills
fusecli link <app> [options]
  --skills               Link SKILL.md to agent directories (default: true)
  --agents <list>        Agent dirs: claude,codex,cursor (default: all detected)
```

### Registry Commands

```bash
# Install from registry or GitHub
fusecli install <source> [options]
  <source>               Registry name, owner/repo, or full GitHub URL
  --force                Overwrite existing

# Search the registry
fusecli search <query> [options]
  --category <cat>       Filter by category
  --sort <field>         popular | votes | newest (default: popular)
  --limit <n>            Max results (default: 10)
  --json                 JSON output

# Publish to registry
fusecli publish <app> [options]
  --registry <url>       Custom registry URL

# List installed CLIs
fusecli list [options]
  --json                 JSON output
```

### Management Commands

```bash
# Update CLI (re-parse spec, regenerate changed resources)
fusecli update <app> [options]
  --openapi <url>        New/updated spec URL
  --diff                 Show changes without applying

# Remove CLI
fusecli remove <app> [options]
  --keep-token           Don't delete auth token

# Health check
fusecli doctor
  # Checks: Bun version, PATH, shell config, agent dirs, token perms

# Token management
fusecli tokens [options]
  --json                 JSON output
  # Lists all configured tokens (masked)
```

### Watch & Compose (Advanced)

```bash
# Watch spec for changes, auto-regenerate
fusecli watch --openapi <url-or-path> --app <app>
  --interval <ms>        Poll interval for remote URLs (default: 30000)

# Compose multiple APIs into one CLI
fusecli compose <name> [options]
  --api <name>:<url>     Add API (repeatable)
  # Example: fusecli compose devtools --api github:./gh.yaml --api linear:./lr.yaml
```

## Generated CLI Commands

Every generated CLI follows this pattern:

```bash
<app>-cli [global-options] <resource> <action> [action-options]

# Global options (always available)
  --json                 Output as JSON envelope
  --format <fmt>         text | json | csv | yaml (default: text)
  --verbose              Debug logging
  --no-color             Disable ANSI colors
  --no-header            Omit table/CSV headers
  --version              Show version
  --help                 Show help

# Auth (built-in)
<app>-cli auth set <token>
<app>-cli auth show [--raw]
<app>-cli auth test
<app>-cli auth remove

# Resources (auto-generated from spec)
<app>-cli <resource> list [--limit <n>] [--page <n>] [--sort <field>]
<app>-cli <resource> get <id>
<app>-cli <resource> create [--field <value>]...
<app>-cli <resource> update <id> [--field <value>]...
<app>-cli <resource> delete <id>
```

## Exit Codes

| Code | Meaning | When |
|------|---------|------|
| 0 | Success | Command completed successfully |
| 1 | API Error | HTTP 4xx/5xx from the API |
| 2 | Usage Error | Invalid arguments, missing required options |
| 3 | Auth Error | No token configured, token invalid |
| 4 | Network Error | Timeout, DNS failure, connection refused |
| 5 | Parse Error | Invalid OpenAPI spec |

## JSON Envelope (Standard)

```json
// Success
{
  "ok": true,
  "data": { ... },
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20
  }
}

// Error
{
  "ok": false,
  "error": {
    "code": 401,
    "message": "Unauthorized",
    "suggestion": "Run: typefully-cli auth set <token>"
  }
}
```
