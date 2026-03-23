# FuseCLI API — 15 Major Improvements Over api2cli

## Critical Improvements (Must-Have for MVP)

### 1. Native OpenAPI Parsing

**api2cli**: No parsing. Users manually write resource files.
**FuseCLI**: Full OpenAPI 2.0/3.0/3.1 parsing with `$ref` resolution.

```bash
# api2cli (manual)
api2cli create typefully --base-url https://api.typefully.com
# → empty scaffold, user writes drafts.ts, schedules.ts by hand

# FuseCLI (automatic)
fusecli create typefully --openapi https://api.typefully.com/openapi.json
# → auto-generates: drafts.ts, schedules.ts, media.ts, accounts.ts
# → each with list/get/create/update/delete based on actual endpoints
# → Zod validation schemas for all request/response bodies
# → SKILL.md auto-generated with every command documented
```

### 2. Zod v4 Schema Generation

**api2cli**: No input validation. Options passed directly to HTTP client.
**FuseCLI**: Auto-generated Zod schemas from OpenAPI definitions.

```typescript
// Auto-generated from OpenAPI: POST /drafts
const CreateDraftSchema = z.object({
  content: z.string().min(1).describe("Draft text content"),
  threadify: z.boolean().optional().describe("Split into thread"),
  schedule_date: z.string().datetime().optional(),
});

// CLI validates BEFORE calling API
const parsed = CreateDraftSchema.safeParse(opts);
if (!parsed.success) {
  // Shows exactly which field is wrong + expected format
  handleValidationError(parsed.error);
}
```

Benefits:
- Catch errors locally (no wasted API call)
- Better error messages than API 400 responses
- Type-safe at runtime, not just compile time

### 3. Auto-Generated SKILL.md

**api2cli**: Manual SKILL.md with placeholders user must fill.
**FuseCLI**: SKILL.md fully generated from OpenAPI spec.

```markdown
---
name: typefully-cli
description: CLI for Typefully API — manage drafts, schedules, and media
category: social
install_command: fusecli install typefully
---

# typefully-cli

## Commands

### typefully-cli drafts list
List all drafts with pagination.
\`\`\`bash
typefully-cli drafts list --json --limit 10
\`\`\`
Response: `{ "ok": true, "data": [...], "meta": { "total": 42 } }`

### typefully-cli drafts create --content <text>
Create a new draft.
\`\`\`bash
typefully-cli drafts create --json --content "Hello world" --threadify
\`\`\`
...
```

Every command, every option, every response format — documented automatically.

### 4. Runtime Interpreter (Zero-Codegen Mode)

**api2cli**: Must create → bundle → link before using.
**FuseCLI**: Instant use with `fusecli run`.

```bash
# No install needed — parse and run immediately
fusecli run --openapi https://api.example.com/spec.json users list --json
fusecli run --openapi ./local-spec.yaml orders get ord_123 --json

# Explore available resources
fusecli run --openapi ./spec.json --help
# → lists all resources and actions discovered from the spec
```

Use cases:
- Agent discovers a new API → instant access without codegen
- Quick testing before committing to full CLI generation
- CI/CD pipelines that need one-off API calls

### 5. AST-Based Code Generation (ts-morph)

**api2cli**: String replacement (`{{APP_NAME}}` → "typefully"). Fragile.
**FuseCLI**: AST-based generation with ts-morph. Always valid TypeScript.

```typescript
// api2cli: can accidentally replace inside comments/strings
content.replaceAll("{{APP_NAME}}", "typefully");

// FuseCLI: generates syntactically correct code
sourceFile.addFunction({
  name: "listDrafts",
  isExported: true,
  isAsync: true,
  parameters: [{ name: "opts", type: "ListDraftsOptions" }],
  returnType: "Promise<DraftListResponse>",
  statements: [
    `const params = ListDraftsSchema.parse(opts);`,
    `return client.get("/drafts", params);`,
  ],
});
```

---

## Architecture Improvements

### 6. Plugin System

**api2cli**: Monolithic. One output format. Not extensible.
**FuseCLI**: Every output is a plugin. Community can add more.

```typescript
// Anyone can write a plugin
export const myPlugin: FusePlugin = {
  name: "@fusecli/plugin-python",
  version: "1.0.0",
  generate(ir) {
    // Generate Python Click CLI from the same IR
    return [{ path: "cli.py", content: generatePythonCli(ir) }];
  },
};
```

Built-in plugins:
- `@fusecli/plugin-cli` — TypeScript CLI (Commander.js)
- `@fusecli/plugin-skill` — SKILL.md for agent discovery
- `@fusecli/plugin-tests` — Bun test suite
- Future community: Python, Go, Rust CLI generators

### 7. Shared Library (Not Copy-Paste Template)

**api2cli**: Copies entire template directory. Each CLI is independent.
**FuseCLI**: Generated CLIs import from `@fusecli/shared`.

```typescript
// api2cli: copy of client.ts in every CLI (108 LOC each)
// If you fix a bug, you must update every generated CLI manually

// FuseCLI: shared dependency
import { client } from "@fusecli/shared/http";
import { output } from "@fusecli/shared/output";
import { handleError } from "@fusecli/shared/errors";
```

