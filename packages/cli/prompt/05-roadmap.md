# FuseCLI API — Development Roadmap

## Phase Overview

```
Phase 1: Core Foundation        ██████████░░░░░░░░░░  (Week 1-2)
Phase 2: Plugin CLI             ████████░░░░░░░░░░░░  (Week 2-3)
Phase 3: Plugin SKILL.md        ████░░░░░░░░░░░░░░░░  (Week 3)
Phase 4: Runtime Interpreter    ████████░░░░░░░░░░░░  (Week 3-4)
Phase 5: CLI Manager            ██████████████░░░░░░  (Week 4-6)
Phase 6: Plugin Tests           ████░░░░░░░░░░░░░░░░  (Week 6)
Phase 7: Web Registry           ████████████░░░░░░░░  (Week 7-9)
Phase 8: Polish & Launch        ████████░░░░░░░░░░░░  (Week 9-10)
```

---

## Phase 1: Core Foundation (Parser + IR)

**Goal**: Parse any OpenAPI spec → produce IR → validate it works.

### 1.1 — Monorepo Setup
- [ ] Init pnpm workspace + Turborepo
- [ ] Create `tsconfig.base.json` (strict, ES2022, no any)
- [ ] Configure Biome 2.x (lint + format)
- [ ] Setup `packages/core/` structure
- [ ] Setup `packages/shared/` structure

### 1.2 — IR Type Definitions
- [ ] `packages/core/src/ir/types.ts` — All IR types (<90 LOC)
- [ ] `packages/core/src/interfaces/plugin.ts` — IPlugin contract
- [ ] `packages/core/src/interfaces/generator.ts` — IGenerator contract

### 1.3 — OpenAPI Parser
- [ ] `packages/core/src/parser/index.ts` — parseSpec() entry (<90 LOC)
- [ ] `packages/core/src/parser/openapi-v3.ts` — v3.0/3.1 handler (<90 LOC)
- [ ] `packages/core/src/parser/swagger-v2.ts` — v2.0 handler (<90 LOC)
- [ ] `packages/core/src/parser/ref-resolver.ts` — $ref resolution (<90 LOC)

### 1.4 — IR Builder
- [ ] `packages/core/src/ir/builder.ts` — Build IR from parsed spec (<90 LOC)
- [ ] `packages/core/src/ir/validator.ts` — Validate IR completeness (<90 LOC)
- [ ] Resource grouping (by tags → path → operationId)
- [ ] Action naming convention (GET /resources → "list", etc.)

### 1.5 — Zod Schema Generator
- [ ] `packages/core/src/schemas/primitives.ts` — Type mapping (<90 LOC)
- [ ] `packages/core/src/schemas/generator.ts` — OpenAPI → Zod code (<90 LOC)
- [ ] Handle: string formats, enums, min/max, patterns, nested objects, arrays

### 1.6 — Tests: Parser + IR
- [ ] `tests/parser.test.ts` — Parse Petstore v3, v2
- [ ] `tests/ir.test.ts` — Validate IR output structure
- [ ] `fixtures/petstore-v3.yaml` — Standard test fixture
- [ ] `fixtures/petstore-v2.json` — Swagger 2.0 fixture

**Deliverable**: `parseSpec("./petstore.yaml")` returns complete IR with resources, actions, Zod schemas.

---

## Phase 2: Plugin CLI (Code Generation)

**Goal**: IR → generated TypeScript CLI with Commander.js + Zod validation.

### 2.1 — Shared Libraries
- [ ] `packages/shared/src/interfaces/http-client.ts` — IHttpClient
- [ ] `packages/shared/src/interfaces/auth-strategy.ts` — IAuthStrategy
- [ ] `packages/shared/src/interfaces/output-format.ts` — IOutputFormatter
- [ ] `packages/shared/src/http/client.ts` — HTTP client with retry (<90 LOC)
- [ ] `packages/shared/src/http/retry.ts` — Retry strategy (<50 LOC)
- [ ] `packages/shared/src/auth/token-store.ts` — Secure token storage (<60 LOC)
- [ ] `packages/shared/src/auth/bearer.ts` — Bearer strategy (<30 LOC)
- [ ] `packages/shared/src/auth/api-key.ts` — API key strategy (<30 LOC)
- [ ] `packages/shared/src/auth/basic.ts` — Basic strategy (<30 LOC)
- [ ] `packages/shared/src/output/dispatcher.ts` — Format dispatcher (<40 LOC)
- [ ] `packages/shared/src/output/json.ts` — JSON envelope (<40 LOC)
- [ ] `packages/shared/src/output/text.ts` — Pretty table (<80 LOC)
- [ ] `packages/shared/src/output/csv.ts` — CSV formatter (<40 LOC)
- [ ] `packages/shared/src/output/yaml.ts` — YAML formatter (<40 LOC)
- [ ] `packages/shared/src/errors/cli-error.ts` — CliError class (<50 LOC)
- [ ] `packages/shared/src/errors/handler.ts` — Error handler (<50 LOC)
- [ ] `packages/shared/src/logger.ts` — Logger (<40 LOC)

