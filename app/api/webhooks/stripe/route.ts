import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only process paid sessions
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const metadata = session.metadata || {};

    try {
      await convex.mutation(api.orders.createFromPayment, {
        sessionId: metadata.sessionId || "",
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id || "",
        contactName: metadata.contactName || "",
        contactEmail: metadata.contactEmail || session.customer_email || "",
        contactPhone: metadata.contactPhone || undefined,
        shippingAddress: {
          street: metadata.shippingStreet || "",
          city: metadata.shippingCity || "",
          state: metadata.shippingState || "",
          zip: metadata.shippingZip || "",
        },
      });
    } catch (error) {
      console.error("Failed to create order from payment:", error);
      return NextResponse.json(
        { error: "Order creation failed" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
