import { mutation } from "./_generated/server";

/**
 * Seeds the syncBrands table with the initial test brands.
 *
 * Run via dashboard or CLI after discovering Turn14 brand IDs:
 *   npx convex run seedTestBrands:seed
 *
 * Update the brand IDs below after running:
 *   npx convex run turn14/discoverBrands:discover
 */

// TODO: Replace 0 with actual Turn14 brand IDs after running discover
const TEST_BRANDS: Array<{ turn14BrandId: number; brandName: string }> = [
  { turn14BrandId: 0, brandName: "Air Lift" },
  { turn14BrandId: 0, brandName: "AirDog" },
  { turn14BrandId: 0, brandName: "AMP Research" },
  { turn14BrandId: 0, brandName: "ARB" },
  { turn14BrandId: 0, brandName: "Artec Industries" },
  { turn14BrandId: 0, brandName: "BackRack" },
  { turn14BrandId: 0, brandName: "Baja Designs" },
  { turn14BrandId: 0, brandName: "BAK Industries" },
  { turn14BrandId: 0, brandName: "Banks Power" },
  { turn14BrandId: 0, brandName: "Belltech" },
  { turn14BrandId: 0, brandName: "Bilstein" },
];

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    let added = 0;
    let skipped = 0;

    for (const brand of TEST_BRANDS) {
      if (brand.turn14BrandId === 0) {
        console.log(`[seed] Skipping "${brand.brandName}" — no Turn14 ID set`);
        skipped++;
        continue;
      }

      const existing = await ctx.db
        .query("syncBrands")
        .withIndex("by_turn14BrandId", (q) =>
          q.eq("turn14BrandId", brand.turn14BrandId),
        )
        .first();

      if (existing) {
        console.log(`[seed] "${brand.brandName}" already exists — skipping`);
        skipped++;
        continue;
      }

      await ctx.db.insert("syncBrands", {
        turn14BrandId: brand.turn14BrandId,
        brandName: brand.brandName,
        isEnabled: true,
      });
      console.log(`[seed] Added "${brand.brandName}" (ID: ${brand.turn14BrandId})`);
      added++;
    }

    return { added, skipped, total: TEST_BRANDS.length };
  },
});