### 2.2 — CLI Code Generator (ts-morph)
- [ ] `packages/plugin-cli/src/index.ts` — Plugin entry (<50 LOC)
- [ ] `packages/plugin-cli/src/resource-gen.ts` — Resource file generation (<90 LOC)
- [ ] `packages/plugin-cli/src/command-gen.ts` — Commander command generation (<90 LOC)
- [ ] `packages/plugin-cli/src/index-gen.ts` — index.ts entry generation (<50 LOC)
- [ ] `packages/plugin-cli/src/schema-file-gen.ts` — Zod schema files (<60 LOC)
- [ ] `packages/plugin-cli/src/package-gen.ts` — package.json generation (<40 LOC)

### 2.3 — Tests: Plugin CLI
- [ ] `tests/plugin-cli.test.ts` — Generate CLI from Petstore IR
- [ ] Verify generated code compiles (`tsc --noEmit`)
- [ ] Verify generated CLI runs (`bun run dist/index.js --help`)

**Deliverable**: `pluginCli.generate(ir)` returns complete CLI source files. Build + run works.

---

## Phase 3: Plugin SKILL.md

**Goal**: IR → complete SKILL.md for agent discovery.

### 3.1 — SKILL.md Generator
- [ ] `packages/plugin-skill/src/index.ts` — Plugin entry (<50 LOC)
- [ ] `packages/plugin-skill/src/skill-gen.ts` — SKILL.md generation (<90 LOC)
- [ ] Generate: frontmatter, commands section, examples, response formats
- [ ] Include: every action with `--json` example + expected output shape
- [ ] Include: authentication setup instructions
- [ ] Include: exit codes documentation

### 3.2 — Tests: Plugin SKILL.md
- [ ] `tests/plugin-skill.test.ts` — Generate SKILL.md from Petstore IR
- [ ] Verify frontmatter YAML is valid
- [ ] Verify every resource/action is documented

**Deliverable**: Auto-generated SKILL.md that any AI agent can read and use the CLI.

---

## Phase 4: Runtime Interpreter

**Goal**: `fusecli run --openapi <url> <resource> <action>` — zero codegen.

### 4.1 — Runtime Engine
- [ ] `packages/runtime/src/index.ts` — Entry point (<50 LOC)
- [ ] `packages/runtime/src/command-builder.ts` — IR → Commander commands at runtime (<90 LOC)
- [ ] `packages/runtime/src/endpoint-caller.ts` — Execute HTTP from IR action (<80 LOC)

### 4.2 — Tests: Runtime
- [ ] `tests/runtime.test.ts` — Run against Petstore spec
- [ ] Test: `fusecli run --openapi petstore.yaml pets list --json`
- [ ] Test: `fusecli run --openapi petstore.yaml pets get 1 --json`

**Deliverable**: Instant API access from any OpenAPI spec without code generation.

---

## Phase 5: CLI Manager (fusecli command)

**Goal**: The user-facing `fusecli` tool that orchestrates everything.

### 5.1 — Core Manager
- [ ] `packages/cli/src/index.ts` — Commander program (<50 LOC)
- [ ] `packages/cli/src/lib/config.ts` — Config + env vars (<70 LOC)
- [ ] `packages/cli/src/lib/executor.ts` — Shell abstraction (<60 LOC)
- [ ] `packages/cli/src/lib/github.ts` — GitHub URL parsing (<50 LOC)
- [ ] `packages/cli/src/lib/prompts.ts` — Shared prompts (<40 LOC)
- [ ] `packages/cli/src/lib/validators.ts` — Input validation (<60 LOC)
- [ ] `packages/cli/src/lib/shell.ts` — PATH + rc management (<70 LOC)

