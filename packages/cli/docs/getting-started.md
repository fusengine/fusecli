# Getting Started

## Prerequisites

- [Bun](https://bun.sh) 1.2 or later

```bash
curl -fsSL https://bun.sh/install | bash
```

## Install FuseCLI

```bash
bun add -g @fusecli/cli
```

Verify the installation:

```bash
fusecli --help
```

You should see the FuseCLI banner and available commands.

## Your First CLI in 60 Seconds

### 1. Find an OpenAPI spec

Any REST API with an OpenAPI spec works. Here are some to try:

| API | Spec URL |
|-----|----------|
| Exa (search) | `https://raw.githubusercontent.com/exa-labs/openapi-spec/refs/heads/master/exa-openapi-spec.yaml` |
| Context7 (docs) | `https://context7.mintlify.app/openapi.json` |
| Petstore (demo) | `./fixtures/petstore-v3.yaml` (included) |

### 2. Generate the CLI

```bash
fusecli create exa --openapi https://raw.githubusercontent.com/exa-labs/openapi-spec/refs/heads/master/exa-openapi-spec.yaml
```

FuseCLI will:
- Parse the OpenAPI spec
- Generate standalone CLI code (Commander.js + Zod)
- Generate a SKILL.md for agent discovery
- Install dependencies
- Output to `~/.fuse/clis/exa-cli/`

### 3. Build the binary

```bash
fusecli bundle exa
```

This creates a standalone binary at `~/.fuse/bin/exa-cli` (~100KB).

### 4. Configure auth

```bash
exa-cli auth set "your-exa-api-key"
```

The token is stored at `~/.config/fusecli/tokens/exa-cli.txt` with `chmod 600`.

### 5. Use it

```bash
exa-cli search --query "best typescript frameworks 2026" --num-results 5 --json
```

### 6. Link for agents (optional)

```bash
fusecli link exa
```

This symlinks the SKILL.md to Claude Code, Cursor, Codex, Windsurf, and Cline skill directories. AI agents will discover it automatically.

## What's Generated

```
~/.fuse/clis/exa-cli/
├── src/
│   ├── index.ts              # Commander.js entry point
│   ├── commands/
│   │   ├── auth.ts           # auth set/show/test/remove
│   │   └── search.ts         # search --query --num-results
│   ├── schemas/
│   │   └── search.ts         # Zod validation schemas
│   └── lib/
│       ├── client.ts         # HTTP client with retry
│       ├── auth.ts           # Token storage
│       ├── output.ts         # JSON envelope formatter
│       ├── errors.ts         # Error handling
│       └── config.ts         # BASE_URL, AUTH_TYPE constants
├── SKILL.md                  # Agent discovery file
├── package.json              # Only commander + zod deps
└── tests/                    # Auto-generated test suite
```

The generated CLI is **standalone** — no external `@fusecli/*` dependencies.

## Advanced Options

You can override values auto-detected from the spec:

```bash
# Override base URL (e.g., for production vs staging)
fusecli create myapi --openapi ./spec.yaml --base-url https://api.production.com

# Force auth type and header
fusecli create myapi --openapi ./spec.yaml --auth-type api-key --auth-header "X-Api-Key"

# Include docs link in the generated SKILL.md
fusecli create myapi --openapi ./spec.yaml --docs https://docs.myapi.com
```

## Supported Auth Types

FuseCLI auto-detects auth from the OpenAPI spec, but you can override:

| Type | Header | Example |
|------|--------|---------|
| `bearer` | `Authorization: Bearer <token>` | Most REST APIs |
| `api-key` | `X-Api-Key: <token>` | Exa, Context7 |
| `basic` | `Authorization: Basic <base64>` | Legacy APIs |
| `custom` | `<custom-header>: <token>` | Custom header name |

## Next Steps

- [Commands Reference](./commands.md) — All 11 fusecli commands with examples
- [Agent Integration](./agent-integration.md) — How AI agents discover and use CLIs
- [OpenAPI Specs](./openapi-specs.md) — Finding specs, writing your own, auth types
- [Generated CLI Guide](./generated-cli.md) — Structure, output formats, error codes
- [Architecture](./architecture.md) — Internal design and decisions
