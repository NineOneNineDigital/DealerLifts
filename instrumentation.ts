export async function register() {
  // Only the Node.js runtime has the full server env; skip the Edge runtime pass.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertServerEnv } = await import("./lib/env");
    assertServerEnv();
  }
}
