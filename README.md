<div align="center">

# FuseCLI

**OpenAPI in, CLI out — built for AI agents.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![Bun](https://img.shields.io/badge/bun-%3E%3D1.2-14151a?logo=bun&logoColor=white)](https://bun.sh) [![TypeScript](https://img.shields.io/badge/typescript-5.9-3178c6?logo=typescript&logoColor=white)](https://typescriptlang.org) [![Build](https://img.shields.io/badge/build-0.37MB%20%C2%B7%207ms-22c55e)]()

[Quick Start](#quick-start) · [Why CLI?](#why-cli-over-mcp) · [Commands](#commands) · [Agent Integration](#agent-integration) · [Contributing](#contributing)

</div>

---

> Every AI coding agent has a Bash tool. Not every agent has MCP.
> FuseCLI generates standalone CLI tools from OpenAPI specs that any agent can call via shell.
> No MCP server. No schema bloat. No protocol overhead.

---

## Quick Start

```bash
# Install
bun add -g @fusecli/cli

# Generate a CLI from any OpenAPI spec
fusecli create exa --openapi https://raw.githubusercontent.com/exa-labs/openapi-spec/refs/heads/master/exa-openapi-spec.yaml

# Build the binary
fusecli bundle exa

# Set your API key and search
exa-cli auth set "your-exa-api-key"
exa-cli search --query "fusengine" --num-results 3 --json
```

**Real output** (tested March 2026):

```json
{
  "ok": true,
  "data": {
    "results": [
      { "title": "GitHub - fusengine/agents", "url": "https://github.com/fusengine/agents" },
      { "title": "Bruno Azoulay fusengine - GitHub", "url": "https://github.com/fusengine" },
      { "title": "generating-components | LobeHub", "url": "https://lobehub.com/skills/fusengine-agents-generating-components" }
    ],
    "searchTime": 551.1
  }
}
```

## Why CLI over MCP?

| | CLI + `--json` | MCP Server |
|---|:-:|:-:|
| **Reliability** | 100% | 72% |
| **Tokens/session** | ~1,365 | ~44,026 (32x) |
| **Cost/10K ops** | $3.20 | $55.20 |
| **Agent support** | 9/9 | 6/9 |
| **Works offline** | Yes | Often no |
| **Error handling** | Exit code + stderr | Can be silent |

> *"Prefer CLI tools over MCP servers when both can accomplish the same task"*
> — [Anthropic official docs](https://docs.anthropic.com/en/docs/claude-code)

Source: [Scalekit benchmark, 75 runs, March 2026](https://www.scalekit.com/blog/mcp-vs-cli-use)

## Tested APIs

| API | What it does | Status |
|-----|-------------|--------|
| [Exa](https://exa.ai) | Web search | Real search results via `exa-cli search --query "..." --json` |
| [Context7](https://context7.com) | Library docs | Real library search via `context7-cli search --query "react" --json` |
| [Petstore](https://petstore3.swagger.io) | Demo CRUD | `petstore-cli pets list/get/create/delete --json` |

Any API with an OpenAPI spec works. Local files and remote URLs supported.

## Features

| Feature | Description |
|---------|-------------|
| **OpenAPI parsing** | 2.0 (Swagger) + 3.0 + 3.1, local files and remote URLs |
| **Standalone output** | Generated CLIs have zero external dependencies (only commander + zod) |
| **`--json` envelope** | Every command outputs `{ ok, data, meta }` for agents |
| **SKILL.md** | Auto-generated agent discovery file, linked to Claude/Cursor/Codex |
| **Body → options** | Request body fields become CLI options with type coercion |
| **Smart flattening** | Single-action resources skip useless subcommand nesting |
| **Circular $ref** | Handles circular references in OpenAPI specs |
| **Retry** | Exponential backoff on 429/5xx (3 retries) |
| **Reserved words** | JS reserved words in body fields handled automatically |
| **Dynamic workflows** | Auto-detects producer→consumer chains from parameter semantics |
| **`--token`** | Store API key during `create` — no separate `auth set` needed |
| **Overrides** | `--base-url`, `--auth-type`, `--auth-header`, `--docs` override spec values |

## Installation

```bash
# Bun (recommended)
bun add -g @fusecli/cli

# npm
npm install -g @fusecli/cli
```

**Requirement**: [Bun](https://bun.sh) 1.2+

## Commands

### Generate

| Command | Description |
|---------|-------------|
| `fusecli create <app> --openapi <url>` | Parse spec, generate CLI + SKILL.md, install deps |
| `fusecli bundle <app>` | Build standalone binary (~100KB) |
| `fusecli link <app>` | Add to PATH + symlink SKILL.md to agent directories |

### Use

| Command | Description |
|---------|-------------|
| `fusecli run --openapi <url>` | Zero-codegen: parse and call instantly, no install |
| `fusecli explore --openapi <url>` | Browse API resources and actions |

### Manage

| Command | Description |
|---------|-------------|
| `fusecli list` | Show installed CLIs |
| `fusecli doctor` | Check Bun, PATH, agent directories |
| `fusecli update <app>` | Re-parse spec and regenerate |
| `fusecli remove <app>` | Uninstall CLI + cleanup |
| `fusecli search <query>` | Search the registry |
| `fusecli install <source>` | Install from GitHub or registry |

## Generated CLI Pattern

Every generated CLI follows the same structure:

```bash
# Auth
<app>-cli auth set <token>        # Store API key (chmod 600)
<app>-cli auth show               # Display masked token
<app>-cli auth test               # Verify token works

# Resources (auto-generated from spec)
<app>-cli <resource> list --json
<app>-cli <resource> get <id> --json
<app>-cli <resource> create --field "value" --json
<app>-cli <resource> delete <id> --json
```

### Global Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--json` | JSON envelope output | off |
| `--format <fmt>` | text, json, csv, yaml | text |
| `--verbose` | Debug logging | off |

### JSON Envelope

```json
{
  "ok": true,
  "data": { "id": "abc123", "name": "..." },
  "meta": { "total": 42, "page": 1 }
}
```

### Exit Codes

| Code | Meaning | When |
|------|---------|------|
| 0 | Success | Command completed |
| 1 | API Error | HTTP 4xx/5xx |
| 2 | Usage Error | Bad arguments |
| 3 | Auth Error | No token |
| 4 | Network Error | Timeout, DNS |
| 5 | Parse Error | Invalid spec |

## Agent Integration

FuseCLI generates a **SKILL.md** for every CLI. When linked, AI agents discover it automatically:

```bash
fusecli link exa
```

Creates symlinks in detected agent directories:

```
~/.claude/skills/exa-cli/SKILL.md     → Claude Code
~/.cursor/skills/exa-cli/SKILL.md     → Cursor
~/.codex/skills/exa-cli/SKILL.md      → Codex CLI
~/.windsurf/skills/exa-cli/SKILL.md   → Windsurf
~/.cline/skills/exa-cli/SKILL.md      → Cline
```

**How agents use it:**

```
User: "Search for AI agent frameworks"

Agent reads SKILL.md → knows exa-cli exists
Agent: Bash("exa-cli search --query 'AI agent frameworks 2026' --num-results 5 --json")
Agent: "I found 5 results: ..."
```

The agent never needs MCP. It calls the CLI via Bash and reads the JSON output.

## Architecture

```
fusecliapi/
├── src/
│   ├── index.ts           # Entry point
│   ├── commands/           # 11 CLI commands
│   ├── parser/             # OpenAPI 2.0/3.0/3.1 parser + $ref resolver
│   ├── ir/                 # Intermediate Representation builder
│   ├── generators/         # CLI code + SKILL.md generators
│   ├── templates/          # Standalone lib code emitters
│   ├── runtime/            # Zero-codegen interpreter
│   ├── lib/                # Shared utilities
│   └── interfaces/         # Plugin contract
├── tests/                  # 48 tests, 0 failures
├── fixtures/               # OpenAPI test specs
└── prompt/                 # Design documents
```

Single `package.json`. Single `tsconfig.json`. One `bun build` → 0.37 MB binary in 7ms.

## Tech Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Runtime | Bun 1.2+ | 7ms build, native TS |
| Language | TypeScript 5.9 strict | Type safety |
| CLI | Commander.js 14 | Battle-tested |
| Validation | Zod 4 | Runtime type checking |
| Linter | Biome 2.4 | 100x faster than ESLint |
| Tests | Bun test | Zero deps |

## Development

```bash
git clone https://github.com/fusengine/fusecliapi.git
cd fusecliapi

bun install          # Install dependencies
bun run build        # Build binary (0.37 MB, 7ms)
bun test             # Run 48 tests
bun run lint         # Biome check

# Test E2E
./dist/index.js create petstore --openapi ./fixtures/petstore-v3.yaml
./dist/index.js bundle petstore
~/.fuse/bin/petstore-cli --help
```

## Documentation

| Doc | Description |
|-----|-------------|
| [Getting Started](./docs/getting-started.md) | Install + first CLI in 60 seconds |
| [Commands](./docs/commands.md) | All 11 commands with examples |
| [Agent Integration](./docs/agent-integration.md) | How AI agents discover and use CLIs |
| [OpenAPI Specs](./docs/openapi-specs.md) | Finding specs, writing your own, auth types |
| [Generated CLI](./docs/generated-cli.md) | Structure, auth, output, errors, exit codes |
| [Architecture](./docs/architecture.md) | Internal design, pipeline, decisions |

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feat/my-feature`)
3. Make changes (all files < 100 lines, JSDoc on exports)
4. Run `bun test && bun run lint`
5. Open a PR

## Roadmap

- [x] OpenAPI parser (2.0/3.0/3.1)
- [x] CLI code generator (standalone, zero deps)
- [x] SKILL.md auto-generator
- [x] Zero-codegen runtime mode
- [x] 11 CLI commands
- [x] 48 tests passing
- [x] Exa + Context7 real-world tested
- [ ] fusecli.dev marketplace
- [ ] npm publish
- [ ] GitHub Actions CI/CD

## License

MIT — [Fusengine](https://fusengine.ch)
