# FuseCLI API — Validated Task List

## Phase 1: Core Foundation — DONE

- [x] **@fusecli/core** — Parser OpenAPI 2.0/3.0/3.1, $ref resolution, IR types + builder + validator + resource-grouper + action-namer, Zod schema generator, all interfaces (16 files, ~850 LOC)
- [x] **@fusecli/shared** — HTTP client + retry, 4 auth strategies + factory, 4 output formatters + dispatcher, FuseCliError + handler, logger (17 files, ~550 LOC)
- [x] **Monorepo setup** — Bun workspaces, Turbo, tsconfig strict ES2022, Biome, 7 packages configured

## Phase 2: Plugin CLI — DONE

- [x] **@fusecli/plugin-cli** — CLI code generator with ts-morph: resource-gen, command-gen, index-gen, schema-file-gen, auth-command-gen, package-gen (7 files, ~400 LOC)

## Phase 3: Plugin SKILL — DONE

- [x] **@fusecli/plugin-skill** — SKILL.md auto-generator: frontmatter, commands section, examples section (4 files, ~210 LOC)

## Phase 4: Runtime — DONE

- [x] **@fusecli/runtime** — Zero-codegen interpreter: runFromSpec, command-builder, endpoint-caller (3 files, ~195 LOC)

## Phase 5: CLI Manager — DONE

- [x] **@fusecli/cli** — 11 commands + 7 lib utilities (19 files, ~1000 LOC)
  - Commands: create, run, bundle, link, install, search, list, doctor, update, remove, explore
  - Libs: config, executor, github, prompts, validators, shell, agents

## Phase 6: Tests + Validation — DONE

- [x] **@fusecli/plugin-tests** — Auto test generator: unit (Zod) + integration (mock HTTP) (3 files, ~180 LOC)
- [x] **Tests + Fixtures** — 7 test files, 2 Petstore fixtures, 50 tests PASS, 94 assertions
- [x] **Sniper validation** — tsc 0 errors (7 packages), Biome 0 errors (88 files), all files < 100 LOC

---

## Phase 7: Web Marketplace — TODO

- [ ] **fusecli.dev** — Next.js 16 + Neon PostgreSQL + Drizzle ORM
  - [ ] Database schema (skills, sponsors, votes)
  - [ ] API routes (CRUD skills, search, publish, vote, webhooks)
  - [ ] Homepage with search + filters
  - [ ] CLI detail pages
  - [ ] MDX documentation
  - [ ] Stripe sponsor management
  - [ ] Upstash Redis rate limiting
  - [ ] sitemap.xml + robots.txt + OG images

## Phase 8: Distribution — TODO

- [ ] **npm publish** — @fusecli/cli, @fusecli/core, @fusecli/shared, all plugins
- [ ] **CI/CD** — GitHub Actions: test, lint, build, publish
- [ ] **Changesets** — Automated versioning + CHANGELOG
- [ ] **Standalone binary** — `bun build --compile` for distribution without Bun
- [ ] **Documentation** — README quickstart, full docs site
- [ ] **FuseCLI's own SKILL.md** — Meta: FuseCLI as an agent skill
- [ ] **E2E test** — Full flow: create → bundle → link → use with Petstore spec

---

## Bonus Features — TODO

- [ ] **fusecli keys + fusecli use** — Centralized API key vault (~/.fuse/keys.json encrypted) + auto-install + auto-auth in one command
- [ ] **fusecli discover** — Auto-find OpenAPI specs via Exa/Context7, common paths, GitHub repos
- [ ] **fusecli compose** — Multi-API CLI: combine github + linear + vercel into one CLI
- [ ] **fusecli watch** — Watch spec for changes, auto-regenerate
- [ ] **fuse-fusecli plugin** — Fusengine plugin (agent.md + 4 skills: create-cli, run-api, manage-cli, discover-api)

---

## Metrics

| Metric | Value |
|--------|-------|
| Total packages | 7 |
| Total files | ~110 TypeScript |
| Total LOC | ~3,385 |
| Max file size | 100 LOC (SOLID) |
| Tests | 50 PASS, 0 FAIL |
| tsc errors | 0 |
| Biome errors | 0 |
| Code duplication | 0 |
| `any` usage | 0 |
| Teams used | 2 (6 agents each) |
| Sniper passes | 2 (Phase 1 + Phase 2-6) |
