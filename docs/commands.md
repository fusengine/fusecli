# Commands Reference

## fusecli create

Generate a CLI from an OpenAPI spec.

```bash
fusecli create <app> --openapi <url-or-path>
```

**Arguments:**
- `<app>` — Name for the CLI (becomes `<app>-cli`)

**Options:**
| Flag | Description | Required | Default |
|------|-------------|----------|---------|
| `--openapi <url>` | OpenAPI spec URL or local file path | Yes | — |
| `--base-url <url>` | Override the API base URL from the spec | No | From spec |
| `--auth-type <type>` | Override auth: `bearer`, `api-key`, `basic`, `custom` | No | Auto-detected |
| `--auth-header <name>` | Override auth header name | No | Auto-detected |
| `--docs <url>` | Link to API documentation (included in SKILL.md) | No | — |
| `--force` | Overwrite existing CLI | No | `false` |

**Examples:**
```bash
# From a remote URL (auto-detects everything from spec)
fusecli create exa --openapi https://raw.githubusercontent.com/exa-labs/openapi-spec/refs/heads/master/exa-openapi-spec.yaml

# From a local file
fusecli create myapi --openapi ./my-spec.yaml

# Override base URL for production
fusecli create myapi --openapi ./spec.yaml --base-url https://api.production.com

# Force API key auth with custom header
fusecli create myapi --openapi ./spec.yaml --auth-type api-key --auth-header "X-Api-Key"

# Include docs link in generated SKILL.md
fusecli create myapi --openapi ./spec.yaml --docs https://docs.myapi.com

# Overwrite an existing CLI
fusecli create myapi --openapi ./spec.yaml --force
```

**What happens:**
1. Fetches the OpenAPI spec (local file or remote URL)
2. Parses the spec (supports OpenAPI 2.0, 3.0, 3.1)
3. Resolves `$ref` references (handles circular refs)
4. Builds an Intermediate Representation (IR)
5. Applies overrides (`--base-url`, `--auth-type`, `--auth-header`, `--docs`)
6. Runs plugins (CLI generator + SKILL.md generator)
5. Writes files to `~/.fuse/clis/<app>-cli/`
6. Runs `bun install`

---

## fusecli bundle

Build a standalone binary from generated source.

```bash
fusecli bundle <app>
```

**Options:**
| Flag | Description |
|------|-------------|
| `--compile` | Create a standalone binary (no Bun required to run) |
| `--minify` | Minify the output |

**Example:**
```bash
fusecli bundle exa
# Output: ~/.fuse/bin/exa-cli (~100KB)
```

---

## fusecli link

Add CLI to PATH and link SKILL.md to AI agent directories.

```bash
fusecli link <app>
```

**What happens:**
1. Symlinks the binary to `~/.local/bin/<app>-cli`
2. Updates your shell rc file (bash/zsh/fish)
3. Symlinks SKILL.md to detected agent directories:
   - `~/.claude/skills/<app>-cli/SKILL.md`
   - `~/.cursor/skills/<app>-cli/SKILL.md`
   - `~/.codex/skills/<app>-cli/SKILL.md`
   - `~/.windsurf/skills/<app>-cli/SKILL.md`
   - `~/.cline/skills/<app>-cli/SKILL.md`

---

## fusecli run

Use any API instantly without generating a CLI.

```bash
fusecli run --openapi <url-or-path> [resource] [action] [options]
```

Parses the spec at runtime and executes the command directly. No `create`, no `bundle`, no `link` needed.

**Example:**
```bash
fusecli run --openapi ./petstore.yaml pets list --json
```

---

## fusecli list

Show all installed CLIs.

```bash
fusecli list
fusecli list --json
```

**Output:**
```
exa-cli        1.0.0
context7-cli   2.0.0
petstore-cli   1.0.0
```

---

## fusecli doctor

Check FuseCLI installation health.

```bash
fusecli doctor
```

**Checks:**
- Bun runtime available
- `~/.fuse/` directory exists
- `~/.fuse/bin/` directory exists
- Shell detected (bash/zsh/fish)
- RC file exists
- Agent directories found

---

## fusecli update

Re-parse an OpenAPI spec and regenerate the CLI.

```bash
fusecli update <app>
fusecli update <app> --openapi <new-url>  # Use updated spec
fusecli update <app> --diff               # Preview changes only
```

---

## fusecli remove

Uninstall a CLI.

```bash
fusecli remove <app>
fusecli remove <app> --keep-token  # Don't delete the auth token
```

**What happens:**
1. Removes `~/.fuse/clis/<app>-cli/`
2. Removes `~/.fuse/bin/<app>-cli`
3. Removes SKILL.md symlinks from agent directories
4. Removes auth token (unless `--keep-token`)

---

## fusecli explore

Browse API resources from an OpenAPI spec.

```bash
fusecli explore --openapi <url-or-path>
```

Lists all resources and actions discovered in the spec without generating anything.

---

## fusecli search

Search the FuseCLI registry.

```bash
fusecli search <query>
fusecli search <query> --category devtools --sort popular --limit 5
```

---

## fusecli install

Install a CLI from GitHub or the registry.

```bash
fusecli install <source>
```

**Source formats:**
- Registry name: `fusecli install exa`
- GitHub shorthand: `fusecli install owner/repo`
- Full URL: `fusecli install https://github.com/owner/repo`
