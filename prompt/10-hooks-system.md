# FuseCLI API — Hooks System (TypeScript)

## Design Decision

**All hooks are TypeScript**, executed via Bun. Single language across the entire ecosystem.
No Python, no Bash scripts, no shell wrappers. TypeScript everywhere.

## Why TypeScript Hooks

| Alternative | Problem |
|-------------|---------|
| Bash/Shell | No type safety, no IDE support, platform differences |
| Python | Extra runtime dependency, different ecosystem |
| JSON config | Not expressive enough for logic |
| **TypeScript** | Same language as CLI, type-safe, IDE support, Bun runs it natively |

Bun executes `.ts` files directly — no compile step needed.

## Hook Architecture

```
fusecli create <app> --openapi <url>
     │
     ├── hook: beforeParse     → validate spec URL, add custom headers
     ├── [parse OpenAPI spec]
     ├── hook: afterParse      → modify IR, filter resources, rename actions
     ├── [generate code]
     ├── hook: afterGenerate   → post-process files, add custom code
     ├── [bundle]
     ├── hook: afterBundle     → copy assets, run extra build steps
     ├── [link]
     └── hook: afterLink       → notify, register with custom systems
```

## Hook File Location

```
~/.fuse/<app>-cli/
├── src/
├── hooks/                    # Hook directory
│   ├── before-parse.ts       # Before OpenAPI parsing
│   ├── after-parse.ts        # After IR is built (modify IR)
│   ├── after-generate.ts     # After code generation
│   ├── after-bundle.ts       # After build
│   └── after-link.ts         # After PATH linking
├── fusecli.hooks.ts          # Hook configuration (single file alternative)
└── package.json
```

## Hook Configuration

### Option 1: Single Config File (recommended)

```typescript
// fusecli.hooks.ts
import type { FuseHooks } from "@fusecli/core";

export default {
  beforeParse(context) {
    // Add custom auth header to fetch OpenAPI spec
    context.fetchOptions.headers = {
      Authorization: `Bearer ${process.env.SPEC_TOKEN}`,
    };
  },

  afterParse(ir) {
    // Filter out internal/admin endpoints
    ir.resources = ir.resources.filter(
      (r) => !r.basePath.startsWith("/admin"),
    );

    // Rename a resource
    const users = ir.resources.find((r) => r.name === "users");
    if (users) users.name = "members";

    return ir;
  },

  afterGenerate(files) {
    // Add a custom command file
    files.push({
      path: "src/commands/custom.ts",
      content: `// Custom command added by hook`,
    });
    return files;
  },

  afterBundle(result) {
    console.log(`Built in ${result.duration}ms, size: ${result.size}`);
  },

  afterLink(info) {
    // Post-link notification
    console.log(`Linked ${info.appName} to ${info.binPath}`);
  },
} satisfies FuseHooks;
```

### Option 2: Separate Files

```typescript
// hooks/after-parse.ts
import type { IR } from "@fusecli/core";

export default function afterParse(ir: IR): IR {
  // Remove deprecated endpoints
  for (const resource of ir.resources) {
    resource.actions = resource.actions.filter(
      (a) => !a.tags.includes("deprecated"),
    );
  }
  return ir;
}
```

## Hook Type Definitions

```typescript
// packages/core/src/interfaces/hooks.ts

import type { IR } from "../ir/types.js";

export interface ParseContext {
  specPath: string;              // URL or file path
  format: "json" | "yaml";      // Detected format
  fetchOptions: RequestInit;     // Fetch options (modifiable)
}

export interface GeneratedFile {
  path: string;                  // Relative path in CLI dir
  content: string;               // File content
}

export interface BundleResult {
  outfile: string;               // Output file path
  size: number;                  // Bundle size in bytes
  duration: number;              // Build time in ms
}

export interface LinkInfo {
  appName: string;               // CLI app name
  binPath: string;               // Symlink path
  skillPaths: string[];          // SKILL.md symlink paths
}

export interface FuseHooks {
  /** Runs before OpenAPI spec is fetched/parsed */
  beforeParse?(context: ParseContext): void | Promise<void>;

  /** Runs after IR is built — can modify or filter the IR */
  afterParse?(ir: IR): IR | Promise<IR>;

  /** Runs after code generation — can add/modify/remove files */
  afterGenerate?(files: GeneratedFile[]): GeneratedFile[] | Promise<GeneratedFile[]>;

  /** Runs after bundle (bun build) completes */
  afterBundle?(result: BundleResult): void | Promise<void>;

