import { NextRequest, NextResponse } from "next/server";
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

    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Stripe nerfed for testing — create order directly
    const result = await convex.mutation(api.orders.create, {
      sessionId,
      contactName,
      contactEmail,
      contactPhone: contactPhone || undefined,
      shippingAddress,
    });

    return NextResponse.json({
      url: `${origin}/store/checkout/confirmation?order=${result.orderNumber}`,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
