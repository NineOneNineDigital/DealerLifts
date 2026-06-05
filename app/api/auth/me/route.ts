import { NextResponse } from "next/server";

import { getCustomer } from "@/lib/shopify/queries/customer";

export async function GET() {
  try {
    const customer = await getCustomer({ ordersFirst: 0 });

    if (!customer) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        displayName: customer.displayName,
        email: customer.email,
        firstName: customer.firstName,
        id: customer.id,
        lastName: customer.lastName,
      },
    });
  } catch {
    // Any error (unauthenticated, network, etc.) → treat as "not signed in"
    return NextResponse.json({ user: null });
  }
}
