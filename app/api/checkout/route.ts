import { randomBytes } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { chargePaymentNonce } from "@/lib/authorize-net";
import { checkoutSchema } from "@/lib/store/validators";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const opaqueDataSchema = z.object({
  dataDescriptor: z.string().min(1),
  dataValue: z.string().min(1),
});

const requestSchema = z
  .object({
    sessionId: z.string().min(1),
    opaqueData: opaqueDataSchema,
    shippingAddress: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      zip: z.string().min(5),
    }),
  })
  .merge(checkoutSchema.pick({ name: true, email: true, phone: true }));

const MAX_TOTAL_CENTS = 5_000_000;

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) {
    return false;
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const allowed = new Set<string>();
  if (siteUrl) {
    allowed.add(siteUrl);
  }
  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }
  return allowed.has(origin);
}

function genericErrorFor(code: string, description: string): string {
  const desc = description.toLowerCase();
  if (
    desc.includes("declined") ||
    desc.includes("insufficient") ||
    desc.includes("expired") ||
    code === "2" ||
    code === "3" ||
    code === "4"
  ) {
    return "Payment was declined. Please try another card.";
  }
  if (
    desc.includes("invalid") ||
    desc.includes("incorrect") ||
    desc.includes("avs")
  ) {
    return "Card information is invalid. Please check the number, expiration, and ZIP code.";
  }
  return "Payment processing is temporarily unavailable. Please try again in a moment.";
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!isAllowedOrigin(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const internalToken = process.env.CHECKOUT_INTERNAL_TOKEN;
  if (!internalToken) {
    console.error("CHECKOUT_INTERNAL_TOKEN is not configured");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }

  const {
    sessionId,
    name: contactName,
    email: contactEmail,
    phone: contactPhone,
    shippingAddress,
    opaqueData,
  } = parsed.data;

  try {
    const cartItems = await convex.query(api.cart.getItems, { sessionId });
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Stock validation — fail closed before touching the payment processor
    const productIds = cartItems.map(
      (item: { productId: Id<"products"> }) => item.productId
    );
    const inventoryMap = await convex.query(api.inventory.getByProductIds, {
      productIds,
    });

    const outOfStockPartNumbers: string[] = [];
    for (const item of cartItems as Array<{
      productId: Id<"products">;
      quantity: number;
      product: { partNumber?: string } | null;
    }>) {
      const inv = inventoryMap[item.productId];
      if (!inv?.isInStock || item.quantity > inv.totalStock) {
        outOfStockPartNumbers.push(item.product?.partNumber ?? item.productId);
      }
    }

    if (outOfStockPartNumbers.length > 0) {
      return NextResponse.json(
        {
          error:
            "One or more items in your cart are no longer available. Please review your cart.",
          outOfStockItems: outOfStockPartNumbers,
        },
        { status: 409 }
      );
    }

    const total = cartItems.reduce(
      (
        sum: number,
        item: {
          product: { mapPrice?: number; retailPrice?: number } | null;
          quantity: number;
        }
      ) => {
        const price = item.product?.mapPrice || item.product?.retailPrice || 0;
        return sum + price * item.quantity;
      },
      0
    );

    if (!Number.isInteger(total) || total <= 0) {
      return NextResponse.json(
        { error: "Invalid order total" },
        { status: 400 }
      );
    }
    if (total > MAX_TOTAL_CENTS) {
      return NextResponse.json(
        { error: "Order exceeds maximum allowed amount" },
        { status: 400 }
      );
    }

    const nameParts = contactName.trim().split(/\s+/);
    const firstName = nameParts[0] || contactName;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ".";

    const orderNumber = `DL-${Date.now().toString(36).toUpperCase()}-${randomBytes(4).toString("hex").toUpperCase()}`;

    const txResult = await chargePaymentNonce(opaqueData, total, orderNumber, {
      email: contactEmail,
      firstName,
      lastName,
    });

    if (!txResult.success) {
      console.error("Authorize.net decline:", {
        code: txResult.messageCode,
        description: txResult.description,
        orderNumber,
      });
      return NextResponse.json(
        { error: genericErrorFor(txResult.messageCode, txResult.description) },
        { status: 400 }
      );
    }

    try {
      const result = await convex.mutation(api.orders.createFromPayment, {
        internalToken,
        sessionId,
        orderNumber,
        authnetTransactionId: txResult.transactionId,
        contactName,
        contactEmail,
        contactPhone: contactPhone || undefined,
        shippingAddress,
        expectedTotal: total,
        flagged: txResult.manualReview || undefined,
        flagReason: txResult.manualReview
          ? `AVS=${txResult.avsCheck ? "ok" : "fail"} CVV=${txResult.cvvCheck ? "ok" : "fail"}`
          : undefined,
      });

      return NextResponse.json({
        url: `${origin}/store/checkout/confirmation?order=${result.orderNumber}`,
      });
    } catch (orderErr) {
      console.error("PAYMENT_RECONCILIATION_REQUIRED", {
        transactionId: txResult.transactionId,
        sessionId,
        total,
        orderNumber,
        error: orderErr instanceof Error ? orderErr.message : String(orderErr),
      });
      return NextResponse.json(
        {
          error:
            "Your payment was received, but we hit a snag saving your order. Please contact us with this transaction ID: " +
            txResult.transactionId,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(
      "Checkout error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
