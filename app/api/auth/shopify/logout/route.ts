import { NextResponse } from "next/server";

import { buildLogoutUrl } from "@/lib/shopify/customer-oauth";
import {
  clearCustomerTokens,
  getCustomerTokens,
} from "@/lib/store/customer-cookies";

export async function GET() {
  // Read the stored id_token before clearing — Shopify's RP-initiated logout
  // requires it as `id_token_hint` ("Invalid id_token" otherwise).
  const tokens = await getCustomerTokens();
  const logoutUrl = buildLogoutUrl({ idToken: tokens?.idToken });

  // Clear all customer cookies, then bounce to Shopify to end the SSO session.
  await clearCustomerTokens();

  return NextResponse.redirect(logoutUrl);
}
