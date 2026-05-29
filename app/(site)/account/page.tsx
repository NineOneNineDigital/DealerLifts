import { redirect } from "next/navigation";
import Link from "next/link";
import {
  IconPackage,
  IconMapPin,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";
import { getCustomer } from "@/lib/shopify/queries/customer";
import { CustomerNotAuthenticatedError } from "@/lib/shopify/customer-account-client";

export const metadata = {
  title: "My Account | DealerLifts",
  description: "Manage your DealerLifts account",
};

export default async function AccountPage() {
  let customer;
  try {
    customer = await getCustomer({ ordersFirst: 0 });
  } catch (err) {
    if (err instanceof CustomerNotAuthenticatedError) {
      redirect("/account/sign-in");
    }
    throw err;
  }

  const displayName = customer.displayName || customer.firstName || "Customer";
  const addr = customer.defaultAddress;

  return (
    <div className="pt-32 md:pt-40">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#077BFF] text-sm font-bold text-white">
                {(customer.firstName?.[0] || customer.displayName?.[0] || "U").toUpperCase()}
              </span>
              <h1 className="font-heading text-2xl font-bold text-gray-900">
                {displayName}
              </h1>
            </div>
            {customer.email && (
              <p className="ml-13 pl-0.5 text-sm text-gray-500">
                {customer.email}
              </p>
            )}
          </div>
          <a
            href="/api/auth/shopify/logout"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <IconLogout size={14} />
            Sign Out
          </a>
        </div>

        {/* Quick-action cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/orders"
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#077BFF]/10 text-[#077BFF] transition-colors group-hover:bg-[#077BFF] group-hover:text-white">
              <IconPackage size={20} />
            </span>
            <div>
              <p className="font-semibold text-gray-900">My Orders</p>
              <p className="text-xs text-gray-500">View order history &amp; tracking</p>
            </div>
          </Link>

          <Link
            href="/account/addresses"
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#077BFF]/10 text-[#077BFF] transition-colors group-hover:bg-[#077BFF] group-hover:text-white">
              <IconMapPin size={20} />
            </span>
            <div>
              <p className="font-semibold text-gray-900">Addresses</p>
              <p className="text-xs text-gray-500">Manage saved addresses</p>
            </div>
          </Link>
        </div>

        {/* Default address */}
        {addr && (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              <IconMapPin size={14} />
              Default Address
            </h2>
            <address className="not-italic text-sm text-gray-700 leading-relaxed">
              {(addr.firstName || addr.lastName) && (
                <span className="font-medium">
                  {[addr.firstName, addr.lastName].filter(Boolean).join(" ")}
                  <br />
                </span>
              )}
              {addr.company && <>{addr.company}<br /></>}
              {addr.address1 && <>{addr.address1}<br /></>}
              {addr.address2 && <>{addr.address2}<br /></>}
              {[addr.city, addr.province, addr.zip].filter(Boolean).join(", ")}
              {addr.country && <><br />{addr.country}</>}
            </address>
          </div>
        )}

        {/* Profile info */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            <IconUser size={14} />
            Profile
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-gray-900">
                {[customer.firstName, customer.lastName].filter(Boolean).join(" ") || "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900">{customer.email || "—"}</dd>
            </div>
            {customer.phone && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Phone</dt>
                <dd className="font-medium text-gray-900">{customer.phone}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
