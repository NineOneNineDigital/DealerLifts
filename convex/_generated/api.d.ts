/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as brands from "../brands.js";
import type * as cart from "../cart.js";
import type * as categories from "../categories.js";
import type * as chat from "../chat.js";
import type * as chatAdmin from "../chatAdmin.js";
import type * as chatInternal from "../chatInternal.js";
import type * as crons from "../crons.js";
import type * as customersAdmin from "../customersAdmin.js";
import type * as fitments from "../fitments.js";
import type * as inventory from "../inventory.js";
import type * as inventoryAdmin from "../inventoryAdmin.js";
import type * as orders from "../orders.js";
import type * as ordersAdmin from "../ordersAdmin.js";
import type * as products from "../products.js";
import type * as productsAdmin from "../productsAdmin.js";
import type * as seedTestBrands from "../seedTestBrands.js";
import type * as syncAdmin from "../syncAdmin.js";
import type * as syncBrands from "../syncBrands.js";
import type * as turn14_auth from "../turn14/auth.js";
import type * as turn14_discoverBrands from "../turn14/discoverBrands.js";
import type * as turn14_syncHelpers from "../turn14/syncHelpers.js";
import type * as turn14_syncInventory from "../turn14/syncInventory.js";
import type * as turn14_syncProducts from "../turn14/syncProducts.js";
import type * as turn14_syncQueries from "../turn14/syncQueries.js";
import type * as turn14_tokenQueries from "../turn14/tokenQueries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  brands: typeof brands;
  cart: typeof cart;
  categories: typeof categories;
  chat: typeof chat;
  chatAdmin: typeof chatAdmin;
  chatInternal: typeof chatInternal;
  crons: typeof crons;
  customersAdmin: typeof customersAdmin;
  fitments: typeof fitments;
  inventory: typeof inventory;
  inventoryAdmin: typeof inventoryAdmin;
  orders: typeof orders;
  ordersAdmin: typeof ordersAdmin;
  products: typeof products;
  productsAdmin: typeof productsAdmin;
  seedTestBrands: typeof seedTestBrands;
  syncAdmin: typeof syncAdmin;
  syncBrands: typeof syncBrands;
  "turn14/auth": typeof turn14_auth;
  "turn14/discoverBrands": typeof turn14_discoverBrands;
  "turn14/syncHelpers": typeof turn14_syncHelpers;
  "turn14/syncInventory": typeof turn14_syncInventory;
  "turn14/syncProducts": typeof turn14_syncProducts;
  "turn14/syncQueries": typeof turn14_syncQueries;
  "turn14/tokenQueries": typeof turn14_tokenQueries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
