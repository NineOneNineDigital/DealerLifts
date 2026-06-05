import { NextResponse } from "next/server";

import { buildAuthorizationUrl } from "@/lib/shopify/customer-oauth";
import { setAuthState } from "@/lib/store/customer-cookies";

export async function GET() {
  // buildAuthorizationUrl generates verifier, challenge, state, and the full URL
  const { url, state, verifier } = await buildAuthorizationUrl({});

  // Persist the state + verifier in short-lived httpOnly cookies for CSRF check
  await setAuthState(state, verifier);

  return NextResponse.redirect(url);
}
