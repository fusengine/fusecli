# FuseCLI API — Vision & Positioning

## What Is FuseCLI API?

**The CLI-first API tooling platform for AI agents and developers.**

FuseCLI API transforms any REST API (via OpenAPI spec) into a production-ready CLI tool that AI coding agents (Claude Code, Codex CLI, Cursor, Windsurf, Cline) can call natively via shell — no MCP server, no protocol overhead, no schema bloat.

## Core Thesis

> **CLI IS the universal agent interface.**
>
> Every AI coding agent has a Bash tool. Not every agent has MCP.
> CLI with `--json` is 100% reliable, 32x cheaper in tokens, and works offline.
> SKILL.md makes it discoverable. OpenAPI makes it auto-generable.

## Why CLI > MCP for Agent Tooling

| Metric | CLI + `--json` | MCP Server |
|--------|:--------------:|:----------:|
| Reliability | **100%** (Scalekit, 75 runs) | 72% (TCP timeouts) |
| Tokens/session | **~1,365** | ~44,026 (32x more) |
| Cost/10K ops/month | **$3.20** | $55.20 |
| Setup required | None (PATH) | Separate process, transport, env vars |
| Works offline | Yes | Often requires network |
| Error handling | Explicit (exit code + stderr) | Can be silent |
| Agent support | ALL agents (Bash is universal) | Only MCP-compatible agents |

Source: Scalekit benchmark (March 2026), Anthropic official docs.

## Target Users

1. **AI Agent builders** — Give your agent access to any API in 30 seconds
2. **API providers** — Ship a CLI + SKILL.md alongside your API docs
3. **DevOps/Platform teams** — Standardized CLI wrappers for internal APIs
4. **Solo developers** — Personal CLI toolkit for APIs you use daily

## Tagline Options

- "Any API. One CLI. Every Agent."
- "OpenAPI in, Agent-ready CLI out."
- "The universal API bridge for AI agents."

## Competitive Landscape

| Tool | Approach | Weakness |
|------|----------|----------|
| api2cli | Template + manual resources | No OpenAPI parsing, manual work |
| openapi-generator | Java-based codegen | Heavy, non-idiomatic TS, 4500+ issues |
| @hey-api/openapi-ts | SDK generation | No CLI output, SDK only |
| ocli | Runtime interpreter | No codegen, no SKILL.md |
| mcp2cli | MCP-to-CLI bridge | Requires existing MCP server |
| Speakeasy/Fern | SaaS codegen | $250+/month, closed source |

**FuseCLI API fills the gap**: open-source, TypeScript-native, OpenAPI → CLI + SKILL.md, agent-first, zero MCP dependency.

## Non-Goals (v1)

- Not a general-purpose CLI framework (use Commander/oclif for that)
- Not an API gateway or proxy
- Not a testing framework (though we generate tests)
- Not a documentation generator (though we generate SKILL.md)
- MCP is optional/bonus, never the primary interface
