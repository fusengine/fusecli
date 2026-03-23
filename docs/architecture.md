# Architecture

## Overview

FuseCLI is a single TypeScript package that parses OpenAPI specs and generates standalone CLI tools.

```
OpenAPI Spec (JSON/YAML, local/remote)
        │
        ▼
   ┌─────────┐
   │  Parser  │  Reads spec, resolves $ref, extracts endpoints
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │    IR    │  Groups endpoints into resources, names actions
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │ Plugins  │  Generate code from IR
   └────┬────┘
        │
   ┌────┴─────────────┐
   │                   │
   ▼                   ▼
CLI Plugin         SKILL Plugin
(standalone code)  (agent discovery)
```

## Directory Structure

```
src/
├── index.ts              # Entry point (fusecli binary)
│
├── commands/             # 11 CLI commands
│   ├── create.ts         # Parse spec → generate → install
│   ├── bundle.ts         # bun build → standalone binary
│   ├── link.ts           # Symlink PATH + agents
│   ├── run.ts            # Zero-codegen runtime
│   ├── list.ts           # Show installed CLIs
│   ├── doctor.ts         # Health check
│   ├── update.ts         # Re-parse + regenerate
│   ├── remove.ts         # Uninstall
│   ├── explore.ts        # Browse spec
│   ├── search.ts         # Registry search
│   └── install.ts        # Install from GitHub/registry
│
├── parser/               # OpenAPI parser
│   ├── index.ts          # Entry: parseSpec()
│   ├── openapi-v3.ts     # OpenAPI 3.0/3.1
│   ├── swagger-v2.ts     # Swagger 2.0
│   ├── ref-resolver.ts   # $ref resolution (handles circular)
│   └── schema-extractor.ts  # Body field extraction
│
├── ir/                   # Intermediate Representation
│   ├── types.ts          # IR type definitions
│   ├── schema-types.ts   # Schema types
│   ├── builder.ts        # Build IR from parsed spec
│   ├── validator.ts      # Validate IR
│   ├── resource-grouper.ts  # Group by tag/path
│   └── action-namer.ts   # GET→list, POST→create, etc.
│
├── generators/           # Code generators (IPlugin)
│   ├── cli-plugin.ts     # Orchestrates CLI generation
│   ├── cli-entry.ts      # Generates index.ts
│   ├── cli-resource.ts   # Generates resource commands
│   ├── cli-resource-handler.ts  # Action handler builder
│   ├── cli-auth.ts       # Generates auth command
│   ├── cli-schemas.ts    # Generates Zod schemas
│   ├── cli-package.ts    # Generates package.json
│   ├── gen-utils.ts      # Shared utils (toPascal)
│   └── skill-plugin.ts   # Generates SKILL.md
│
├── templates/            # Code emitters (return strings)
│   ├── client.ts         # HTTP client (REST + MCP JSON-RPC)
│   ├── auth.ts           # Token storage
│   ├── output.ts         # JSON envelope + text table
│   ├── errors.ts         # CliError class
│   └── config.ts         # Constants
│
├── runtime/              # Zero-codegen interpreter
│   ├── index.ts          # runFromSpec()
│   └── endpoint-caller.ts  # HTTP execution
│
├── lib/                  # Shared utilities
│   ├── config.ts         # FUSE_HOME, FUSE_BIN paths
│   ├── utils.ts          # slugify(), execute()
│   ├── shell.ts          # PATH management
│   ├── agents.ts         # Agent directory detection
│   ├── github.ts         # GitHub URL parsing
│   └── schemas.ts        # Zod schema generation
│
└── interfaces/           # Plugin contract
    └── plugin.ts         # IPlugin, GeneratedFile, PluginOptions
```

## Key Design Decisions

### 1. Standalone Generated CLIs

Generated CLIs import nothing from `@fusecli/*`. All code is emitted inline by the templates. This means:
- No npm publish required for `@fusecli/shared`
- Each CLI works independently
- One fix in templates = regenerate affected CLIs

### 2. Plugin Architecture

Code generation is plugin-based. Each plugin implements `IPlugin`:

```typescript
interface IPlugin {
  name: string;
  version: string;
  generate(ir: IR, options: PluginOptions): GeneratedFile[];
}
```

Currently two plugins: `cli-plugin` (generates CLI code) and `skill-plugin` (generates SKILL.md).

### 3. Intermediate Representation (IR)

The parser produces raw `ParsedEndpoint[]`. The IR builder transforms these into a structured `IR` object:

```
ParsedEndpoint[] → groupEndpoints() → nameAction() → IR
```

Plugins never touch raw spec data — they work with the IR only.

### 4. REST + MCP Client

The generated HTTP client detects if `BASE_URL` ends with `/mcp` and switches to JSON-RPC. This allows wrapping MCP endpoints transparently:

```typescript
const IS_MCP = BASE_URL.endsWith('/mcp');
// REST: fetch(url, { method, headers, body })
// MCP:  fetch(BASE_URL, { body: JSON-RPC envelope })
```

### 5. Path Aliases

All imports use `@/` path aliases (configured in tsconfig.json):

```typescript
import { parseSpec } from "@/parser/index.js";
import { slugify } from "@/lib/utils.js";
```

No relative imports like `../../../lib/utils.js`.

## Build

```bash
bun build src/index.ts --outfile dist/index.js --target bun
```

Produces a single 0.37 MB file in ~7ms. All 51 source files are bundled into one.
