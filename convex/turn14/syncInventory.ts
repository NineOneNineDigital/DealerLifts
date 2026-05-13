"use node";

import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { getApiBase } from "./config";
import { fetchWithRetry } from "./fetchWithRetry";

export const syncDelta = internalAction({
  args: {},
  handler: async (ctx) => {
    const token = await ctx.runAction(internal.turn14.auth.ensureToken);

    // Read the last successful inventory sync timestamp (F2 — delta cursor)
    const syncState = await ctx.runQuery(internal.syncAdmin.getByType, {
      syncType: "inventory",
    });
    const lastSyncedAt: number | undefined = syncState?.lastSyncedAt;

    const sinceParam = lastSyncedAt
      ? `?updated_since=${new Date(lastSyncedAt).toISOString()}`
      : "";

    // Mark as running; do NOT advance lastSyncedAt until the loop completes
    await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
      syncType: "inventory",
      lastPage: 0,
      status: "running",
    });

    let page = 1;
    let totalPages = 1;

    try {
      do {
        const url = `${getApiBase()}/v1/inventory/updates${sinceParam}${sinceParam ? "&" : "?"}page=${page}`;

        const res = await fetchWithRetry(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const body = await res.text();
          console.error(
            `[inventory] HTTP ${res.status} on page ${page}:`,
            body.slice(0, 200)
          );
          await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
            syncType: "inventory",
            lastPage: page,
            status: "error",
            error: `HTTP ${res.status} on page ${page}`,
          });
          return;
        }

        const json = await res.json();
        const items = json.data || [];
        totalPages = json.meta?.total_pages ?? 1;

        console.log(
          `[inventory] Page ${page}/${totalPages}: ${items.length} updates`
        );

        for (const item of items) {
          const turn14Id = Number(item.id);
          const attrs = item.attributes || {};

          const product = await ctx.runQuery(
            internal.turn14.syncQueries.getProductByTurn14Id,
            { turn14Id }
          );

          if (!product) {
            continue;
          }

          const totalStock = Number(attrs.inventory?.total ?? 0);
          await ctx.runMutation(internal.turn14.syncHelpers.upsertInventory, {
            productId: product._id,
            totalStock,
            isInStock: totalStock > 0,
          });
        }

        page++;
      } while (page <= totalPages);
    } catch (err) {
      // Mid-loop failure — do NOT advance cursor
      console.error("[inventory] Sync failed mid-loop:", err);
      await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
        syncType: "inventory",
        lastPage: page,
        status: "error",
        error: String(err),
      });
      return;
    }

    // Loop completed successfully — advance cursor
    await ctx.runMutation(internal.turn14.syncHelpers.upsertSyncState, {
      syncType: "inventory",
      lastPage: totalPages,
      totalPages,
      status: "complete",
    });
  },
});
