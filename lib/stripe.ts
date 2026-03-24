import Stripe from "stripe";

// Stripe is nerfed for testing — only instantiate if key is present
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true })
  : (null as unknown as Stripe);
