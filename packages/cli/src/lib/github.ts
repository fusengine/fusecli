/**
 * GitHub URL and shorthand parsing for FuseCLI install command.
 * @module
 */

/** Parsed GitHub repository reference */
export interface GithubRef {
  owner: string;
  repo: string;
  cloneUrl: string;
}

/**
 * Resolves a GitHub source string into a structured reference.
 * Accepts: full URL, owner/repo shorthand, or registry name.
 * @param source - GitHub URL, "owner/repo", or package name
 * @returns Parsed GithubRef with clone URL
 */
export function resolveGithubSource(source: string): GithubRef {
  if (source.startsWith("https://github.com/")) {
    const parts = source.replace("https://github.com/", "").split("/");
    return {
      owner: parts[0] ?? "",
      repo: (parts[1] ?? "").replace(/\.git$/, ""),
      cloneUrl: source.endsWith(".git") ? source : `${source}.git`,
    };
  }

  if (source.includes("/")) {
    const [owner = "", repo = ""] = source.split("/");
    return {
      owner,
      repo,
      cloneUrl: `https://github.com/${owner}/${repo}.git`,
    };
  }

  return {
    owner: "fusecli",
    repo: source,
    cloneUrl: `https://github.com/fusecli/${source}.git`,
  };
}
