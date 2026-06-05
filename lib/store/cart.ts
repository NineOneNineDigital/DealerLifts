// biome-ignore lint/performance/noBarrelFile: thin adapter — intentional direct re-export from Shopify implementation
export {
  addLine,
  clearCart,
  getCart,
  removeLine,
  updateLine,
} from "@/lib/store/cart-shopify";
