import { redirect } from "next/navigation";
import Link from "next/link";
import { IconPackage, IconChevronRight, IconArrowLeft } from "@tabler/icons-react";
import { getCustomerOrders } from "@/lib/shopify/queries/customer";
import { CustomerNotAuthenticatedError } from "@/lib/shopify/customer-account-client";
import type { CustomerOrderConnection } from "@/lib/shopify/types";

export const metadata = {
  title: "My Orders | DealerLifts",
  description: "View your DealerLifts order history",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    currency: currencyCode,
    style: "currency",
  }).format(parseFloat(amount));
}

function statusColor(status: string) {
  const s = status.toLowerCase();
  if (s.includes("fulfilled") || s.includes("delivered") || s.includes("paid")) {
    return "bg-green-100 text-green-700";
  }
  if (s.includes("unfulfilled") || s.includes("pending")) {
    return "bg-yellow-100 text-yellow-700";
  }
  if (s.includes("cancel") || s.includes("refund")) {
    return "bg-red-100 text-red-700";
  }
  return "bg-gray-100 text-gray-600";
}

export default async function OrdersPage() {
  let ordersConnection: CustomerOrderConnection;
  try {
    ordersConnection = await getCustomerOrders({ first: 25 });
  } catch (err) {
    if (err instanceof CustomerNotAuthenticatedError) {
      redirect("/account/sign-in");
    }
    throw err;
  }

  const orders = ordersConnection.nodes;

  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Back + header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
          >
            <IconArrowLeft size={14} />
            My Account
          </Link>
          <h1 className="font-heading text-2xl font-bold text-gray-900">
            Order History
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {orders.length === 0
              ? "No orders yet"
              : `${orders.length} order${orders.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
            <IconPackage size={40} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium text-gray-700">No orders yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Place your first order in our store.
            </p>
            <Link
              href="/store"
              className="mt-6 inline-block rounded-lg bg-[#077BFF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0066dd]"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => {
              const encodedId = encodeURIComponent(order.id);
              return (
                <li key={order.id}>
                  <Link
                    href={`/orders/${encodedId}`}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#077BFF]/10 text-[#077BFF]">
                        <IconPackage size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          {order.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.processedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-3">
                      <div className="hidden sm:block text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatMoney(
                            order.totalPrice.amount,
                            order.totalPrice.currencyCode
                          )}
                        </p>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${statusColor(order.fulfillmentStatus)}`}
                        >
                          {order.fulfillmentStatus.replace(/_/g, " ").toLowerCase()}
                        </span>
                      </div>
                      <IconChevronRight
                        size={16}
                        className="text-gray-400 transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
