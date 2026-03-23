# FuseCLI API — Modular Architecture (Zero Duplication)

## Core Principle

Every piece of logic exists in ONE place. Modules import, never copy.
If 2 modules need the same thing → it lives in a shared module.

## Module Dependency Graph

```
                  @fusecli/core
                 ┌──────────────┐
                 │  ir/types    │  ← THE source of truth for all types
                 │  interfaces/ │  ← ALL contracts live here
                 │  parser/     │  ← OpenAPI → raw parsed data
                 │  schemas/    │  ← Zod code generation
                 └──────┬───────┘
                        │ exports types + parser + schemas
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
   @fusecli/shared  @fusecli/runtime  @fusecli/cli
   ┌────────────┐   ┌────────────┐   ┌────────────┐
   │ http/      │   │ interprets │   │ commands/  │
   │ auth/      │   │ IR at      │   │ lib/       │
   │ output/    │   │ runtime    │   │ manager    │
   │ errors/    │   └─────┬──────┘   └─────┬──────┘
   │ logger     │         │                │
   └─────┬──────┘         │                │
         │                │                │
         │    imports      │    imports     │
         ▼   @fusecli/    ▼    @fusecli/   ▼
   @fusecli/plugin-cli    │    @fusecli/plugin-skill
   @fusecli/plugin-tests  │    @fusecli/plugin-sdk
                          │
                     ALL plugins import from
                     @fusecli/core (types)
                     @fusecli/shared (runtime utils)
```

## The 7 Modules

### Module 1: `@fusecli/core` — Types + Parser + Schemas

The foundation. Every other module imports from here.
**Never imports from any other @fusecli package.**

```
packages/core/
├── src/
│   ├── index.ts                    # Public API barrel export (<30 LOC)
│   ├── ir/
│   │   ├── types.ts                # ALL IR types (<90 LOC)
│   │   ├── builder.ts              # Parsed spec → IR (<90 LOC)
│   │   ├── validator.ts            # Validate IR completeness (<60 LOC)
│   │   ├── resource-grouper.ts     # Group endpoints → resources (<70 LOC)
│   │   └── action-namer.ts         # HTTP method → action name (<50 LOC)
│   ├── parser/
│   │   ├── index.ts                # parseSpec() entry (<40 LOC)
│   │   ├── openapi-v3.ts           # v3.0/3.1 handler (<80 LOC)
│   │   ├── swagger-v2.ts           # v2.0 handler (<80 LOC)
│   │   └── ref-resolver.ts         # $ref resolution (<70 LOC)
│   ├── schemas/
│   │   ├── generator.ts            # OpenAPI schema → Zod code (<80 LOC)
│   │   ├── primitives.ts           # Primitive type mapping (<50 LOC)
│   │   └── type-mapper.ts          # Complex type mapping (<70 LOC)
│   └── interfaces/
│       ├── plugin.ts               # IPlugin contract (<30 LOC)
│       ├── generator.ts            # IGenerator contract (<25 LOC)
│       ├── formatter.ts            # IOutputFormatter contract (<25 LOC)
│       ├── http-client.ts          # IHttpClient contract (<30 LOC)
│       ├── auth-strategy.ts        # IAuthStrategy contract (<20 LOC)
│       └── hooks.ts                # FuseHooks + RuntimeHooks (<50 LOC)
├── package.json
└── tsconfig.json
```

**Exports**: types, parseSpec, buildIR, validateIR, generateZodSchemas, all interfaces.
**Dependencies**: yaml, @apidevtools/json-schema-ref-parser (parsing only).

### Module 2: `@fusecli/shared` — Runtime Libraries

Used by ALL generated CLIs. Imported, never copied.
**Imports from**: `@fusecli/core` (interfaces only).

