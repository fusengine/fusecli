/**
 * Generates the auth command file for a standalone CLI.
 * Provides auth set/show/test/remove + login (OAuth2) subcommands.
 */

import type { IR } from "@/ir/types.js";

/**
 * Generate the auth command file content.
 * @param ir - The intermediate representation (for auth type detection).
 * @returns TypeScript source code string.
 */
export function generateAuthCommand(ir: IR): string {
  const isOAuth = ir.auth.type === "oauth2";
  const loginCmd = isOAuth
    ? buildOAuthLogin(ir.auth.authorizationUrl ?? "", ir.auth.tokenUrl ?? "")
    : "";
  return `import type { Command } from "commander";
import { readCredential, writeCredential, deleteCredential, redactCredential } from "../lib/auth.js";
import { render } from "../lib/output.js";
import { catchError } from "../lib/errors.js";
import { BASE_URL } from "../lib/config.js";

export function registerAuthCommand(program: Command): void {
  const auth = program.command("auth").description("Manage authentication");

  auth.command("set <token>").description("Store an API token")
    .action(async (token) => { try { writeCredential(token); console.log("Token saved."); } catch(e) { catchError(e); } });

  auth.command("show").description("Display stored token (masked)").option("--raw", "Show unmasked")
    .action(async (opts) => { try { render(opts.raw ? readCredential() : redactCredential(readCredential()), program.opts()); } catch(e) { catchError(e); } });

  auth.command("test").description("Test token against API")
    .action(async () => { try { const r = await fetch(BASE_URL, { headers: { Authorization: \`Bearer \${readCredential()}\` } }); console.log(r.ok ? "Valid." : \`Failed: \${r.status}\`); } catch(e) { catchError(e); } });

  auth.command("remove").description("Remove stored token")
    .action(async () => { try { deleteCredential(); console.log("Removed."); } catch(e) { catchError(e); } });
${loginCmd}
}
`;
}

/** Generate OAuth2 login command that opens browser + local callback server. */
function buildOAuthLogin(authUrl: string, tokenUrl: string): string {
  if (!authUrl || !tokenUrl) return "";
  return `
  auth.command("login").description("Login via browser (OAuth2)")
    .requiredOption("--client-id <id>", "OAuth2 client ID (or OAUTH_CLIENT_ID env)")
    .option("--client-secret <secret>", "OAuth2 client secret (or OAUTH_CLIENT_SECRET env)")
    .action(async (opts: { clientId?: string; clientSecret?: string }) => {
      try {
        const cid = opts.clientId ?? process.env.OAUTH_CLIENT_ID;
        if (!cid) { console.error("Missing --client-id"); process.exit(2); }
        const cs = opts.clientSecret ?? process.env.OAUTH_CLIENT_SECRET ?? "";
        const { createServer } = await import("node:http");
        let resolve: (v: string) => void;
        const codeP = new Promise<string>(r => { resolve = r; });
        const server = createServer((req, res) => {
          const c = new URL(req.url ?? "", "http://localhost").searchParams.get("code");
          if (c) { res.end("<h1>Done! Close this tab.</h1>"); server.close(); resolve(c); }
          else res.end("Waiting...");
        });
        server.listen(0);
        const port = (server.address() as any).port;
        const rd = \`http://localhost:\${port}\`;
        Bun.spawn(["open", \`${authUrl}?client_id=\${cid}&redirect_uri=\${rd}&response_type=code&scope=openid%20https://www.googleapis.com/auth/cloud-platform&access_type=offline\`]);
        console.log("Opening browser...");
        const code = await codeP;
        const r = await fetch("${tokenUrl}", { method: "POST", headers: {"Content-Type":"application/x-www-form-urlencoded"}, body: \`grant_type=authorization_code&code=\${code}&redirect_uri=\${rd}&client_id=\${cid}&client_secret=\${cs}\` });
        const d = await r.json() as { access_token: string };
        writeCredential(d.access_token);
        console.log("Logged in!");
      } catch(e) { catchError(e); }
    });`;
}
