# FuseCLI API — Architecture

## Core Principle: Layered Generation Pipeline

```
                    INPUT
                      │
              ┌───────▼───────┐
              │  OpenAPI Spec  │  JSON / YAML / URL
              │  2.0, 3.0, 3.1│
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │  @fuse/parser  │  Parse + resolve $ref
              │                │  allOf / oneOf / anyOf
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │    @fuse/ir    │  Intermediate Representation
              │                │  (the universal contract)
              └───────┬───────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
   ┌─────▼─────┐ ┌───▼───┐ ┌─────▼─────┐
   │ plugin-cli│ │plugin- │ │ plugin-   │
   │           │ │ skill  │ │  tests    │
   │ Commander │ │SKILL.md│ │ Bun test  │
   │ + --json  │ │auto-gen│ │ suite     │
   └─────┬─────┘ └───┬───┘ └─────┬─────┘
         │            │            │
         └────────────┼────────────┘
                      │
              ┌───────▼───────┐
              │   OUTPUT DIR   │
              │  ~/.fuse/<app> │
              └───────────────┘
```

## Monorepo Structure

```
fusecliapi/
├── packages/
│   ├── core/                     # OpenAPI parser + IR + plugin interfaces
│   │   └── src/
│   │       ├── parser/           # OpenAPI 2.0/3.0/3.1 parser
│   │       │   ├── index.ts          # parseSpec() entry point (<90 LOC)
│   │       │   ├── openapi-v3.ts     # v3.0/3.1 handler (<90 LOC)
│   │       │   ├── swagger-v2.ts     # v2.0 handler (<90 LOC)
│   │       │   └── ref-resolver.ts   # $ref resolution (<90 LOC)
│   │       ├── ir/               # Intermediate Representation
│   │       │   ├── types.ts          # IR type definitions (<90 LOC)
│   │       │   ├── builder.ts        # IR builder from parsed spec (<90 LOC)
│   │       │   └── validator.ts      # IR validation (<90 LOC)
│   │       ├── schemas/          # Zod schema generation
│   │       │   ├── generator.ts      # OpenAPI schema → Zod (<90 LOC)
│   │       │   └── primitives.ts     # Type mapping (<90 LOC)
│   │       └── interfaces/       # Plugin contracts
│   │           ├── plugin.ts         # IPlugin interface
│   │           ├── generator.ts      # IGenerator interface
│   │           └── formatter.ts      # IFormatter interface
│   │
│   ├── cli/                      # fusecli manager (the user-facing tool)
│   │   └── src/
│   │       ├── index.ts              # Entry point (<50 LOC)
│   │       ├── commands/
│   │       │   ├── create.ts         # fusecli create <app> --openapi <url>
│   │       │   ├── run.ts            # fusecli run --openapi <url> <resource> <action>
│   │       │   ├── bundle.ts         # fusecli bundle <app>
│   │       │   ├── link.ts           # fusecli link <app>
│   │       │   ├── install.ts        # fusecli install <source>
│   │       │   ├── publish.ts        # fusecli publish <app>
│   │       │   ├── search.ts         # fusecli search <query>
│   │       │   ├── list.ts           # fusecli list
│   │       │   ├── doctor.ts         # fusecli doctor
│   │       │   ├── update.ts         # fusecli update <app>
│   │       │   └── remove.ts         # fusecli remove <app>
│   │       └── lib/
│   │           ├── config.ts         # Paths, env vars, config file
│   │           ├── executor.ts       # Shell command abstraction
│   │           ├── github.ts         # GitHub URL parsing + API
│   │           ├── prompts.ts        # Interactive prompts (shared)
│   │           ├── validators.ts     # Input validation (URL, headers, etc.)
│   │           └── shell.ts          # PATH + rc file management
│   │
│   ├── runtime/                  # Zero-codegen interpreter
│   │   └── src/
│   │       ├── index.ts              # Runtime entry point
│   │       ├── command-builder.ts    # Build Commander commands from IR
│   │       └── endpoint-caller.ts    # Execute HTTP calls from IR
│   │
│   ├── plugin-cli/               # CLI code generator
│   │   └── src/
│   │       ├── index.ts              # Plugin entry point
│   │       ├── resource-gen.ts       # Generate resource files (ts-morph)
│   │       ├── index-gen.ts          # Generate index.ts entry point
│   │       └── command-gen.ts        # Generate Commander commands
│   │
│   ├── plugin-skill/             # SKILL.md generator
│   │   └── src/
│   │       ├── index.ts              # Plugin entry point
│   │       └── skill-gen.ts          # Generate SKILL.md from IR
│   │
│   ├── plugin-tests/             # Test suite generator
│   │   └── src/
│   │       ├── index.ts              # Plugin entry point
│   │       └── test-gen.ts           # Generate Bun test files
│   │
│   ├── shared/                   # Shared libraries for generated CLIs
│   │   └── src/
│   │       ├── interfaces/
│   │       │   ├── http-client.ts    # IHttpClient interface
│   │       │   ├── auth-strategy.ts  # IAuthStrategy interface
│   │       │   └── output-format.ts  # IOutputFormatter interface
│   │       ├── http/
│   │       │   ├── client.ts         # HTTP client with retry
│   │       │   └── retry.ts          # Retry strategy (exponential backoff)
│   │       ├── auth/
│   │       │   ├── token-store.ts    # Secure token storage (chmod 600)
│   │       │   ├── bearer.ts         # Bearer auth strategy
│   │       │   ├── api-key.ts        # API key auth strategy
│   │       │   ├── basic.ts          # Basic auth strategy
│   │       │   └── oauth.ts          # OAuth2 auth strategy
│   │       ├── output/
│   │       │   ├── dispatcher.ts     # Format dispatcher
│   │       │   ├── json.ts           # JSON envelope formatter
│   │       │   ├── text.ts           # Pretty table formatter
│   │       │   ├── csv.ts            # CSV formatter
│   │       │   └── yaml.ts           # YAML formatter
│   │       ├── errors/
│   │       │   ├── cli-error.ts      # CliError class
│   │       │   └── handler.ts        # Error handler + exit codes
│   │       └── logger.ts             # Logger (respects --json/--verbose)
│   │
│   └── template/                 # Minimal scaffold (for non-OpenAPI usage)
│       └── src/
│           ├── index.ts              # Template entry point
│           └── commands/
│               └── auth.ts           # Built-in auth command
│
├── apps/
│   └── web/                      # fusecli.dev registry (Phase 7)
│
├── skills/
│   └── fusecli/                  # FuseCLI's own SKILL.md
│       └── SKILL.md
│
├── tests/                        # Integration tests
│   ├── parser.test.ts
│   ├── ir.test.ts
│   ├── plugin-cli.test.ts
│   ├── plugin-skill.test.ts
│   ├── runtime.test.ts
│   └── e2e/
│       └── petstore.test.ts      # E2E with Petstore spec
│
├── fixtures/                     # Test fixtures (OpenAPI specs)
│   ├── petstore-v3.yaml
│   ├── petstore-v2.json
│   ├── github-v3.yaml
│   └── stripe-v3.yaml
│
├── package.json                  # Root workspace
├── turbo.json                    # Build orchestration
├── pnpm-workspace.yaml           # Workspace definition
├── biome.json                    # Linter + formatter
├── tsconfig.base.json            # Shared TS config
└── README.md
```

## Key Design Decisions

### 1. Plugin System via IR Contract

Every plugin receives the same `IntermediateRepresentation` object and outputs files.
Adding a new output format = writing a new plugin. No core changes needed.

```typescript
// packages/core/src/interfaces/plugin.ts
export interface FusePlugin {
  name: string;
  version: string;
  generate(ir: IR, options: PluginOptions): GeneratedFile[];
}
```

### 2. Shared Libraries as npm Package

Generated CLIs import from `@fusecli/shared` instead of copying template code.
This means: one fix in shared = all generated CLIs benefit (after update).

### 3. Each File < 90 Lines

SOLID enforcement. No exceptions. The architecture splits naturally:
- Parser: 4 files (~80 LOC each)
- IR: 3 files (~80 LOC each)
- Output formatters: 5 files (~40 LOC each)
- Auth strategies: 5 files (~30 LOC each)

### 4. Environment-Based Configuration

```bash
FUSECLI_HOME=~/.fuse          # Override install directory
FUSECLI_BIN=~/.local/bin      # Override binary directory
FUSECLI_TOKENS=~/.config/tokens  # Override token directory
FUSECLI_REGISTRY=https://fusecli.dev/api  # Override registry
```