```
packages/shared/
├── src/
│   ├── index.ts                    # Barrel export (<30 LOC)
│   ├── http/
│   │   ├── client.ts               # IHttpClient implementation (<80 LOC)
│   │   └── retry.ts                # Retry strategy (<45 LOC)
│   ├── auth/
│   │   ├── token-store.ts          # Read/write/delete tokens (<55 LOC)
│   │   ├── bearer.ts               # IAuthStrategy: Bearer (<25 LOC)
│   │   ├── api-key.ts              # IAuthStrategy: API Key (<25 LOC)
│   │   ├── basic.ts                # IAuthStrategy: Basic (<25 LOC)
│   │   ├── oauth.ts                # IAuthStrategy: OAuth2 (<50 LOC)
│   │   └── factory.ts              # Create strategy from config (<30 LOC)
│   ├── output/
│   │   ├── dispatcher.ts           # Route to correct formatter (<35 LOC)
│   │   ├── json.ts                 # IOutputFormatter: JSON envelope (<35 LOC)
│   │   ├── text.ts                 # IOutputFormatter: Pretty table (<80 LOC)
│   │   ├── csv.ts                  # IOutputFormatter: CSV (<40 LOC)
│   │   └── yaml.ts                 # IOutputFormatter: YAML (<35 LOC)
│   ├── errors/
│   │   ├── cli-error.ts            # CliError class (<45 LOC)
│   │   └── handler.ts              # handleError + exit codes (<50 LOC)
│   └── logger.ts                   # Logger (respects --json) (<35 LOC)
├── package.json
└── tsconfig.json
```

**Exports**: client, output, handleError, CliError, logger, auth strategies.
**Dependencies**: picocolors (colors only).

### Module 3: `@fusecli/plugin-cli` — CLI Code Generator

Generates TypeScript CLI from IR using ts-morph.
**Imports from**: `@fusecli/core` (types + interfaces).

```
packages/plugin-cli/
├── src/
│   ├── index.ts                    # IPlugin implementation (<40 LOC)
│   ├── resource-gen.ts             # Generate resource command files (<85 LOC)
│   ├── command-gen.ts              # Generate Commander commands (<85 LOC)
│   ├── index-gen.ts                # Generate entry point index.ts (<45 LOC)
│   ├── schema-file-gen.ts          # Generate Zod schema files (<55 LOC)
│   ├── auth-command-gen.ts         # Generate auth command (<50 LOC)
│   └── package-gen.ts              # Generate package.json (<35 LOC)
├── package.json
└── tsconfig.json
```

**Exports**: pluginCli (IPlugin).
**Dependencies**: ts-morph.

### Module 4: `@fusecli/plugin-skill` — SKILL.md Generator

Generates SKILL.md from IR.
**Imports from**: `@fusecli/core` (types only).

```
packages/plugin-skill/
├── src/
│   ├── index.ts                    # IPlugin implementation (<35 LOC)
│   ├── frontmatter-gen.ts          # YAML frontmatter (<40 LOC)
│   ├── commands-section-gen.ts     # Commands documentation (<75 LOC)
│   └── examples-gen.ts             # --json examples per action (<60 LOC)
├── package.json
└── tsconfig.json
```

### Module 5: `@fusecli/plugin-tests` — Test Generator

Generates Bun test files from IR.
**Imports from**: `@fusecli/core` (types only).

```
packages/plugin-tests/
├── src/
│   ├── index.ts                    # IPlugin implementation (<35 LOC)
│   ├── unit-test-gen.ts            # Zod validation tests (<70 LOC)
│   └── integration-test-gen.ts     # Mock HTTP tests (<75 LOC)
├── package.json
└── tsconfig.json
```

### Module 6: `@fusecli/runtime` — Zero-Codegen Interpreter

Interprets IR at runtime, no code generation.
**Imports from**: `@fusecli/core` (parser + IR), `@fusecli/shared` (http + output).

```
packages/runtime/
├── src/
│   ├── index.ts                    # Entry point (<40 LOC)
│   ├── command-builder.ts          # IR → Commander commands (<85 LOC)
│   └── endpoint-caller.ts          # Execute HTTP from IR action (<70 LOC)
├── package.json
└── tsconfig.json
```

### Module 7: `@fusecli/cli` — Manager (fusecli command)

The user-facing tool.
**Imports from**: `@fusecli/core`, `@fusecli/runtime`, all plugins.

