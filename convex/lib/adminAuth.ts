import type {
  ActionCtx,
  MutationCtx,
  QueryCtx,
} from "../_generated/server";

// Roles arrive on the identity via the Clerk JWT template's
// `metadata` claim (configured to map from user.public_metadata).
// See types/globals.d.ts for the matching CustomJwtSessionClaims shape.
type AdminIdentity = { metadata?: { role?: string } };

export async function requireAdmin(
  ctx: QueryCtx | MutationCtx | ActionCtx,
): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized: admin sign-in required");
  }
  const role = (identity as unknown as AdminIdentity).metadata?.role;
  if (role !== "admin") {
    throw new Error("Forbidden: admin role required");
  }
}
