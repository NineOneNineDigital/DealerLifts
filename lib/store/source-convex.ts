import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { getConvexServerClient } from "@/lib/store/convex-server";
import type {
  NormalizedBrand,
  NormalizedCategory,
  NormalizedInventory,
  NormalizedProduct,
} from "@/lib/store/types";

function mapProduct(
  doc: Doc<"products">,
  brandName?: string | null
): NormalizedProduct {
  return {
    brandId: doc.brandId ?? null,
    brandName: brandName ?? null,
    categoryId: doc.categoryId ?? null,
    description: doc.description ?? null,
    id: doc._id,
    images: doc.images ?? [],
    isActive: doc.isActive,
    isFeatured: doc.isFeatured ?? false,
    mapPrice: doc.mapPrice ?? null,
    partNumber: doc.partNumber,
    retailPrice: doc.retailPrice ?? null,
    slug: doc.slug,
    source: "convex",
    thumbnail: doc.thumbnail ?? null,
    title: doc.title,
  };
}

function mapBrand(doc: Doc<"brands">): NormalizedBrand {
  return {
    description: null,
    id: doc._id,
    logo: doc.logo ?? null,
    name: doc.name,
    slug: doc.slug,
    source: "convex",
  };
}

function mapCategory(doc: Doc<"categories">): NormalizedCategory {
  return {
    description: null,
    id: doc._id,
    name: doc.name,
    slug: doc.slug,
    source: "convex",
  };
}

export async function listFeaturedProducts(
  limit = 8
): Promise<NormalizedProduct[]> {
  const client = getConvexServerClient();
  const docs = await client.query(api.products.listFeatured, { limit });
  return docs.map((d) => mapProduct(d));
}

export async function listNewProducts(limit = 4): Promise<NormalizedProduct[]> {
  const client = getConvexServerClient();
  const docs = await client.query(api.products.listAll, { limit });
  return docs.map((d) => mapProduct(d));
}

export async function getProductBySlug(
  slug: string
): Promise<NormalizedProduct | null> {
  const client = getConvexServerClient();
  const doc = await client.query(api.products.getBySlug, { slug });
  if (!doc) {
    return null;
  }
  let brandName: string | null = null;
  if (doc.brandId) {
    const brand = await client.query(api.brands.getById, {
      id: doc.brandId as Id<"brands">,
    });
    brandName = brand?.name ?? null;
  }
  return mapProduct(doc, brandName);
}

export async function searchProducts(
  query: string,
  limit = 24
): Promise<NormalizedProduct[]> {
  const client = getConvexServerClient();
  const docs = await client.query(api.products.search, { query, limit });
  return docs.map((d) => mapProduct(d));
}

export async function listBrands(): Promise<NormalizedBrand[]> {
  const client = getConvexServerClient();
  const docs = await client.query(api.brands.list, {});
  return docs.map(mapBrand);
}

export async function getBrandBySlug(
  slug: string
): Promise<NormalizedBrand | null> {
  const client = getConvexServerClient();
  const doc = await client.query(api.brands.getBySlug, { slug });
  return doc ? mapBrand(doc) : null;
}

export async function listProductsByBrand(
  brandId: string,
  limit?: number
): Promise<NormalizedProduct[]> {
  const client = getConvexServerClient();
  const docs = await client.query(api.products.listByBrand, {
    brandId: brandId as Id<"brands">,
    limit,
  });
  return docs.map((d) => mapProduct(d));
}

export async function listTopLevelCategories(): Promise<NormalizedCategory[]> {
  const client = getConvexServerClient();
  const docs = await client.query(api.categories.listTopLevel, {});
  return docs.map(mapCategory);
}

export async function getCategoryBySlug(
  slug: string
): Promise<NormalizedCategory | null> {
  const client = getConvexServerClient();
  const doc = await client.query(api.categories.getBySlug, { slug });
  return doc ? mapCategory(doc) : null;
}

export async function listProductsByCategory(
  categoryId: string,
  limit?: number
): Promise<NormalizedProduct[]> {
  const client = getConvexServerClient();
  const docs = await client.query(api.products.listByCategory, {
    categoryId: categoryId as Id<"categories">,
    limit,
  });
  return docs.map((d) => mapProduct(d));
}

export async function getInventoryByProductId(
  productId: string
): Promise<NormalizedInventory | null> {
  const client = getConvexServerClient();
  const inv = await client.query(api.inventory.getByProductId, {
    productId: productId as Id<"products">,
  });
  if (!inv) {
    return null;
  }
  return {
    isInStock: inv.isInStock,
    productId: inv.productId,
    totalStock: inv.totalStock,
  };
}