```
packages/cli/
├── src/
│   ├── index.ts                    # Commander program (<40 LOC)
│   ├── commands/
│   │   ├── create.ts               # fusecli create (<85 LOC)
│   │   ├── run.ts                  # fusecli run (<45 LOC)
│   │   ├── bundle.ts               # fusecli bundle (<55 LOC)
│   │   ├── link.ts                 # fusecli link (<55 LOC)
│   │   ├── install.ts              # fusecli install (<80 LOC)
│   │   ├── publish.ts              # fusecli publish (<65 LOC)
│   │   ├── search.ts               # fusecli search (<65 LOC)
│   │   ├── list.ts                 # fusecli list (<45 LOC)
│   │   ├── doctor.ts               # fusecli doctor (<45 LOC)
│   │   ├── update.ts               # fusecli update (<45 LOC)
│   │   ├── remove.ts               # fusecli remove (<35 LOC)
│   │   └── explore.ts              # fusecli explore (<65 LOC)
│   └── lib/
│       ├── config.ts               # Paths + env vars (<65 LOC)
│       ├── executor.ts             # Shell command abstraction (<55 LOC)
│       ├── github.ts               # GitHub URL parsing (<45 LOC)
│       ├── prompts.ts              # Interactive prompts (<35 LOC)
│       ├── validators.ts           # Input validation (<55 LOC)
│       ├── shell.ts                # PATH + rc management (<65 LOC)
│       └── agents.ts               # Agent dir detection (<35 LOC)
├── package.json
└── tsconfig.json
```

## Zero Duplication Rules

### Rule 1: Types Live in ONE Place

```
WRONG:
  plugin-cli/src/types.ts    → defines Action type
  plugin-skill/src/types.ts  → defines Action type (copy)

RIGHT:
  core/src/ir/types.ts       → defines Action type (SINGLE SOURCE)
  plugin-cli imports from @fusecli/core
  plugin-skill imports from @fusecli/core
```

### Rule 2: Runtime Code Lives in `@fusecli/shared`

```
WRONG:
  Generated CLI A: src/lib/client.ts  (108 LOC)
  Generated CLI B: src/lib/client.ts  (108 LOC, identical copy)

RIGHT:
  @fusecli/shared/src/http/client.ts  (ONE implementation)
  Generated CLI A: import { client } from "@fusecli/shared"
  Generated CLI B: import { client } from "@fusecli/shared"
```

### Rule 3: Interfaces Separate from Implementation

```
WRONG:
  shared/src/http/client.ts  → defines IHttpClient + implements it

RIGHT:
  core/src/interfaces/http-client.ts  → defines IHttpClient
  shared/src/http/client.ts           → implements IHttpClient
```

### Rule 4: Factory Pattern for Strategy Selection

```
WRONG:
  switch (authType) {     // Duplicated in 3 places
    case "bearer": ...
    case "api-key": ...
  }

RIGHT:
  shared/src/auth/factory.ts  → createAuthStrategy(config)
  Everyone calls: createAuthStrategy({ type: "bearer", header: "Authorization" })
```

### Rule 5: Barrel Exports Only

```
WRONG:
  import { CliError } from "@fusecli/shared/src/errors/cli-error"

RIGHT:
  import { CliError } from "@fusecli/shared"
  // Barrel: packages/shared/src/index.ts re-exports everything
```

## Dependency Matrix

| Module | Depends On | Depended By |
|--------|-----------|-------------|
| `@fusecli/core` | yaml, json-schema-ref-parser | ALL other modules |
| `@fusecli/shared` | `core` (interfaces), picocolors | runtime, plugin-cli, generated CLIs |
| `@fusecli/plugin-cli` | `core` (types), ts-morph | cli |
| `@fusecli/plugin-skill` | `core` (types) | cli |
| `@fusecli/plugin-tests` | `core` (types) | cli |
| `@fusecli/runtime` | `core` (parser+IR), `shared` (http+output) | cli |
| `@fusecli/cli` | ALL above, commander | end user |

**No circular dependencies. Strict top-down flow.**

## File Count & LOC Budget

| Module | Files | Max LOC/file | Total LOC (est.) |
|--------|-------|-------------|-----------------|
| core | 16 | 90 | ~850 |
| shared | 13 | 80 | ~550 |
| plugin-cli | 7 | 85 | ~400 |
| plugin-skill | 4 | 75 | ~210 |
| plugin-tests | 3 | 75 | ~180 |
| runtime | 3 | 85 | ~195 |
| cli | 19 | 85 | ~1,000 |
| **TOTAL** | **65** | **90 max** | **~3,385** |

65 files, ALL under 90 LOC. Zero duplication. Clean module boundaries.
