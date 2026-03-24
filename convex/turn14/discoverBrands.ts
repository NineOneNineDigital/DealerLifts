"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * Fetches all available brands from Turn14 API.
 * Called from the admin brands page to populate the brand picker.
 */
export const fetchAll = action({
  args: {},
  handler: async (ctx): Promise<Array<{ id: number; name: string }>> => {
    const token: string = await ctx.runAction(internal.turn14.auth.ensureToken);

    // Try the brands endpoint first
    const res = await fetch("https://apitest.turn14.com/v1/brands", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const json = await res.json();
      const brands = json.data || [];
      const results: Array<{ id: number; name: string }> = [];

      for (const brand of brands) {
        const id = Number(brand.id);
        const name =
          brand.attributes?.name || brand.name || `Brand ${id}`;
        results.push({ id, name });
      }

      results.sort((a, b) => a.name.localeCompare(b.name));
      return results;
    }

    // Fallback: scan items to collect unique brands
    console.log(
      `[discover] Brands endpoint returned HTTP ${res.status}, falling back to item scan`,
    );
    return await discoverFromItems(token);
  },
});

async function discoverFromItems(
  token: string,
): Promise<Array<{ id: number; name: string }>> {
  const brandMap = new Map<number, string>();
  let page = 1;
  const maxPages = 20;

  while (page <= maxPages) {
    const res = await fetch(
      `https://apitest.turn14.com/v1/items?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) break;

    const json = await res.json();
    const items = json.data || [];
    const meta = json.meta || {};
    const totalPages = meta.total_pages || 1;

    for (const item of items) {
      const attrs = item.attributes || {};
      if (attrs.brand_id && attrs.brand) {
        brandMap.set(Number(attrs.brand_id), attrs.brand);
      }
    }

    if (page >= totalPages) break;
    page++;
  }

  return Array.from(brandMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
