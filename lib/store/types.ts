export type StorefrontSource = "convex" | "shopify";

export interface NormalizedProduct {
  brandId: string | null;
  brandName: string | null;
  categoryId: string | null;
  /**
   * Original ("was") price in cents when the product is on sale — sourced from
   * the Shopify variant `compareAtPrice`. Null when there is no markdown.
   */
  compareAtPriceCents: number | null;
  description: string | null;
  id: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  mapPrice: number | null;
  partNumber: string;
  retailPrice: number | null;
  slug: string;
  source: StorefrontSource;
  thumbnail: string | null;
  title: string;
}

export interface NormalizedBrand {
  description: string | null;
  id: string;
  logo: string | null;
  name: string;
  /** Number of products carried for this brand, when known. */
  productCount: number | null;
  slug: string;
  source: StorefrontSource;
}

export interface BrandWithCategories extends NormalizedBrand {
  /** Top product types carried for this brand, most-common first. */
  topCategories: string[];
}

export interface NormalizedCategory {
  description: string | null;
  id: string;
  image: string | null;
  name: string;
  slug: string;
  source: StorefrontSource;
}

export interface NormalizedInventory {
  isInStock: boolean;
  productId: string;
  totalStock: number;
}

export interface NormalizedCartItem {
  id: string;
  partNumber: string;
  priceCents: number;
  productImage: string | null;
  productSlug: string;
  productTitle: string;
  quantity: number;
}

export interface NormalizedCart {
  checkoutUrl: string | null;
  itemCount: number;
  items: NormalizedCartItem[];
  source: StorefrontSource;
  subtotalCents: number;
}