One fix in `@fusecli/shared` → `fusecli update <app>` → all CLIs updated.

### 8. SOLID Architecture (Files < 90 Lines)

**api2cli**: 7 files > 100 LOC. install.ts = 247 LOC. create.ts = 227 LOC.
**FuseCLI**: Strict < 90 LOC per file. Split by responsibility.

| api2cli | FuseCLI |
|---------|---------|
| `install.ts` (247 LOC) | `source-resolver.ts` + `clone-manager.ts` + `build-pipeline.ts` + `skill-installer.ts` (~50 LOC each) |
| `create.ts` (227 LOC) | `scaffold.ts` + `github-repo.ts` + `publish-prompt.ts` (~45 LOC each) |
| `output.ts` (169 LOC) | `json.ts` + `csv.ts` + `yaml.ts` + `text.ts` + `dispatcher.ts` (~35 LOC each) |

### 9. Interfaces for Everything

**api2cli**: No interfaces. Direct implementation coupling.
**FuseCLI**: Interface-first design. Every component is swappable.

```typescript
// Swap auth strategy without touching client code
interface IAuthStrategy {
  buildHeaders(): Record<string, string>;
}

// Swap output format without touching command code
interface IOutputFormatter {
  format(data: unknown, opts: FormatOptions): string;
  supports(format: string): boolean;
}

// Swap HTTP client for testing
interface IHttpClient {
  request(req: HttpRequest): Promise<HttpResponse>;
}
```

---

## Developer Experience Improvements

### 10. Interactive TUI for API Exploration

```bash
fusecli explore --openapi ./spec.json

# Opens interactive terminal UI:
# ┌─────────────────────────────────┐
# │ Typefully API — 4 resources     │
# ├─────────────────────────────────┤
# │ > drafts (5 actions)            │
# │   schedules (3 actions)         │
# │   media (2 actions)             │
# │   accounts (1 action)           │
# ├─────────────────────────────────┤
# │ [Enter] Expand  [T] Try  [Q] Quit│
# └─────────────────────────────────┘
```

### 11. Watch Mode + Auto-Sync

```bash
fusecli watch --openapi ./spec.json --app typefully

# Watches spec file for changes
# On change: re-parses → diffs → regenerates only changed resources
# Shows: "Updated drafts.ts (+2 actions), removed legacy.ts"
```

### 12. Multi-API Composition

```bash
fusecli compose devtools \
  --api github:https://api.github.com/openapi.json \
  --api linear:https://linear.app/openapi.json \
  --api vercel:https://api.vercel.com/openapi.json

# Generates single CLI:
devtools-cli github issues list --json
devtools-cli linear tickets get TKT-123 --json
devtools-cli vercel deployments list --json
```

---

## Quality & Security Improvements

### 13. Auto-Generated Tests

```bash
fusecli create typefully --openapi ./spec.json
# Also generates:
# tests/drafts.test.ts
# tests/schedules.test.ts
# tests/integration.test.ts
```

```typescript
// Auto-generated test
import { describe, it, expect, mock } from "bun:test";

describe("drafts list", () => {
  it("returns paginated results", async () => {
    const mockFetch = mock(() => Response.json({ data: [], total: 0 }));
    const result = await listDrafts({ limit: "10", page: "1" });
    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/drafts?limit=10&page=1"),
    );
  });

  it("validates input with Zod schema", () => {
    expect(() => ListDraftsSchema.parse({ limit: "abc" })).toThrow();
  });
});
```

### 14. Input Validation Layer

**api2cli**: No URL validation, no header validation, no enum validation.
**FuseCLI**: Validates everything before it reaches the API.

```typescript
// URL validation
validateUrl("https://api.example.com"); // OK
validateUrl("javascript:alert(1)");     // Error: Invalid URL protocol
validateUrl("file:///etc/passwd");      // Error: file:// not allowed

// Header validation (RFC 7230)
validateHeader("Authorization");        // OK
validateHeader("${process.env.SECRET}");// Error: Invalid header name

// Auth type validation
validateAuthType("bearer");             // OK
validateAuthType("custom-invalid");     // Error: Must be bearer|api-key|basic|oauth
```

### 15. Configuration File Support

**api2cli**: All config hardcoded. No override mechanism.
**FuseCLI**: `fusecli.config.json` + environment variables.

```json
// ~/.fuse/config.json
{
  "home": "~/.fuse",
  "bin": "~/.local/bin",
  "tokens": "~/.config/fusecli/tokens",
  "registry": "https://fusecli.dev/api",
  "defaults": {
    "format": "json",
    "timeout": 30000,
    "retries": 3,
    "retryDelays": [1000, 2000, 4000]
  },
  "plugins": [
    "@fusecli/plugin-cli",
    "@fusecli/plugin-skill",
    "@fusecli/plugin-tests"
  ]
}
```

Environment overrides: `FUSECLI_HOME`, `FUSECLI_BIN`, `FUSECLI_REGISTRY`, etc.
