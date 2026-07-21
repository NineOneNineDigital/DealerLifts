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
import ymmTree from "./ymm-data.json";

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

/**
 * Nested YMM tree: year -> makeSlug -> modelSlug -> submodelSlug[].
 * Precomputed at build time into ymm-data.json (see scripts/build-ymm-tree.mjs)
 * so the vehicle filter reads it instantly instead of crawling the whole catalog
 * (~13s over ~87 sequential API pages) on the first request.
 */
type YmmTree = Record<string, Record<string, Record<string, string[]>>>;

const PRECOMPUTED_TREE = ymmTree as unknown as YmmTree;

/** Fallback: build the same tree from a full live crawl when ymm-data.json is
 * empty (e.g. the build step didn't run). Cached 24h so it only runs once. */
function getOrCreate<T>(
  obj: Record<string, T>,
  key: string,
  create: () => T
): T {
  const existing = obj[key];
  if (existing !== undefined) {
    return existing;
  }
  const created = create();
  obj[key] = created;
  return created;
}

const getTreeFromCrawlCached = nextCache(
  async (): Promise<YmmTree> => {
    const { tagSets } = await listAllProductTags();
    const tree: YmmTree = {};
    for (const tags of tagSets) {
      for (const tag of tags) {
        const parsed = parseFitmentTag(tag);
        if (!parsed) {
          continue;
        }
        const byMake = getOrCreate(tree, String(parsed.year), () => ({}));
        const byModel = getOrCreate(byMake, parsed.make, () => ({}));
        const submodels = getOrCreate(byModel, parsed.model, () => [] as string[]);
        if (!submodels.includes(parsed.submodel)) {
          submodels.push(parsed.submodel);
        }
      }
    }
    return tree;
  },
  ["shopify-ymm-tree"],
  { revalidate: AGGREGATE_REVALIDATE_SECONDS }
);

async function getYmmTree(): Promise<YmmTree> {
  if (Object.keys(PRECOMPUTED_TREE).length > 0) {
    return PRECOMPUTED_TREE;
  }
  return await getTreeFromCrawlCached();
}

function titleCase(s: string): string {
  return s
    .split("-")
    .map((word) =>
      word.length === 0 ? word : word[0].toUpperCase() + word.slice(1)
    )
    .join(" ");
}

function makeSlug(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export async function listYears(): Promise<number[]> {
  const tree = await getYmmTree();
  return Object.keys(tree)
    .map(Number)
    .sort((a, b) => b - a);
}

export async function listMakes(year: number): Promise<string[]> {
  const tree = await getYmmTree();
  const makes = tree[String(year)];
  if (!makes) {
    return [];
  }
  return Object.keys(makes).sort().map(titleCase);
}

export async function listModels(
  year: number,
  make: string
): Promise<string[]> {
  const tree = await getYmmTree();
  const models = tree[String(year)]?.[makeSlug(make)];
  if (!models) {
    return [];
  }
  return Object.keys(models).sort().map(titleCase);
}

export async function listSubmodels(
  year: number,
  make: string,
  model: string
): Promise<string[]> {
  const tree = await getYmmTree();
  const submodels = tree[String(year)]?.[makeSlug(make)]?.[makeSlug(model)];
  if (!submodels) {
    return [];
  }
  return [...submodels].sort().map(titleCase);
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
