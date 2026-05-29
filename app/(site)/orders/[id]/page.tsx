import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconPackage,
  IconTruck,
  IconCreditCard,
} from "@tabler/icons-react";
import { getCustomerOrder } from "@/lib/shopify/queries/customer";
import { CustomerNotAuthenticatedError } from "@/lib/shopify/customer-account-client";

export const metadata = {
  title: "Order Detail | DealerLifts",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
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

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const orderId = decodeURIComponent(id);

  let order;
  try {
    order = await getCustomerOrder(orderId);
  } catch (err) {
    if (err instanceof CustomerNotAuthenticatedError) {
      redirect("/account/sign-in");
    }
    throw err;
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Back */}
        <Link
          href="/orders"
          className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <IconArrowLeft size={14} />
          Order History
        </Link>

        {/* Order header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-900">
              {order.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Placed {formatDate(order.processedAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor(order.fulfillmentStatus)}`}
            >
              {order.fulfillmentStatus.replace(/_/g, " ").toLowerCase()}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor(order.financialStatus)}`}
            >
              {order.financialStatus.replace(/_/g, " ").toLowerCase()}
            </span>
          </div>
        </div>

        {/* Summary card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="space-y-3">
            {/* Fulfillment */}
            <div className="flex items-center gap-3 text-sm">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#077BFF]/10 text-[#077BFF]">
                <IconTruck size={16} />
              </span>
              <div>
                <p className="font-medium text-gray-900">Fulfillment</p>
                <p className="capitalize text-gray-500">
                  {order.fulfillmentStatus.replace(/_/g, " ").toLowerCase()}
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Payment */}
            <div className="flex items-center gap-3 text-sm">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#077BFF]/10 text-[#077BFF]">
                <IconCreditCard size={16} />
              </span>
              <div>
                <p className="font-medium text-gray-900">Payment</p>
                <p className="capitalize text-gray-500">
                  {order.financialStatus.replace(/_/g, " ").toLowerCase()}
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Total */}
            <div className="flex items-center gap-3 text-sm">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#077BFF]/10 text-[#077BFF]">
                <IconPackage size={16} />
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Order Total</p>
              </div>
              <p className="font-bold text-gray-900">
                {formatMoney(
                  order.totalPrice.amount,
                  order.totalPrice.currencyCode
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 text-center">
          <Link
            href="/store"
            className="inline-block rounded-lg bg-[#077BFF] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0066dd]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
