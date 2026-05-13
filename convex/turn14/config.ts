"use node";

/**
 * Returns the Turn14 API base URL.
 *
 * Defaults to sandbox (fail-safe). Set TURN14_SANDBOX="false" to use production.
 */
export function getApiBase(): string {
  if (process.env.TURN14_SANDBOX === "false") {
    return "https://api.turn14.com";
  }
  return "https://apitest.turn14.com";
}