### 5.2 — Commands
- [ ] `commands/create.ts` — fusecli create <app> --openapi <url> (<90 LOC)
- [ ] `commands/run.ts` — fusecli run --openapi <url> (<50 LOC, delegates to runtime)
- [ ] `commands/bundle.ts` — fusecli bundle <app> (<60 LOC)
- [ ] `commands/link.ts` — fusecli link <app> (<60 LOC)
- [ ] `commands/install.ts` — fusecli install <source> (<80 LOC)
- [ ] `commands/publish.ts` — fusecli publish <app> (<70 LOC)
- [ ] `commands/search.ts` — fusecli search <query> (<70 LOC)
- [ ] `commands/list.ts` — fusecli list (<50 LOC)
- [ ] `commands/doctor.ts` — fusecli doctor (<50 LOC)
- [ ] `commands/update.ts` — fusecli update <app> (<50 LOC)
- [ ] `commands/remove.ts` — fusecli remove <app> (<40 LOC)
- [ ] `commands/explore.ts` — fusecli explore --openapi <url> (<70 LOC, TUI)

### 5.3 — E2E Test
- [ ] `tests/e2e/petstore.test.ts` — Full flow: create → bundle → link → use
- [ ] Test: `fusecli create petstore --openapi fixtures/petstore-v3.yaml`
- [ ] Test: `petstore-cli pets list --json`
- [ ] Test: `petstore-cli pets get 1 --json`

**Deliverable**: Complete `fusecli` binary. Full lifecycle works.

---

## Phase 6: Plugin Tests

**Goal**: Auto-generate test suites for generated CLIs.

### 6.1 — Test Generator
- [ ] `packages/plugin-tests/src/index.ts` — Plugin entry (<50 LOC)
- [ ] `packages/plugin-tests/src/test-gen.ts` — Generate Bun test files (<90 LOC)
- [ ] Generate: unit tests (Zod validation), integration tests (mock HTTP)
- [ ] Test coverage for every action: list, get, create, update, delete

### 6.2 — Tests: Plugin Tests
- [ ] `tests/plugin-tests.test.ts` — Generate tests from Petstore IR
- [ ] Verify generated tests pass

**Deliverable**: Every generated CLI ships with a complete test suite.

---

## Phase 7: Web Registry (fusecli.dev)

**Goal**: Public marketplace for sharing generated CLIs + skills.

### 7.1 — Database & API
- [ ] Drizzle schema (skills, sponsors, votes)
- [ ] API routes: CRUD skills, search, publish, vote
- [ ] Rate limiting (Upstash Redis)
- [ ] GitHub repo metadata extraction

### 7.2 — Frontend
- [ ] Homepage with search
- [ ] CLI detail pages
- [ ] Documentation (MDX)
- [ ] Sponsor management + Stripe

### 7.3 — Registry Integration
- [ ] `fusecli publish <app>` → registry API
- [ ] `fusecli install <name>` → registry lookup → GitHub clone
- [ ] `fusecli search <query>` → registry search with relevance scoring

**Deliverable**: Public registry at fusecli.dev.

---

## Phase 8: Polish & Launch

### 8.1 — Documentation
- [ ] README.md with quickstart
- [ ] Full docs site (getting started, create, resources, publish)
- [ ] Video demo: "OpenAPI to Agent-ready CLI in 30 seconds"

### 8.2 — Distribution
- [ ] npm publish: @fusecli/cli, @fusecli/core, @fusecli/shared, plugins
- [ ] GitHub releases with binaries (bun build --compile)
- [ ] SKILL.md for FuseCLI itself (meta!)

### 8.3 — CI/CD
- [ ] GitHub Actions: test, lint, build, publish
- [ ] Changesets for versioning
- [ ] Release automation

**Deliverable**: Public launch. npm install -g @fusecli/cli works.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Parse Petstore v3 spec | < 100ms |
| Generate CLI from spec | < 500ms |
| Generated CLI cold start | < 20ms (Bun) |
| Files per package | ALL < 90 LOC |
| Test coverage | > 80% |
| npm install size (CLI) | < 5MB |
| Generated CLI deps | 3 (commander, picocolors, zod) |
| Time: spec → working CLI | < 30 seconds |
