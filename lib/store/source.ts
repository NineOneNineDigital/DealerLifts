import {
  getBrandBySlug as convexGetBrandBySlug,
  getCategoryBySlug as convexGetCategoryBySlug,
  getInventoryByProductId as convexGetInventoryByProductId,
  getProductBySlug as convexGetProductBySlug,
  listBrands as convexListBrands,
  listFeaturedProducts as convexListFeaturedProducts,
  listNewProducts as convexListNewProducts,
  listProductsByBrand as convexListProductsByBrand,
  listProductsByCategory as convexListProductsByCategory,
  listTopLevelCategories as convexListTopLevelCategories,
  searchProducts as convexSearchProducts,
} from "@/lib/store/source-convex";
import {
  getBrandBySlug as shopifyGetBrandBySlug,
  getCategoryBySlug as shopifyGetCategoryBySlug,
  getInventoryByProductId as shopifyGetInventoryByProductId,
  getProductBySlug as shopifyGetProductBySlug,
  listBrands as shopifyListBrands,
  listFeaturedProducts as shopifyListFeaturedProducts,
  listNewProducts as shopifyListNewProducts,
  listProductsByBrand as shopifyListProductsByBrand,
  listProductsByCategory as shopifyListProductsByCategory,
  listTopLevelCategories as shopifyListTopLevelCategories,
  searchProducts as shopifySearchProducts,
} from "@/lib/store/source-shopify";
import type { StorefrontSource } from "@/lib/store/types";

function getSource(): StorefrontSource {
  const flag = process.env.STOREFRONT_SOURCE;
  return flag === "shopify" ? "shopify" : "convex";
}

export function getStorefrontSource(): StorefrontSource {
  return getSource();
}

export function listFeaturedProducts(limit?: number) {
  return getSource() === "shopify"
    ? shopifyListFeaturedProducts(limit)
    : convexListFeaturedProducts(limit);
}

export function listNewProducts(limit?: number) {
  return getSource() === "shopify"
    ? shopifyListNewProducts(limit)
    : convexListNewProducts(limit);
}

export function getProductBySlug(slug: string) {
  return getSource() === "shopify"
    ? shopifyGetProductBySlug(slug)
    : convexGetProductBySlug(slug);
}

export function searchProducts(query: string, limit?: number) {
  return getSource() === "shopify"
    ? shopifySearchProducts(query, limit)
    : convexSearchProducts(query, limit);
}

export function listBrands() {
  return getSource() === "shopify" ? shopifyListBrands() : convexListBrands();
}

export function getBrandBySlug(slug: string) {
  return getSource() === "shopify"
    ? shopifyGetBrandBySlug(slug)
    : convexGetBrandBySlug(slug);
}

export function listProductsByBrand(brandId: string, limit?: number) {
  return getSource() === "shopify"
    ? shopifyListProductsByBrand(brandId, limit)
    : convexListProductsByBrand(brandId, limit);
}

export function listTopLevelCategories() {
  return getSource() === "shopify"
    ? shopifyListTopLevelCategories()
    : convexListTopLevelCategories();
}

export function getCategoryBySlug(slug: string) {
  return getSource() === "shopify"
    ? shopifyGetCategoryBySlug(slug)
    : convexGetCategoryBySlug(slug);
}

export function listProductsByCategory(categoryId: string, limit?: number) {
  return getSource() === "shopify"
    ? shopifyListProductsByCategory(categoryId, limit)
    : convexListProductsByCategory(categoryId, limit);
}

export function getInventoryByProductId(productId: string) {
  return getSource() === "shopify"
    ? shopifyGetInventoryByProductId(productId)
    : convexGetInventoryByProductId(productId);
}
