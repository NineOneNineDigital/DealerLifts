import { unstable_cache as nextCache } from "next/cache";
import {
  collectionByHandle,
  listCollections,
} from "@/lib/shopify/queries/collections";
import {
  listAllVendors,
  listProducts,
  productByHandle,
  searchProducts as shopifySearchProducts,
} from "@/lib/shopify/queries/products";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/shopify/types";
import type {
  BrandWithCategories,
  NormalizedBrand,
  NormalizedCategory,
  NormalizedInventory,
  NormalizedProduct,
} from "@/lib/store/types";

const NO_STORE = { cache: "no-store" as const };

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
  // Only treat compareAtPrice as a markdown when it is strictly higher than the
  // selling price — Shopify leaves stale compareAt values on some variants.
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

// This store has no brand collections — brands are the distinct product
// `vendor` values. Brands therefore have no logo or description from Shopify;
// the brand strip falls back to rendering the name as a wordmark.
function slugifyBrand(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function vendorToBrand(
  name: string,
  productCount: number | null = null
): NormalizedBrand {
  return {
    description: null,
    id: name,
    logo: null,
    name,
    productCount,
    slug: slugifyBrand(name),
    source: "shopify",
  };
}

// Enumerating vendors pages through every product, so cache the aggregate for a
// day rather than re-running it on each storefront render.
const getVendorsCached = nextCache(
  () => listAllVendors(),
  // v4 — full-catalog pagination (raised page cap); shape adds topCategories.
  ["shopify-brand-vendors-v4"],
  { revalidate: 60 * 60 * 24 }
);

function mapCollectionToCategory(c: ShopifyCollection): NormalizedCategory {
  return {
    description: c.description || null,
    id: c.id,
    image: c.image?.url ?? null,
    name: c.title,
    slug: c.handle,
    source: "shopify",
  };
}

export async function listFeaturedProducts(
  limit = 8
): Promise<NormalizedProduct[]> {
  const page = await shopifySearchProducts(
    { query: "tag:featured", first: limit },
    NO_STORE
  );
  return page.nodes.map(mapProduct);
}

export async function listNewProducts(limit = 4): Promise<NormalizedProduct[]> {
  const page = await listProducts({ first: limit }, NO_STORE);
  return page.nodes.map(mapProduct);
}

export async function getProductBySlug(
  slug: string
): Promise<NormalizedProduct | null> {
  const p = await productByHandle(slug, NO_STORE);
  return p ? mapProduct(p) : null;
}

/**
 * Builds a field-scoped Shopify search query from a user's free-text term.
 *
 * A bare term (e.g. `bumper`) searches the product body/description too, so
 * loosely-related products (an air-spring kit whose description mentions
 * "bumper-pull trailers") outrank exact matches. Scoping each token to
 * title/type/vendor/tag/sku with a prefix wildcard keeps results relevant
 * while still covering brand, category, and part-number searches. Tokens are
 * AND-ed so every word must match somewhere.
 */
const WHITESPACE_RE = /\s+/;
const UNSAFE_QUERY_CHARS_RE = /['"\\():*]/g;

function buildSearchQuery(term: string): string {
  const tokens = term
    .trim()
    .split(WHITESPACE_RE)
    .map((t) => t.replace(UNSAFE_QUERY_CHARS_RE, ""))
    .filter(Boolean)
    .slice(0, 6);
  if (tokens.length === 0) {
    return "";
  }
  return tokens
    .map(
      (t) =>
        `(title:${t}* OR product_type:${t}* OR vendor:${t}* OR tag:${t}* OR sku:${t}*)`
    )
    .join(" AND ");
}

export async function searchProducts(
  query: string,
  limit = 24
): Promise<NormalizedProduct[]> {
  const scoped = buildSearchQuery(query);
  if (!scoped) {
    return [];
  }
  const page = await shopifySearchProducts(
    { query: scoped, first: limit },
    NO_STORE
  );
  return page.nodes.map(mapProduct);
}

export async function listBrands(): Promise<NormalizedBrand[]> {
  const vendors = await getVendorsCached();
  // Already sorted by popularity (product count) in listAllVendors.
  return vendors.map((v) => vendorToBrand(v.name, v.count));
}

export async function listBrandsWithCategories(): Promise<
  BrandWithCategories[]
> {
  const vendors = await getVendorsCached();
  return vendors.map((v) => ({
    ...vendorToBrand(v.name, v.count),
    topCategories: v.topCategories,
  }));
}

export async function getBrandBySlug(
  slug: string
): Promise<NormalizedBrand | null> {
  const vendors = await getVendorsCached();
  const match = vendors.find((v) => slugifyBrand(v.name) === slug);
  return match ? vendorToBrand(match.name, match.count) : null;
}

export async function listProductsByBrand(
  brandSlug: string,
  limit = 24
): Promise<NormalizedProduct[]> {
  const vendors = await getVendorsCached();
  const vendor = vendors.find((v) => slugifyBrand(v.name) === brandSlug);
  if (!vendor) {
    return [];
  }
  const page = await shopifySearchProducts(
    { query: `vendor:"${vendor.name}"`, first: limit },
    NO_STORE
  );
  return page.nodes.map(mapProduct);
}

/**
 * Returns collections whose `custom.is_top_level` metafield is set to
 * the string `"true"`. Set this metafield in Shopify Admin on the
 * collections you want to surface as top-level categories — otherwise
 * this function returns an empty array. The Convex equivalent uses
 * `parentId === undefined`, which is a structural condition with no
 * setup required.
 */
export async function listTopLevelCategories(): Promise<NormalizedCategory[]> {
  const page = await listCollections({ first: 100 }, NO_STORE);
  return page.nodes
    .filter((c) => {
      const flag = c.metafields.find(
        (m) => m?.namespace === "custom" && m.key === "is_top_level"
      );
      return flag?.value === "true";
    })
    .map(mapCollectionToCategory);
}

export async function getCategoryBySlug(
  slug: string
): Promise<NormalizedCategory | null> {
  const c = await collectionByHandle({ handle: slug, first: 1 }, NO_STORE);
  return c ? mapCollectionToCategory(c) : null;
}

export async function listProductsByCategory(
  categorySlug: string,
  limit = 24
): Promise<NormalizedProduct[]> {
  const c = await collectionByHandle(
    { handle: categorySlug, first: limit },
    NO_STORE
  );
  return c?.products.nodes.map(mapProduct) ?? [];
}

export function getInventoryByProductId(
  _productId: string
): Promise<NormalizedInventory | null> {
  // Shopify inventory rides with the product. The Storefront API can't fetch
  // inventory by product GID alone — variants must be selected. For Phase 1a-
  // pages, inventory comes bundled with the product through getProductBySlug.
  // This function exists for adapter parity but returns null on the Shopify
  // side.
  return Promise.resolve(null);
}
