import {
  collectionByHandle,
  listBrandsWithProducts,
  listCollections,
} from "@/lib/shopify/queries/collections";
import {
  listProducts,
  productByHandle,
  searchProducts as shopifySearchProducts,
} from "@/lib/shopify/queries/products";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/shopify/types";
import type {
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
  const allImages = p.featuredImage
    ? [p.featuredImage.url, ...p.images.nodes.map((i) => i.url)]
    : p.images.nodes.map((i) => i.url);

  return {
    brandId: null,
    brandName: p.vendor || null,
    categoryId: null,
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

function mapCollectionToBrand(c: ShopifyCollection): NormalizedBrand {
  const logoMetafield = c.metafields.find(
    (m) => m?.namespace === "custom" && m.key === "brand_logo"
  );
  return {
    description: c.description || null,
    id: c.id,
    logo: logoMetafield?.value ?? c.image?.url ?? null,
    name: c.title,
    slug: c.handle,
    source: "shopify",
  };
}

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

export async function searchProducts(
  query: string,
  limit = 24
): Promise<NormalizedProduct[]> {
  const page = await shopifySearchProducts({ query, first: limit }, NO_STORE);
  return page.nodes.map(mapProduct);
}

export async function listBrands(): Promise<NormalizedBrand[]> {
  const nodes = await listBrandsWithProducts(100, NO_STORE);
  return nodes
    .filter((c) => {
      // Exclude top-level category collections (they use the `is_top_level`
      // metafield to opt in to the category section; they should not show in
      // the brand strip).
      const flag = c.metafields.find(
        (m) => m?.namespace === "custom" && m.key === "is_top_level"
      );
      if (flag?.value === "true") {
        return false;
      }
      // Require at least one product synced — Turn14 brands the merchant has
      // not yet accepted produce empty collections that shouldn't surface.
      return c.products.nodes.length > 0;
    })
    .map(mapCollectionToBrand);
}

export async function getBrandBySlug(
  slug: string
): Promise<NormalizedBrand | null> {
  const c = await collectionByHandle({ handle: slug, first: 1 }, NO_STORE);
  return c ? mapCollectionToBrand(c) : null;
}

export async function listProductsByBrand(
  brandSlug: string,
  limit = 24
): Promise<NormalizedProduct[]> {
  const c = await collectionByHandle(
    { handle: brandSlug, first: limit },
    NO_STORE
  );
  return c?.products.nodes.map(mapProduct) ?? [];
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
