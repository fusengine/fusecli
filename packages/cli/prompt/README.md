# FuseCLI API — Project Prompt & Roadmap

## Quick Summary

**FuseCLI API** transforms any REST API (via OpenAPI spec) into an agent-ready CLI tool.

**Core thesis**: CLI via Bash is the universal agent interface — 100% reliable, 32x cheaper than MCP, works with ALL AI coding agents.

## Documents

| File | Content |
|------|---------|
| [00-vision.md](./00-vision.md) | Vision, positioning, target users, competitive landscape |
| [01-architecture.md](./01-architecture.md) | Monorepo structure, pipeline design, package map |
| [02-improvements.md](./02-improvements.md) | 15 major improvements over api2cli |
| [03-tech-stack.md](./03-tech-stack.md) | Technology choices with justifications |
| [04-ir-specification.md](./04-ir-specification.md) | Intermediate Representation type definitions |
| [05-roadmap.md](./05-roadmap.md) | 8-phase development plan with tasks |
| [06-competitive-strategy.md](./06-competitive-strategy.md) | Head-to-head comparisons, USPs, growth strategy |
| [07-naming-and-commands.md](./07-naming-and-commands.md) | Command reference, exit codes, JSON envelope |
| [08-agent-integration.md](./08-agent-integration.md) | SKILL.md, AGENTS.md, agent patterns, CLI vs MCP |
| [09-fusengine-integration.md](./09-fusengine-integration.md) | Fusengine plugin, cross-agent collaboration, ecosystem synergy |
| [10-hooks-system.md](./10-hooks-system.md) | TypeScript hooks: build, runtime, Fusengine — all type-safe |
| [11-modular-architecture.md](./11-modular-architecture.md) | 7 modules, zero duplication, dependency graph, LOC budget |
| [12-validated-tasks.md](./12-validated-tasks.md) | Complete task list: phases 1-8 + bonus, validated status |

## Architecture at a Glance

```
OpenAPI Spec → Parser → IR → Plugins → CLI + SKILL.md + Tests
                                         │
                                         ▼
                              Agent calls via Bash("cmd --json")
```

## Key Differentiators

1. **OpenAPI → CLI + SKILL.md in 30 seconds** (no other tool does this)
2. **CLI-first** — 100% reliable, 32x cheaper than MCP, ALL agents supported
3. **Runtime + Codegen** — `fusecli run` for instant, `fusecli create` for production
4. **Plugin architecture** — community-extensible via IR contract
5. **Auto-generated tests** — every CLI ships with Bun test suite
6. **Zod v4 validation** — catch errors before API calls
7. **SOLID architecture** — every file < 90 LOC, interfaces for everything

## Phase Summary

| Phase | Goal | Timeline |
|-------|------|----------|
| 1. Core | Parser + IR + Zod schemas | Week 1-2 |
| 2. Plugin CLI | CLI code generation (ts-morph) | Week 2-3 |
| 3. Plugin SKILL | Auto-generated SKILL.md | Week 3 |
| 4. Runtime | Zero-codegen interpreter | Week 3-4 |
| 5. CLI Manager | fusecli command (create/bundle/link) | Week 4-6 |
| 6. Plugin Tests | Auto-generated test suites | Week 6 |
| 7. Web Registry | fusecli.dev marketplace | Week 7-9 |
| 8. Launch | Docs, npm publish, CI/CD | Week 9-10 |
