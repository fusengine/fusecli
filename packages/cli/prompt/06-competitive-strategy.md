# FuseCLI API — Competitive Strategy

## Market Position

```
                    Agent-Native
                        ▲
                        │
              FuseCLI ★ │
                  ●     │    ○ ocli
                        │    ○ mcp2cli
         ──────────────►┼◄──────────────
         Codegen        │      Runtime
                        │
           ○ hey-api    │
           ○ openapi-gen│
                        │
                    Human-First
```

**FuseCLI** is the only tool in the **Agent-Native + Both Codegen & Runtime** quadrant.

## Head-to-Head Comparison

### vs api2cli (direct inspiration)

| Feature | api2cli | FuseCLI | Advantage |
|---------|---------|---------|-----------|
| OpenAPI parsing | None (manual) | Full 2.0/3.0/3.1 | **10x faster setup** |
| Code generation | String replacement | ts-morph AST | **Always valid code** |
| Input validation | None | Zod v4 auto-generated | **Catches errors locally** |
| SKILL.md | Manual template | Auto-generated | **Zero effort** |
| Tests | None | Auto-generated | **Ship with confidence** |
| Runtime mode | None | `fusecli run` | **Instant API access** |
| Plugin system | None | First-class | **Community extensible** |
| Shared library | Template copy | npm package | **One fix = all CLIs** |
| File sizes | 7 files > 100 LOC | ALL < 90 LOC | **Maintainable** |
| Config | Hardcoded | Env vars + config file | **Flexible** |

### vs openapi-generator

| Feature | openapi-generator | FuseCLI | Advantage |
|---------|-------------------|---------|-----------|
| Runtime | Java required | Bun (no JVM) | **Lighter, faster** |
| Output quality | Non-idiomatic TS | Idiomatic, ts-morph | **Production-ready** |
| Agent support | None | SKILL.md + --json | **Agent-native** |
| Open issues | 4,500+ | Fresh start | **Maintainable** |
| CLI cold start | N/A (SDK only) | 8-15ms (Bun) | **Fast** |
| Setup time | Complex (Java + templates) | `npm i -g @fusecli/cli` | **Simple** |

### vs @hey-api/openapi-ts

| Feature | @hey-api/openapi-ts | FuseCLI | Advantage |
|---------|---------------------|---------|-----------|
| Output | SDK functions | CLI + SKILL.md | **Agent-ready** |
| Usage | Import in code | Shell exec | **Universal** |
| Agent support | None | First-class | **Built for agents** |
| Runtime mode | None | `fusecli run` | **Zero codegen option** |
| Validation | Types only | Zod runtime | **Runtime safety** |

### vs ocli / mcp2cli

| Feature | ocli/mcp2cli | FuseCLI | Advantage |
|---------|--------------|---------|-----------|
| Codegen | None (runtime only) | Full codegen + runtime | **Both options** |
| Customization | Limited | Full resource editing | **Flexible** |
| Distribution | Not distributable | npm publish + registry | **Shareable** |
| Tests | None | Auto-generated | **Quality** |
| SKILL.md | Partial | Complete auto-gen | **Better discovery** |

### vs Speakeasy / Fern / Stainless

| Feature | SaaS generators | FuseCLI | Advantage |
|---------|-----------------|---------|-----------|
| Price | $250+/month | Free (open source) | **Free** |
| Source | Closed | Open | **Forkable** |
| CLI output | SDK wrappers | Native CLI | **First-class CLI** |
| Agent support | Speakeasy MCP only | CLI + SKILL.md | **Universal** |
| Self-host | No | Yes | **Full control** |

## Unique Selling Points (USPs)

### USP 1: "OpenAPI → Agent-Ready CLI in 30 Seconds"

No other tool goes from OpenAPI spec to a CLI that AI agents can discover and use.
The combination of auto-generated CLI + SKILL.md is unique.

### USP 2: "CLI-First, Not MCP-First"

While the industry pushes MCP, we go CLI-first because:
- 100% reliability vs 72% for MCP
- 32x cheaper in tokens
- Works with ALL agents (not just MCP-compatible ones)
- Anthropic themselves recommend CLI over MCP when possible

### USP 3: "Runtime + Codegen in One Tool"

- `fusecli run` for instant access (zero codegen)
- `fusecli create` for production CLI (full codegen)
- Same parser, same IR, two consumption modes

### USP 4: "Plugin-Driven Architecture"

- CLI, SKILL.md, tests are all plugins
- Community can add: Python CLI, Go CLI, Rust CLI, SDK, docs
- Same IR feeds all plugins — write parser once, get N outputs

## Growth Strategy

### Phase 1: Developer Adoption
- Open source from day 1
- Ship with Petstore + Stripe + GitHub examples
- Write "How I gave my AI agent access to any API in 30 seconds" blog post
- Submit to Hacker News, Reddit r/programming, Dev.to

### Phase 2: API Provider Adoption
- Reach out to API providers: "Ship a CLI alongside your docs"
- Provide GitHub Action: "Auto-generate CLI on OpenAPI spec change"
- Registry as distribution channel

### Phase 3: Enterprise
- Self-hosted registry for internal APIs
- Team token management
- Audit logging for agent API usage
- RBAC for which agents can call which CLIs

## Messaging by Audience

### For AI Agent Builders
> "Give your agent access to any REST API. No MCP server needed.
> Just `fusecli create app --openapi spec.json` and your agent calls it via Bash."

### For API Providers
> "Ship an agent-ready CLI for your API. Auto-generated from your OpenAPI spec.
> Your users' AI agents discover it via SKILL.md and call it natively."

### For DevOps/Platform
> "Standardize internal API access. Every API gets the same CLI pattern:
> `<api>-cli <resource> <action> --json`. Test, automate, audit."

### For Solo Developers
> "Build your personal CLI toolkit. All the APIs you use, one command away.
> `fusecli compose mytools --api github,linear,vercel`"
