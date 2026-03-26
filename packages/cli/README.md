<div align="center">

# @fusengine/fusecli

**OpenAPI in, CLI out — built for AI agents.**

[![npm](https://img.shields.io/npm/v/@fusengine/fusecli)](https://www.npmjs.com/package/@fusengine/fusecli)
[![License: Apache 2.0](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](../../LICENSE)
[![Bun](https://img.shields.io/badge/bun-%3E%3D1.2-14151a?logo=bun&logoColor=white)](https://bun.sh)

</div>

---

Generate production-ready CLI tools from any OpenAPI spec. Every AI agent has a Bash tool — FuseCLI turns APIs into CLI commands that agents call directly.

## Install

```bash
# npm
npm install -g @fusengine/fusecli

# bun (recommended)
bun add -g @fusengine/fusecli

# GitHub
npm install -g github:fusengine/fusecli
```

## Quick Start

```bash
# Generate a CLI from any OpenAPI spec
fusecli create exa \
  --openapi https://raw.githubusercontent.com/exa-labs/openapi-spec/refs/heads/master/exa-openapi-spec.yaml \
  --token "your-exa-api-key"

# Build the binary
fusecli bundle exa

# Link to PATH + AI agents
fusecli link exa

# Set your API key and search
exa-cli auth set "your-exa-api-key"
exa-cli search \
  --query "fusengine" \
  --num-results 3 \
  --json
```

## Commands

| Command | Description |
|---------|-------------|
| `fusecli create <app> --openapi <url>` | Generate CLI from OpenAPI spec |
| `fusecli bundle <app>` | Build standalone binary (~100KB) |
| `fusecli link <app>` | Add to PATH + link SKILL.md to AI agents |
| `fusecli run --openapi <url>` | Use API instantly without codegen |
| `fusecli explore --openapi <url>` | Browse API resources |
| `fusecli list` | Show installed CLIs |
| `fusecli doctor` | Check installation health |
| `fusecli update <app>` | Re-parse spec and regenerate |
| `fusecli remove <app>` | Uninstall CLI |
| `fusecli search <query>` | Search the registry |
| `fusecli install <source>` | Install from GitHub or registry |

## Why CLI over MCP?

| | CLI + `--json` | MCP Server |
|---|:-:|:-:|
| **Reliability** | 100% | 72% |
| **Tokens/session** | ~1,365 | ~44,026 (32x) |
| **Agent support** | 9/9 | 6/9 |

> *"Prefer CLI tools over MCP servers when both can accomplish the same task"* — [Anthropic docs](https://docs.anthropic.com/en/docs/claude-code)

## Agent Integration

FuseCLI generates a **SKILL.md** for every CLI. When linked, AI agents discover it automatically:

```bash
fusecli link exa
# Creates symlinks in: ~/.claude/skills/, ~/.cursor/skills/, ~/.codex/skills/
```

## Full Documentation

See the [main repository](https://github.com/fusengine/fusecli) for full documentation, architecture details, and contributing guidelines.

## License

Apache 2.0 — [Fusengine](https://fusengine.ch)
