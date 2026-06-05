import { NextResponse } from "next/server";

import { buildLogoutUrl } from "@/lib/shopify/customer-oauth";
import { clearCustomerTokens } from "@/lib/store/customer-cookies";

export async function GET() {
  // Clear all customer tokens from cookies
  await clearCustomerTokens();

  // Redirect to Shopify's logout endpoint to also clear the Shopify SSO session.
  // We don't store the id_token separately, so we use the parameterless form;
  // Shopify will still clear its session and redirect back to the app URL.
  const logoutUrl = buildLogoutUrl();

  return NextResponse.redirect(logoutUrl);
}
