import { unstable_cache as nextCache } from "next/cache";
import {
  listAllProductTags,
  productsByVehicleTag,
} from "@/lib/shopify/queries/fitments";
import type { ShopifyProduct } from "@/lib/shopify/types";
import {
  parseFitmentsFromTags,
  parseFitmentTag,
  vehicleTagPrefix,
} from "@/lib/store/fitments";
import type { NormalizedProduct } from "@/lib/store/types";

const NO_STORE = { cache: "no-store" as const };
const AGGREGATE_REVALIDATE_SECONDS = 60 * 60 * 24; // 24 hours

interface ParsedFitmentLite {
  make: string;
  model: string;
  submodel: string;
  year: number;
}

function parseMoneyToCents(amount: string | undefined): number | null {
  if (!amount) {
    return null;
  }
  const num = Number(amount);
  if (!Number.isFinite(num)) {
    return null;
  }
  return Math.round(num * 100);
}

function mapProduct(p: ShopifyProduct): NormalizedProduct {
  const variant = p.variants.nodes[0];
  const priceCents = parseMoneyToCents(variant?.price.amount);
  const compareAtCents = parseMoneyToCents(variant?.compareAtPrice?.amount);
  const onSale =
    compareAtCents != null && priceCents != null && compareAtCents > priceCents;
  const allImages = p.featuredImage
    ? [p.featuredImage.url, ...p.images.nodes.map((i) => i.url)]
    : p.images.nodes.map((i) => i.url);
  return {
    brandId: null,
    brandName: p.vendor || null,
    categoryId: null,
    compareAtPriceCents: onSale ? compareAtCents : null,
    description: p.description || null,
    id: variant?.id ?? p.id,
    images: Array.from(new Set(allImages)),
    isActive: variant?.availableForSale ?? false,
    isFeatured: p.tags.includes("featured"),
    mapPrice: null,
    partNumber: variant?.sku ?? p.handle,
    retailPrice: priceCents,
    slug: p.handle,
    source: "shopify",
    thumbnail: p.featuredImage?.url ?? null,
    title: p.title,
  };
}

const getAllFitmentsCached = nextCache(
  async (): Promise<ParsedFitmentLite[]> => {
    const { tagSets } = await listAllProductTags();
    const fitments: ParsedFitmentLite[] = [];
    for (const tags of tagSets) {
      for (const tag of tags) {
        const parsed = parseFitmentTag(tag);
        if (parsed) {
          fitments.push({
            make: parsed.make,
            model: parsed.model,
            submodel: parsed.submodel,
            year: parsed.year,
          });
        }
      }
    }
    return fitments;
  },
  ["shopify-fitments-aggregate"],
  { revalidate: AGGREGATE_REVALIDATE_SECONDS }
);

function titleCase(s: string): string {
  return s
    .split("-")
    .map((word) =>
      word.length === 0 ? word : word[0].toUpperCase() + word.slice(1)
    )
    .join(" ");
}

export async function listYears(): Promise<number[]> {
  const fitments = await getAllFitmentsCached();
  const set = new Set<number>();
  for (const f of fitments) {
    set.add(f.year);
  }
  return Array.from(set).sort((a, b) => b - a);
}

export async function listMakes(year: number): Promise<string[]> {
  const fitments = await getAllFitmentsCached();
  const set = new Set<string>();
  for (const f of fitments) {
    if (f.year === year) {
      set.add(f.make);
    }
  }
  return Array.from(set).sort().map(titleCase);
}

export async function listModels(
  year: number,
  make: string
): Promise<string[]> {
  const fitments = await getAllFitmentsCached();
  const m = make.toLowerCase().replace(/\s+/g, "-");
  const set = new Set<string>();
  for (const f of fitments) {
    if (f.year === year && f.make === m) {
      set.add(f.model);
    }
  }
  return Array.from(set).sort().map(titleCase);
}

export async function listSubmodels(
  year: number,
  make: string,
  model: string
): Promise<string[]> {
  const fitments = await getAllFitmentsCached();
  const m = make.toLowerCase().replace(/\s+/g, "-");
  const mod = model.toLowerCase().replace(/\s+/g, "-");
  const set = new Set<string>();
  for (const f of fitments) {
    if (f.year === year && f.make === m && f.model === mod) {
      set.add(f.submodel);
    }
  }
  return Array.from(set).sort().map(titleCase);
}

export async function getFitmentsForProduct(
  productSlug: string
): Promise<ParsedFitmentLite[]> {
  const page = await productsByVehicleTag(
    { first: 1, query: `handle:${productSlug}` },
    NO_STORE
  );
  const product = page.nodes[0];
  if (!product) {
    return [];
  }
  return parseFitmentsFromTags(product.tags).map((p) => ({
    make: p.make,
    model: p.model,
    submodel: p.submodel,
    year: p.year,
  }));
}

export async function listProductsByVehicle(args: {
  year: number;
  make: string;
  model: string;
  submodel?: string;
  limit?: number;
}): Promise<NormalizedProduct[]> {
  const prefix = vehicleTagPrefix(
    args.year,
    args.make,
    args.model,
    args.submodel
  );
  const page = await productsByVehicleTag(
    {
      first: args.limit ?? 24,
      query: `tag:${prefix}*`,
    },
    NO_STORE
  );
  return page.nodes.map(mapProduct);
}
