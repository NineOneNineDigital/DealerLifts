"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

export const syncDelta = internalAction({
  args: {},
  handler: async (ctx) => {
    const token = await ctx.runAction(internal.turn14.auth.ensureToken);

    const res = await fetch("https://apitest.turn14.com/v1/inventory/updates", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error(`Inventory sync failed: ${res.status}`);
      return;
    }

    const json = await res.json();
    const items = json.data || [];

    for (const item of items) {
      const turn14Id = Number(item.id);
      const attrs = item.attributes || {};

      const product = await ctx.runQuery(internal.turn14.syncQueries.getProductByTurn14Id, {
        turn14Id,
      });

      if (!product) continue;

      const totalStock = Number(attrs.inventory?.total || 0);
      await ctx.runMutation(internal.turn14.syncHelpers.upsertInventory, {
        productId: product._id,
        totalStock,
        isInStock: totalStock > 0,
      });
    }
  },
});
