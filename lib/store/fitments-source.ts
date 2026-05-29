// biome-ignore lint/performance/noBarrelFile: thin adapter — intentional direct re-export from Shopify implementation
export {
  getFitmentsForProduct,
  listMakes,
  listModels,
  listProductsByVehicle,
  listYears,
} from "@/lib/store/fitments-shopify";
