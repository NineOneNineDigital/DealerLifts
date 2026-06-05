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
  listProductsByCategory,
  listTopLevelCategories,
  searchProducts,
} from "@/lib/store/source-shopify";

export function getStorefrontSource(): "shopify" {
  return "shopify";
}
