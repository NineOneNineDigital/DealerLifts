export type StorefrontSource = "convex" | "shopify";

export interface NormalizedProduct {
  brandId: string | null;
  brandName: string | null;
  categoryId: string | null;
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
  slug: string;
  source: StorefrontSource;
}

export interface NormalizedCategory {
  description: string | null;
  id: string;
  name: string;
  slug: string;
  source: StorefrontSource;
}

export interface NormalizedInventory {
  isInStock: boolean;
  productId: string;
  totalStock: number;
}
