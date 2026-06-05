import { type NextRequest, NextResponse } from "next/server";

import {
  APP_BASE_URL,
  exchangeCodeForTokens,
} from "@/lib/shopify/customer-oauth";
import {
  clearAuthState,
  getAuthState,
  setCustomerTokens,
} from "@/lib/store/customer-cookies";

const SIGN_IN_URL = "/account/sign-in";

function signInError(message: string): NextResponse {
  return NextResponse.redirect(
    new URL(`${SIGN_IN_URL}?error=${encodeURIComponent(message)}`, APP_BASE_URL)
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const urlState = searchParams.get("state");

  // Shopify returned an error
  if (error) {
    return signInError(error);
  }

  // Missing required params
  if (!(code && urlState)) {
    return signInError("Missing code or state from Shopify callback.");
  }

  // Read + consume the stored handshake (PKCE verifier + nonce state)
  const authState = await getAuthState();
  await clearAuthState();

  if (!authState) {
    return signInError("No auth state found. Please try signing in again.");
  }

  // CSRF check — stored state must match the state returned by Shopify
  if (authState.state !== urlState) {
    return signInError("State mismatch. Please try signing in again.");
  }

  try {
    const tokens = await exchangeCodeForTokens({
      code,
      verifier: authState.verifier,
    });

    await setCustomerTokens({
      accessToken: tokens.access_token,
      // expires_in is seconds from now
      expiresAt: Date.now() + tokens.expires_in * 1000,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
    });

    return NextResponse.redirect(new URL("/account", APP_BASE_URL));
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Token exchange failed.";
    return signInError(message);
  }
}
