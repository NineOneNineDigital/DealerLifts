export type {
  CategoryFilterArgs,
  SearchFilterArgs,
} from "@/lib/store/source-shopify";
// biome-ignore lint/performance/noBarrelFile: thin adapter — intentional direct re-export from Shopify implementation
export {
  getBrandBySlug,
  getCategoryBySlug,
  getInventoryByProductId,
  getProductBySlug,
  listBrands,
  listBrandsWithCategories,
  listFeaturedProducts,
  listNewProducts,
  listProductsByBrand,
  listProductsByBrandFiltered,
  listProductsByCategory,
  listProductsByCategoryFiltered,
  listProductsByVehicleFiltered,
  listTopLevelCategories,
  searchProducts,
  searchProductsFiltered,
} from "@/lib/store/source-shopify";

export function getStorefrontSource(): "shopify" {
  return "shopify";
}
