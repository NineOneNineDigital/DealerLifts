// The storefront's market country for Storefront API reads.
//
// Shopify computes *per-market fulfillable* availability when a query carries
// the `@inContext(country: …)` directive (Storefront API 2024-04+). Querying
// products in the store's market keeps the app's "in stock" / "Add to Cart"
// state consistent with what checkout will actually sell — without it, a
// product can read available with no context yet be sold out at checkout.
//
// This store's only market is the US. Override with SHOPIFY_MARKET_COUNTRY
// (a Shopify CountryCode / ISO 3166-1 alpha-2 value, e.g. "CA") if the
// primary market ever changes. The value is interpolated into the query as an
// enum literal, so it must be two uppercase letters; anything else falls back
// to US.
const RAW = process.env.SHOPIFY_MARKET_COUNTRY?.trim().toUpperCase();

export const MARKET_COUNTRY = RAW && /^[A-Z]{2}$/.test(RAW) ? RAW : "US";
