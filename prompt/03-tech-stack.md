# FuseCLI API — Tech Stack 2026

## Runtime & Language

| Component | Choice | Why |
|-----------|--------|-----|
| **Runtime** | Bun 1.2+ | 8-15ms cold start (vs 60-120ms Node), standalone binary via `bun build --compile`, built-in test runner, native TypeScript |
| **Language** | TypeScript 5.7+ strict | Type safety, ecosystem, no `any` allowed |
| **Target** | ES2022 | Modern syntax, top-level await |

## Monorepo & Build

| Component | Choice | Why |
|-----------|--------|-----|
| **Package manager** | pnpm | Fast, disk-efficient, strict dependency resolution |
| **Workspace** | pnpm workspaces | Native, no extra tool needed |
| **Build orchestration** | Turborepo | Remote caching, incremental builds, parallel execution |
| **Bundler** | Bun build | Built into runtime, zero config, tree-shaking |
| **Versioning** | Changesets | Standard for pnpm monorepos, automated CHANGELOG |

## CLI Framework

| Component | Choice | Why |
|-----------|--------|-----|
| **CLI parsing** | Commander.js 14+ | 50M dl/week, battle-tested, subcommands, global options |
| **Interactive prompts** | @clack/prompts | Beautiful UX, lightweight, TypeScript-native |
| **Colors** | picocolors | Smallest (3.8KB), zero deps, fastest |
| **Spinners** | nanospinner | Tiny, works in CI, respects NO_COLOR |

## OpenAPI & Code Generation

| Component | Choice | Why |
|-----------|--------|-----|
| **OpenAPI parsing** | Custom parser (inspired by @hey-api/openapi-ts) | Full control over IR, support 2.0/3.0/3.1 |
| **$ref resolution** | @apidevtools/json-schema-ref-parser | Battle-tested, handles circular refs |
| **YAML parsing** | yaml (npm) | Full YAML 1.2 spec, 10M dl/week |
| **AST generation** | ts-morph v27 | High-level TypeScript AST API, 9.6M dl/week |
| **Schema validation** | Zod v4 | Standard 2026, runtime validation, great error messages |

## Generated CLI Dependencies

Minimal footprint for generated CLIs:

| Dependency | Size | Purpose |
|------------|------|---------|
| commander | 180KB | CLI parsing (0 deps) |
| picocolors | 3.8KB | Terminal colors (0 deps) |
| zod | ~50KB | Input validation (0 deps) |

**Total: ~234KB** — no bloat.

## Testing

| Component | Choice | Why |
|-----------|--------|-----|
| **Test runner** | Bun test | Zero deps, built into runtime, fast |
| **Mocking** | Bun mock | Built-in, no external library |
| **E2E testing** | Real HTTP via test server | Integration tests against actual specs |

## Code Quality

| Component | Choice | Why |
|-----------|--------|-----|
| **Linter + Formatter** | Biome 2.x | 10-100x faster than ESLint, unified tool |
| **Type checking** | tsc --noEmit | Strict mode, no any |
| **Git hooks** | lefthook | Fast, Go-based, replaces husky+lint-staged |

## Web Registry (Phase 7)

| Component | Choice | Why |
|-----------|--------|-----|
| **Framework** | Next.js 16+ | App Router, Server Components, ISR |
| **Database** | Neon PostgreSQL | Serverless, auto-scaling |
| **ORM** | Drizzle | Type-safe, lightweight, SQL-like API |
| **Payments** | Stripe | Sponsor subscriptions |
| **Rate limiting** | Upstash Redis | Serverless, per-route limits |
| **Email** | Resend | Transactional (welcome, publish notifications) |

## Agent Integration Standards

| Standard | Support | Purpose |
|----------|---------|---------|
| **SKILL.md** | First-class | Agent discovery (Claude Code, Codex, Cursor, 20+ agents) |
| **AGENTS.md** | Generated | OpenAI Codex CLI project context |
| **--help** | Native | Universal CLI discovery |
| **--json** | All commands | Machine-readable output |
| **Exit codes** | Standardized | 0=success, 1=API error, 2=usage error |
