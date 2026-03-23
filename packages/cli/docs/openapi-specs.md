# OpenAPI Specs

## What Is an OpenAPI Spec?

An OpenAPI spec (formerly Swagger) is a machine-readable description of a REST API. It lists all endpoints, parameters, request bodies, and response formats.

FuseCLI reads this spec and generates a CLI automatically.

## Supported Versions

| Version | Support |
|---------|---------|
| OpenAPI 3.1 | Full |
| OpenAPI 3.0 | Full |
| Swagger 2.0 | Full |
| JSON format | Yes |
| YAML format | Yes |
| Remote URLs | Yes |
| Local files | Yes |

## Finding OpenAPI Specs

### Common Locations

Most APIs publish their spec at one of these paths:

```
https://api.example.com/openapi.json
https://api.example.com/swagger.json
https://api.example.com/api-docs
https://api.example.com/v1/openapi.yaml
https://docs.example.com/openapi.json
```

### Known APIs with Public Specs

| API | Spec URL |
|-----|----------|
| **Exa** | `https://raw.githubusercontent.com/exa-labs/openapi-spec/refs/heads/master/exa-openapi-spec.yaml` |
| **Context7** | `https://context7.mintlify.app/openapi.json` |
| **Stripe** | `https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json` |
| **GitHub** | `https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json` |

### Search on GitHub

Many APIs publish their spec on GitHub:

```
site:github.com "<api-name>" openapi.json OR openapi.yaml
```

## Writing Your Own Spec

For internal APIs without a spec, write a minimal one:

```yaml
openapi: "3.0.3"
info:
  title: My API
  description: My internal API
  version: "1.0.0"
servers:
  - url: https://api.mycompany.com/v1
paths:
  /users:
    get:
      operationId: listUsers
      summary: List all users
      tags: [users]
      parameters:
        - name: limit
          in: query
          schema: { type: integer }
        - name: page
          in: query
          schema: { type: integer }
      responses:
        "200": { description: OK }
    post:
      operationId: createUser
      summary: Create a user
      tags: [users]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name: { type: string }
                email: { type: string, format: email }
              required: [name, email]
      responses:
        "201": { description: Created }
  /users/{id}:
    get:
      operationId: getUser
      summary: Get a user by ID
      tags: [users]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200": { description: OK }
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
security:
  - bearerAuth: []
```

Then:

```bash
fusecli create myapi --openapi ./my-spec.yaml
fusecli bundle myapi
myapi-cli auth set "my-token"
myapi-cli users list --json
```

## Auth Types

FuseCLI auto-detects the auth type from the spec:

| Spec Declaration | Generated Auth |
|-----------------|----------------|
| `type: http, scheme: bearer` | `Authorization: Bearer <token>` |
| `type: apiKey, in: header, name: X-Api-Key` | `X-Api-Key: <token>` |
| `type: http, scheme: basic` | `Authorization: Basic <base64>` |

## Tips

- **Tags matter**: Endpoints are grouped by their first OpenAPI tag. Use meaningful tags like `users`, `projects`, `billing`.
- **operationId matters**: For POST endpoints, the operationId determines the CLI command name. `createUser` → `create`, `searchDocuments` → `search`.
- **Descriptions propagate**: The `summary` field becomes the CLI command description.
- **Body properties become options**: Each field in the request body becomes a `--field-name` CLI option.
- **Number types get coercion**: Fields typed as `integer` or `number` are automatically parsed from strings.