  /** Runs after linking to PATH and agent skill dirs */
  afterLink?(info: LinkInfo): void | Promise<void>;
}
```

## Hook Resolution

FuseCLI looks for hooks in this order:

1. `fusecli.hooks.ts` in CLI root (single file config)
2. `hooks/*.ts` directory (separate files)
3. `fusecli.config.json` → `hooks` field (path override)

```typescript
// packages/cli/src/lib/hooks.ts
import type { FuseHooks } from "@fusecli/core";

export async function loadHooks(cliDir: string): Promise<FuseHooks> {
  // 1. Try single config file
  const configPath = join(cliDir, "fusecli.hooks.ts");
  if (existsSync(configPath)) {
    return (await import(configPath)).default;
  }

  // 2. Try hooks directory
  const hooksDir = join(cliDir, "hooks");
  if (existsSync(hooksDir)) {
    return loadHooksFromDir(hooksDir);
  }

  // 3. No hooks — return empty
  return {};
}
```

## Runtime Hooks (Generated CLI)

Generated CLIs also support hooks for runtime behavior:

```typescript
// ~/.fuse/<app>-cli/fusecli.hooks.ts
export default {
  // Called before every HTTP request
  beforeRequest(req) {
    req.headers["X-Request-Id"] = crypto.randomUUID();
    req.headers["X-Client"] = "fusecli/1.0";
    return req;
  },

  // Called after every HTTP response
  afterResponse(res, req) {
    if (res.headers["x-ratelimit-remaining"] === "0") {
      console.warn("Rate limit approaching — slow down");
    }
    return res;
  },

  // Called on auth token set
  onAuthSet(token) {
    // Validate token format before saving
    if (!token.startsWith("sk_")) {
      throw new Error("Token must start with 'sk_'");
    }
  },

  // Called on output before formatting
  beforeOutput(data, format) {
    // Redact sensitive fields
    if (Array.isArray(data)) {
      return data.map((item) => ({ ...item, secret: "[REDACTED]" }));
    }
    return data;
  },
} satisfies RuntimeHooks;
```

### Runtime Hook Types

```typescript
// packages/shared/src/interfaces/runtime-hooks.ts

export interface HttpRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface HttpResponse {
  status: number;
  headers: Record<string, string>;
  data: unknown;
}

export interface RuntimeHooks {
  /** Before every HTTP request — modify headers, params, etc. */
  beforeRequest?(req: HttpRequest): HttpRequest | Promise<HttpRequest>;

  /** After every HTTP response — log, transform, warn */
  afterResponse?(res: HttpResponse, req: HttpRequest): HttpResponse | Promise<HttpResponse>;

  /** When auth token is set — validate format */
  onAuthSet?(token: string): void | Promise<void>;

  /** Before output formatting — redact, transform */
  beforeOutput?(data: unknown, format: string): unknown | Promise<unknown>;

  /** On error — custom error handling, reporting */
  onError?(error: Error, context: { command: string; args: string[] }): void | Promise<void>;
}
```

## Fusengine Plugin Hooks

FuseCLI as a Fusengine plugin can also hook into Fusengine events:

```typescript
// fuse-fusecli/hooks/on-api-mention.ts
import type { HookContext } from "@fusengine/types";

/**
 * Triggered when user mentions an API service name.
 * Suggests using or creating a CLI for that API.
 */
export default async function onApiMention(context: HookContext) {
  const { userMessage, availableSkills } = context;

  // Check if any installed CLI matches
  const cliList = await exec("fusecli list --json");
  const installed = JSON.parse(cliList).data;

  const mentioned = detectApiMention(userMessage);
  if (!mentioned) return;

  const existing = installed.find((cli) => cli.name === mentioned.name);
  if (existing) {
    return {
      suggestion: `Use ${existing.name}-cli for this task`,
      skill: `${existing.name}-cli`,
    };
  }

  return {
    suggestion: `No CLI found for ${mentioned.name}. Create one with: fusecli create ${mentioned.name} --openapi <url>`,
  };
}
```

## Hook Execution Model

```
Sync hooks:   Run inline, block execution until complete
Async hooks:  Awaited, block execution until resolved
Failing hook: Logs warning, continues (non-blocking by default)
Critical hook: Add `critical: true` → failure stops execution
```

```typescript
// fusecli.hooks.ts
export default {
  // Normal hook — failure is logged but doesn't stop execution
  afterBundle(result) {
    notifySlack(`Build complete: ${result.size} bytes`);
  },

  // Critical hook — failure stops the pipeline
  afterParse: {
    critical: true,
    handler(ir) {
      if (ir.resources.length === 0) {
        throw new Error("No resources found in OpenAPI spec");
      }
      return ir;
    },
  },
} satisfies FuseHooks;
```

## Summary

| Hook Layer | When | Example Use |
|------------|------|-------------|
| **Build hooks** | During `fusecli create/bundle/link` | Filter endpoints, add custom code, notify |
| **Runtime hooks** | During CLI execution | Add headers, redact data, validate tokens |
| **Fusengine hooks** | During agent interaction | Auto-suggest CLI, detect API mentions |

All TypeScript. All type-safe. All executed by Bun natively.
