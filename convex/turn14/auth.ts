"use node";

import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { getApiBase } from "./config";
import { fetchWithRetry } from "./fetchWithRetry";

export const ensureToken = internalAction({
  args: {},
  handler: async (ctx): Promise<string> => {
    const existing = await ctx.runQuery(internal.turn14.tokenQueries.getToken);

    if (existing && existing.expiresAt > Date.now() + 5 * 60 * 1000) {
      return existing.accessToken;
    }

    const clientId = process.env.TURN14_CLIENT_ID;
    const clientSecret = process.env.TURN14_CLIENT_SECRET;

    if (!(clientId && clientSecret)) {
      throw new Error("TURN14_CLIENT_ID and TURN14_CLIENT_SECRET must be set");
    }

    const res = await fetchWithRetry(`${getApiBase()}/v1/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!res.ok) {
      throw new Error(`Turn14 auth failed: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    const accessToken = data.access_token as string;
    if (!accessToken) {
      throw new Error("No access_token in Turn14 response");
    }
    const expiresIn = (data.expires_in as number) || 3600;
    const expiresAt = Date.now() + expiresIn * 1000;
    console.log("[auth] Got token, expires in", expiresIn, "seconds");

    await ctx.runMutation(internal.turn14.tokenQueries.saveToken, {
      accessToken,
      expiresAt,
    });

    return accessToken;
  },
});
