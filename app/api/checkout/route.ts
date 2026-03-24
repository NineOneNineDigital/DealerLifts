import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, contactName, contactEmail, contactPhone, shippingAddress } = body;

    if (!sessionId || !contactName || !contactEmail || !shippingAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Fetch cart items from Convex
    const cartItems = await convex.query(api.cart.getItems, { sessionId });

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Build Stripe line items from cart (prices are in cents)
    const lineItems = cartItems.map((item) => {
      const price = item.product?.mapPrice || item.product?.retailPrice || 0;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product?.title || "Product",
            description: item.product?.partNumber
              ? `Part # ${item.product.partNumber}`
              : undefined,
            images: item.product?.thumbnail ? [item.product.thumbnail] : [],
          },
          unit_amount: price, // already in cents
        },
        quantity: item.quantity,
      };
    });

    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: contactEmail,
      metadata: {
        sessionId,
        contactName,
        contactEmail,
        contactPhone: contactPhone || "",
        shippingStreet: shippingAddress.street,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingZip: shippingAddress.zip,
      },
      success_url: `${origin}/store/checkout/confirmation?stripe_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/store/checkout`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
